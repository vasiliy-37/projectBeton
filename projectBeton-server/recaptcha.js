const https = require('https');

/**
 * Проверка Google reCAPTCHA v3. Если RECAPTCHA_SECRET_KEY не задан в .env — проверка пропускается (удобно для dev).
 * @param {string|undefined} token — поле recaptchaToken из тела запроса
 * @param {number} [minScore=0.3] — порог score (0..1)
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string }>}
 */
async function verifyRecaptchaV3(token, minScore = 0.3) {
    const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
    if (!secret) {
        return { ok: true, skipped: true };
    }
    if (!token || typeof token !== 'string') {
        return { ok: false, reason: 'missing_token' };
    }

    const body = new URLSearchParams({ secret, response: token }).toString();
    /** Без таймаута запрос к Google может «висеть» бесконечно (фаервол, сеть) — браузер показывает pending. */
    const CONNECT_MS = 10000;
    const RESPONSE_BODY_MS = 10000;

    return new Promise((resolve) => {
        let settled = false;
        const done = (result) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        let req;
        try {
            req = https.request(
                {
                    hostname: 'www.google.com',
                    path: '/recaptcha/api/siteverify',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(body),
                    },
                },
                (res) => {
                    res.setTimeout(RESPONSE_BODY_MS, () => {
                        res.destroy();
                        done({ ok: false, reason: 'timeout' });
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
                                return done({ ok: false, reason: 'verify_failed' });
                            }
                            const score = typeof data.score === 'number' ? data.score : 1;
                            if (score < minScore) {
                                return done({ ok: false, reason: 'low_score' });
                            }
                            done({ ok: true });
                        } catch {
                            done({ ok: false, reason: 'parse_error' });
                        }
                    });
                    res.on('error', () => done({ ok: false, reason: 'network' }));
                },
            );
        } catch {
            return done({ ok: false, reason: 'network' });
        }

        req.setTimeout(CONNECT_MS, () => {
            req.destroy();
            done({ ok: false, reason: 'timeout' });
        });
        req.on('error', () => done({ ok: false, reason: 'network' }));
        req.write(body);
        req.end();
    });
}

module.exports = { verifyRecaptchaV3 };
