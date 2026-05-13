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

    return new Promise((resolve) => {
        const req = https.request(
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
                let raw = '';
                res.on('data', (chunk) => {
                    raw += chunk;
                });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(raw);
                        if (!data.success) {
                            return resolve({ ok: false, reason: 'verify_failed' });
                        }
                        const score = typeof data.score === 'number' ? data.score : 1;
                        if (score < minScore) {
                            return resolve({ ok: false, reason: 'low_score' });
                        }
                        resolve({ ok: true });
                    } catch {
                        resolve({ ok: false, reason: 'parse_error' });
                    }
                });
            },
        );
        req.on('error', () => resolve({ ok: false, reason: 'network' }));
        req.write(body);
        req.end();
    });
}

module.exports = { verifyRecaptchaV3 };
