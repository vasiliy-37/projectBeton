import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { RECAPTCHA_V3_SITE_KEY } from './recaptcha-site-key';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scriptPromises = new Map<string, Promise<void>>();
  /** undefined — ещё не пытались; иначе итог последнего разрешения ключа (в т.ч. пустая строка). */
  private runtimeSiteKey: string | undefined = undefined;
  private runtimeSiteKeyPromise: Promise<string> | null = null;

  /** Токен для бэкенда; при недоступности скриптов Google — пустая строка (без исключения). */
  async execute(action: string): Promise<string> {
    const siteKey = await this.resolveSiteKey();
    if (!isPlatformBrowser(this.platformId) || !siteKey) {
      return '';
    }
    const timeoutMs = 15000;
    const token = await Promise.race([
      this.runExecute(action, siteKey),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), timeoutMs)),
    ]);
    return typeof token === 'string' ? token : '';
  }

  /** Сначала константа из репозитория, иначе публичный ключ из SSR: `/config/recaptcha.json`. */
  private async resolveSiteKey(): Promise<string> {
    const compiled = RECAPTCHA_V3_SITE_KEY?.trim();
    if (compiled) {
      return compiled;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    if (this.runtimeSiteKey !== undefined) {
      return this.runtimeSiteKey;
    }
    if (!this.runtimeSiteKeyPromise) {
      this.runtimeSiteKeyPromise = fetch('/config/recaptcha.json', { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : { siteKey: '' }))
        .then((j: { siteKey?: string }) => String(j?.siteKey ?? '').trim())
        .catch(() => '');
    }
    this.runtimeSiteKey = await this.runtimeSiteKeyPromise;
    return this.runtimeSiteKey;
  }

  private async runExecute(action: string, siteKey: string): Promise<string> {
    try {
      await this.loadScript(siteKey);
    } catch {
      console.warn('[RecaptchaService] скрипт reCAPTCHA не загрузился (сеть / блокировщик / CSP)');
      return '';
    }
    return new Promise((resolve) => {
      const g = window.grecaptcha;
      if (!g) {
        resolve('');
        return;
      }
      g.ready(() => {
        g.execute(siteKey, { action })
          .then((token) => resolve(token))
          .catch(() => resolve(''));
      });
    });
  }

  /** Сначала recaptcha.net (лучше доходит из РФ), при ошибке — google.com. */
  private loadScript(siteKey: string): Promise<void> {
    let p = this.scriptPromises.get(siteKey);
    if (p) {
      return p;
    }
    p = new Promise((resolve, reject) => {
      const sel = `script[data-recaptcha-v3][data-site-key="${siteKey}"]`;
      if (document.querySelector(sel)) {
        resolve();
        return;
      }
      const hosts = ['www.recaptcha.net', 'www.google.com'];
      const attempt = (index: number) => {
        if (index >= hosts.length) {
          reject(new Error('recaptcha_script_load_failed'));
          return;
        }
        const host = hosts[index];
        const s = document.createElement('script');
        s.src = `https://${host}/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        s.async = true;
        s.defer = true;
        s.setAttribute('data-recaptcha-v3', '1');
        s.setAttribute('data-site-key', siteKey);
        s.setAttribute('data-recaptcha-host', host);
        s.onload = () => resolve();
        s.onerror = () => {
          s.remove();
          attempt(index + 1);
        };
        document.head.appendChild(s);
      };
      attempt(0);
    });
    this.scriptPromises.set(siteKey, p);
    void p.catch(() => this.scriptPromises.delete(siteKey));
    return p;
  }
}
