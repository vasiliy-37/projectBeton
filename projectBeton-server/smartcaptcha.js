const https = require('https');

/**
 * IP клиента за nginx (trust proxy должен быть включён в production).
 * @param {import('express').Request} req
 */
function getClientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
        return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff[0]) {
        return String(xff[0]).split(',')[0].trim();
    }
    const ip = req.ip || req.socket?.remoteAddress || '';
    return String(ip).replace(/^::ffff:/, '');
}

/**
 * Яндекс SmartCaptcha. Если SMARTCAPTCHA_SERVER_KEY не задан — проверка пропускается.
 * Пустой токен: SMARTCAPTCHA_ALLOW_NO_CLIENT_TOKEN=true (риск спама) или уберите серверный ключ.
 *
 * @param {string|undefined} token — в теле запроса поле recaptchaToken (строка от виджета)
 * @param {string} [clientIp='']
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string, message?: string }>}
 */
async function verifySmartCaptchaToken(token, clientIp = '') {
    const secret = process.env.SMARTCAPTCHA_SERVER_KEY?.trim();
    if (!secret) {
        return { ok: true, skipped: true };
    }
    const permissiveNoToken =
        process.env.SMARTCAPTCHA_ALLOW_NO_CLIENT_TOKEN === 'true' ||
        process.env.SMARTCAPTCHA_ALLOW_NO_CLIENT_TOKEN === '1';
    const tokenStr = typeof token === 'string' ? token.trim() : '';
    if (!tokenStr) {
        if (permissiveNoToken) {
            console.warn('[smartcaptcha] missing token accepted (SMARTCAPTCHA_ALLOW_NO_CLIENT_TOKEN)');
            return { ok: true, skipped: true, reason: 'permissive_no_token' };
        }
        return { ok: false, reason: 'missing_token' };
    }

    const body = new URLSearchParams({
        secret,
        token: tokenStr,
        ip: (clientIp && String(clientIp).trim()) || '',
    }).toString();

    return new Promise((resolve) => {
        let settled = false;
        const finish = (out) => {
            if (settled) return;
            settled = true;
            resolve(out);
        };

        const httpReq = https.request(
            {
                hostname: 'smartcaptcha.yandexcloud.net',
                path: '/validate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body),
                },
                timeout: 10000,
            },
            (httpRes) => {
                let raw = '';
                httpRes.on('data', (chunk) => {
                    raw += chunk;
                });
                httpRes.on('end', () => {
                    if (settled) return;
                    if (httpRes.statusCode !== 200) {
                        console.warn('[smartcaptcha] validate HTTP', httpRes.statusCode, raw.slice(0, 300));
                        finish({ ok: false, reason: 'validate_http' });
                        return;
                    }
                    try {
                        const data = JSON.parse(raw);
                        if (data.status === 'ok') {
                            finish({ ok: true });
                        } else {
                            finish({
                                ok: false,
                                reason: 'verify_failed',
                                message: typeof data.message === 'string' ? data.message : '',
                            });
                        }
                    } catch {
                        finish({ ok: false, reason: 'parse_error' });
                    }
                });
                httpRes.on('error', () => finish({ ok: false, reason: 'network' }));
            },
        );
        httpReq.on('error', (err) => {
            console.warn('[smartcaptcha] validate', err.message);
            finish({ ok: false, reason: 'network' });
        });
        httpReq.on('timeout', () => {
            httpReq.destroy();
            finish({ ok: false, reason: 'timeout' });
        });
        httpReq.write(body);
        httpReq.end();
    });
}

module.exports = { verifySmartCaptchaToken, getClientIp };
