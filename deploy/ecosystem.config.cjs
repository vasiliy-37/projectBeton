/**
 * Пример PM2: из каталога projectBeton-main выполнить
 *   pm2 start deploy/ecosystem.config.cjs
 * Перед этим: npm run build в projectBeton-client, в обоих проектах npm ci.
 * Переменные окружения — через .env в каждой папке или блок `env` у приложения.
 * Для SSR за Nginx добавьте у приложения projectbeton-ssr, например:
 *   env: { NODE_ENV: 'production', TRUST_PROXY: '1', API_ORIGIN: 'http://127.0.0.1:3000', NG_ALLOWED_HOSTS: 'example.ru,www.example.ru' }
 */
const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'projectbeton-api',
      cwd: path.join(root, 'projectBeton-server'),
      script: 'server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
    {
      name: 'projectbeton-ssr',
      cwd: path.join(root, 'projectBeton-client'),
      script: path.join(root, 'projectBeton-client', 'dist', 'projectBeton-client', 'server', 'server.mjs'),
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
    },
  ],
};
