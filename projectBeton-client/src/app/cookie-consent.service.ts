import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

export type CookieConsentLevel = 'necessary' | 'analytics';

const STORAGE_KEY = 'betonstroy_cookie_consent_v1';
const LEGACY_STORAGE_KEY = 'projectbeton_cookie_consent_v1';
const GTM_ID = 'GTM-PJG77HNV';
const YM_ID = 109147448;

declare global {
  interface Window {
    dataLayer?: unknown[];
    ym?: (id: number, command: string, params?: Record<string, unknown>) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly platformId = inject(PLATFORM_ID);

  /** null — пользователь ещё не выбрал (показываем баннер). */
  readonly level = signal<CookieConsentLevel | null>(null);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.restoreFromStorage();
      if (this.level() === 'analytics') {
        this.loadGoogleTagManager();
        this.loadYandexMetrika();
      }
    });
  }

  acceptNecessaryOnly(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.persist('necessary');
    this.level.set('necessary');
  }

  acceptAnalytics(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.persist('analytics');
    this.level.set('analytics');
    this.loadGoogleTagManager();
    this.loadYandexMetrika();
  }

  showBanner(): boolean {
    return isPlatformBrowser(this.platformId) && this.level() === null;
  }

  private restoreFromStorage(): void {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== 'necessary' && raw !== 'analytics') {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw === 'necessary' || raw === 'analytics') {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (raw === 'necessary' || raw === 'analytics') {
      this.level.set(raw);
    }
  }

  private persist(value: CookieConsentLevel): void {
    localStorage.setItem(STORAGE_KEY, value);
  }

  private loadGoogleTagManager(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const w = window as Window & { __betonstroyGtmLoaded?: boolean };
    if (w.__betonstroyGtmLoaded) {
      return;
    }
    w.__betonstroyGtmLoaded = true;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const j = document.createElement('script');
    j.async = true;
    j.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(j);

    const nos = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    iframe.title = 'Google Tag Manager';
    nos.appendChild(iframe);
    document.body.insertBefore(nos, document.body.firstChild);
  }

  private loadYandexMetrika(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const w = window as Window & { __betonstroyYmLoaded?: boolean };
    if (w.__betonstroyYmLoaded) {
      return;
    }
    w.__betonstroyYmLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;
    script.onload = () => {
      window.ym?.(YM_ID, 'init', {
        ssr: false,
        webvisor: true,
        clickmap: true,
        ecommerce: 'dataLayer',
        accurateTrackBounce: true,
        trackLinks: true,
      });
    };
    document.head.appendChild(script);
  }
}
