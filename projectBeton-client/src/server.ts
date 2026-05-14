import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { existsSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';

function isIpv4External(addr: { family: string | number; internal?: boolean }): boolean {
  const fam = addr.family;
  if (fam !== 'IPv4' && fam !== 4) {
    return false;
  }
  return !addr.internal;
}

/**
 * Доверенные Host для SSR (защита от SSRF). Angular читает `process.env.NG_ALLOWED_HOSTS` (через запятую).
 *
 * Локально: если переменная не задана — localhost + IPv4 LAN (иначе с телефона по Wi‑Fi SSR отклоняет Host).
 *
 * ПРОДАКШЕН: обязательно задайте NG_ALLOWED_HOSTS с вашим доменом (и при необходимости www),
 * например: NG_ALLOWED_HOSTS=projectbeton.ru,www.projectbeton.ru
 * Учитывайте Host / X-Forwarded-Host от nginx.
 */
function ensureNgAllowedHostsForSsr(): void {
  if (process.env['NG_ALLOWED_HOSTS']?.trim()) {
    return;
  }
  if (process.env['NODE_ENV'] === 'production') {
    console.warn(
      '[SSR] Задайте NG_ALLOWED_HOSTS (домены через запятую), иначе возможен пустой HTML в <app-root> или отказ SSR.'
    );
    return;
  }
  const hosts = new Set<string>(['localhost', '127.0.0.1']);
  for (const list of Object.values(networkInterfaces())) {
    for (const addr of list ?? []) {
      if (isIpv4External(addr)) {
        hosts.add(addr.address);
      }
    }
  }
  process.env['NG_ALLOWED_HOSTS'] = [...hosts].join(',');
}

ensureNgAllowedHostsForSsr();

const browserDistFolder = join(import.meta.dirname, '../browser');
const indexHtmlPath = join(browserDistFolder, 'index.html');

function shouldServeSpaFallback(req: express.Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }
  if (req.path.startsWith('/api')) {
    return false;
  }
  const pathOnly = (req.path.split('?')[0] ?? '').trim();
  if (/\.[a-z0-9]+$/i.test(pathOnly)) {
    return false;
  }
  return true;
}

const app = express();

/** За Nginx / балансировщиком — чтобы корректны IP и (при необходимости) secure-куки */
if (process.env['NODE_ENV'] === 'production' || process.env['TRUST_PROXY'] === '1') {
  app.set('trust proxy', 1);
}

const angularApp = new AngularNodeAppEngine();

/** Куда проксировать /api (projectBeton-server). При SSR без этого бэкенд «не виден» — пустой прайс и телефон в HTML. */
function resolveApiOrigin(): string {
  const fromEnv = process.env['API_ORIGIN']?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const port = process.env['BACKEND_PORT']?.trim();
  if (port) {
    return `http://127.0.0.1:${port}`;
  }
  return 'http://127.0.0.1:3000';
}

const apiOrigin = resolveApiOrigin();
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  console.log(`[SSR] Прокси /api → ${apiOrigin} (задайте API_ORIGIN или BACKEND_PORT, если порт не 3000)`);
  console.log(`[SSR] Прокси /uploads: pathFilter (полный путь) → ${apiOrigin}`);
}

/** Картинки работ: целиком /uploads/... → API. Без mount: иначе Express/HPM иногда шлёт на API только /works/... → 302 с фронта. */
app.use(
  createProxyMiddleware({
    pathFilter: (pathname) => pathname.startsWith('/uploads'),
    target: apiOrigin,
    changeOrigin: true,
  }),
);

app.use(
  '/api',
  createProxyMiddleware({
    target: apiOrigin,
    changeOrigin: true,
    // Express removes '/api' from req.url for mounted middleware.
    // Backend routes are defined as '/api/...', so add prefix back.
    pathRewrite: (path) => `/api${path}`,
  }),
);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
        return;
      }
      if (shouldServeSpaFallback(req) && existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath, (err) => (err ? next(err) : undefined));
        return;
      }
      next();
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  /** 0.0.0.0 — доступ с телефона по Wi‑Fi (LAN); для только localhost: LISTEN_HOST=127.0.0.1 */
  const host = process.env['LISTEN_HOST']?.trim() || '0.0.0.0';
  app.listen(Number(port), host, (error) => {
    if (error) {
      throw error;
    }

    console.log(`[SSR] http://${host === '0.0.0.0' ? 'localhost' : host}:${port} (LAN: задайте NG_ALLOWED_HOSTS с IP ПК)`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
