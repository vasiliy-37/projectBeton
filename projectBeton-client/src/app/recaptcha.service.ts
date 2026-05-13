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
  private scriptPromise: Promise<void> | null = null;

  /** Токен для отправки на бэкенд; если ключ не задан или не браузер — пустая строка. */
  async execute(action: string): Promise<string> {
    const siteKey = RECAPTCHA_V3_SITE_KEY?.trim();
    if (!isPlatformBrowser(this.platformId) || !siteKey) {
      return '';
    }
    await this.loadScript();
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

  private loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise((resolve, reject) => {
      if (document.querySelector('script[data-recaptcha-v3]')) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_V3_SITE_KEY.trim())}`;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-recaptcha-v3', '1');
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('recaptcha script load failed'));
      document.head.appendChild(s);
    });
    return this.scriptPromise;
  }
}
