const https = require('https');

/**
 * Проверка Google reCAPTCHA v3. Если RECAPTCHA_SECRET_KEY не задан в .env — проверка пропускается (удобно для dev).
 *
 * Если скрипт reCAPTCHA в браузере не грузится (блокировки), токен пустой. Тогда:
 * — либо уберите RECAPTCHA_SECRET_KEY,
 * — либо задайте RECAPTCHA_ALLOW_NO_CLIENT_TOKEN=true (осознанный риск спама; оставьте жёсткий rate limit).
 *
 * siteverify вызывается сначала на www.recaptcha.net, при сетевой ошибке — повтор на www.google.com.
 *
 * @param {string|undefined} token — поле recaptchaToken из тела запроса
 * @param {number} [minScore=0.3] — порог score (0..1)
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string }>}
 */
async function verifyRecaptchaV3(token, minScore = 0.3) {
    const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
    if (!secret) {
        return { ok: true, skipped: true };
    }
    const permissiveNoToken =
        process.env.RECAPTCHA_ALLOW_NO_CLIENT_TOKEN === 'true' ||
        process.env.RECAPTCHA_ALLOW_NO_CLIENT_TOKEN === '1';
    const tokenStr = typeof token === 'string' ? token.trim() : '';
    if (!tokenStr) {
        if (permissiveNoToken) {
            console.warn('[recaptcha] missing token accepted (RECAPTCHA_ALLOW_NO_CLIENT_TOKEN)');
            return { ok: true, skipped: true, reason: 'permissive_no_token' };
        }
        return { ok: false, reason: 'missing_token' };
    }

    const body = new URLSearchParams({ secret, response: tokenStr }).toString();
    const CONNECT_MS = 10000;
    const RESPONSE_BODY_MS = 10000;

    const hosts = ['www.recaptcha.net', 'www.google.com'];
    let lastTransportReason = 'timeout';

    for (const hostname of hosts) {
        const r = await siteverifyOnce(hostname, body, minScore, CONNECT_MS, RESPONSE_BODY_MS);
        if (r.done) {
            return r.result;
        }
        lastTransportReason = r.transportReason || lastTransportReason;
        console.warn(`[recaptcha] siteverify ${hostname} transport: ${lastTransportReason}, пробуем запасной хост`);
    }

    return { ok: false, reason: lastTransportReason };
}

/**
 * @returns {Promise<{ done: true, result: { ok: boolean, reason?: string } } | { done: false, transportReason: string }>}
 */
function siteverifyOnce(hostname, body, minScore, connectMs, bodyMs) {
    return new Promise((resolve) => {
        let settled = false;
        const finish = (out) => {
            if (settled) return;
            settled = true;
            resolve(out);
        };

        let req;
        try {
            req = https.request(
                {
                    hostname,
                    path: '/recaptcha/api/siteverify',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(body),
                    },
                },
                (res) => {
                    res.setTimeout(bodyMs, () => {
                        res.destroy();
                        finish({ done: false, transportReason: 'timeout' });
                    });
                    let raw = '';
                    res.on('data', (chunk) => {
                        raw += chunk;
                    });
                    res.on('end', () => {
                        if (settled) return;
                        try {
                            const data = JSON.parse(raw);
                            if (!data.success) {
                                return finish({ done: true, result: { ok: false, reason: 'verify_failed' } });
                            }
                            const score = typeof data.score === 'number' ? data.score : 1;
                            if (score < minScore) {
                                return finish({ done: true, result: { ok: false, reason: 'low_score' } });
                            }
                            finish({ done: true, result: { ok: true } });
                        } catch {
                            finish({ done: true, result: { ok: false, reason: 'parse_error' } });
                        }
                    });
                    res.on('error', () => finish({ done: false, transportReason: 'network' }));
                },
            );
        } catch {
            return finish({ done: false, transportReason: 'network' });
        }

        req.setTimeout(connectMs, () => {
            req.destroy();
            finish({ done: false, transportReason: 'timeout' });
        });
        req.on('error', () => finish({ done: false, transportReason: 'network' }));
        req.write(body);
        req.end();
    });
}

module.exports = { verifyRecaptchaV3 };
