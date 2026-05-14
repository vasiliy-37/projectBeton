import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { SMARTCAPTCHA_CLIENT_KEY } from './smartcaptcha-client-key';

declare global {
  interface Window {
    smartCaptcha?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          hl?: string;
          callback?: (token: string) => void;
        },
      ) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      destroy: (widgetId?: number) => void;
    };
  }
}

export type SmartCaptchaSlot = 'order' | 'callback';

@Injectable({ providedIn: 'root' })
export class SmartCaptchaService {
  private readonly platformId = inject(PLATFORM_ID);
  private scriptLoad: Promise<void> | null = null;
  private readonly widgetIds = new Map<SmartCaptchaSlot, number>();
  private runtimeClientKey: string | undefined = undefined;
  private runtimeClientKeyPromise: Promise<string> | null = null;

  /** Публичный ключ для виджета. */
  async resolveClientKey(): Promise<string> {
    const compiled = SMARTCAPTCHA_CLIENT_KEY?.trim();
    if (compiled) {
      return compiled;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    if (this.runtimeClientKey !== undefined) {
      return this.runtimeClientKey;
    }
    if (!this.runtimeClientKeyPromise) {
      this.runtimeClientKeyPromise = fetch('/config/smartcaptcha.json', { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : { clientKey: '' }))
        .then((j: { clientKey?: string }) => String(j?.clientKey ?? '').trim())
        .catch(() => '');
    }
    this.runtimeClientKey = await this.runtimeClientKeyPromise;
    return this.runtimeClientKey;
  }

  /** Подключить скрипт и отрисовать виджет в контейнере. */
  async initSlot(slot: SmartCaptchaSlot, host: HTMLElement): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const sitekey = await this.resolveClientKey();
    if (!sitekey) {
      return;
    }
    try {
      await this.loadScript();
    } catch {
      console.warn('[SmartCaptcha] скрипт не загрузился (сеть / блокировщик / CSP)');
      return;
    }
    const sc = window.smartCaptcha;
    if (!sc) {
      return;
    }
    this.destroySlot(slot);
    host.replaceChildren();
    const id = sc.render(host, { sitekey, hl: 'ru' });
    this.widgetIds.set(slot, id);
  }

  destroySlot(slot: SmartCaptchaSlot): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const id = this.widgetIds.get(slot);
    const sc = window.smartCaptcha;
    if (id === undefined || !sc) {
      this.widgetIds.delete(slot);
      return;
    }
    try {
      sc.destroy(id);
    } catch {
      /* ignore */
    }
    this.widgetIds.delete(slot);
  }

  getToken(slot: SmartCaptchaSlot): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    const sc = window.smartCaptcha;
    const id = this.widgetIds.get(slot);
    if (!sc || id === undefined) {
      return '';
    }
    try {
      return sc.getResponse(id)?.trim() || '';
    } catch {
      return '';
    }
  }

  resetSlot(slot: SmartCaptchaSlot): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const sc = window.smartCaptcha;
    const id = this.widgetIds.get(slot);
    if (!sc || id === undefined) {
      return;
    }
    try {
      sc.reset(id);
    } catch {
      /* ignore */
    }
  }

  private loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    if (window.smartCaptcha) {
      return Promise.resolve();
    }
    if (this.scriptLoad) {
      return this.scriptLoad;
    }
    this.scriptLoad = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://smartcaptcha.yandexcloud.net/captcha.js';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        this.scriptLoad = null;
        reject(new Error('smartcaptcha_script_load_failed'));
      };
      document.head.appendChild(s);
    });
    return this.scriptLoad;
  }
}
