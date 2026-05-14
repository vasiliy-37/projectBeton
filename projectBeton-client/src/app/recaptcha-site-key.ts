/**
 * Публичный ключ reCAPTCHA v3 (его видно в браузере — так задумано у Google).
 *
 * Если здесь пусто, фронт подгружает ключ с `/config/recaptcha.json` (в Docker — из **RECAPTCHA_SITE_KEY** на `web`).
 *
 * Секретную пару (**RECAPTCHA_SECRET_KEY**) держите только в **projectBeton-server** `.env`.
 * Админка ключей: https://www.google.com/recaptcha/admin
 * Если скрипт не грузится — проверьте CSP в nginx: **deploy/nginx-recaptcha-csp-snippet.txt**
 */
export const RECAPTCHA_V3_SITE_KEY = '6LeDKOosAAAAAFCX_2tcsX70R5TdM2rZLt6OV9D0';
