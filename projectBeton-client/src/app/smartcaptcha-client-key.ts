/**
 * Клиентский ключ Яндекс SmartCaptcha (публичный).
 * Если пусто — ключ подгружается с `/config/smartcaptcha.json` (SSR: **SMARTCAPTCHA_CLIENT_KEY** в Docker для `web`).
 * Серверный ключ — только в **projectBeton-server** `.env` как **SMARTCAPTCHA_SERVER_KEY**.
 */
export const SMARTCAPTCHA_CLIENT_KEY = '';
