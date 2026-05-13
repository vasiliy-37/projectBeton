import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Invitation } from './components/invitation/invitation';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CookieConsentBanner } from './components/cookie-consent-banner/cookie-consent-banner';
import { register } from 'swiper/element/bundle';
import { filter } from 'rxjs';

type SeoPreset = {
  description: string;
  ogTitle: string;
  ogDescription: string;
};

const SEO_PRESETS: Record<string, SeoPreset> = {
  '/': {
    description:
      'Бетон с доставкой в Иваново и области от производителя. Актуальные цены за 1 м3, онлайн-калькулятор стоимости и собственный автопарк.',
    ogTitle: 'Бетон с доставкой в Иваново - цена за куб | ProjectBeton',
    ogDescription:
      'Купить бетон в Иваново напрямую с завода: марки М100-М500, доставка миксером, расчет стоимости за 1 м3.',
  },
  '/price': {
    description:
      'Цены на бетон в Иваново за 1 м3 по маркам. Актуальный прайс-лист, удобный выбор марки и переход к расчету доставки.',
    ogTitle: 'Цены на бетон в Иваново за 1 м3 | ProjectBeton',
    ogDescription:
      'Прайс на бетон по маркам и классам прочности. Выберите подходящую смесь и рассчитайте итоговую стоимость заказа.',
  },
  '/services': {
    description:
      'Услуги по доставке и подаче бетона в Иваново: миксеры, бетононасос, сопутствующие работы на объекте.',
    ogTitle: 'Доставка и подача бетона в Иваново | ProjectBeton',
    ogDescription:
      'Организуем доставку бетона и подачу смеси на объект. Подбор техники под условия площадки и задачи строительства.',
  },
  '/contacts': {
    description:
      'Контакты ProjectBeton: телефон отдела продаж, email, адрес и режим работы. Работаем по Иваново и Ивановской области.',
    ogTitle: 'Контакты бетонного завода | ProjectBeton',
    ogDescription:
      'Свяжитесь с нами для заказа бетона и расчета поставки. Телефон, почта, адрес и карта проезда.',
  },
  '/privacy': {
    description:
      'Политика конфиденциальности и обработки персональных данных, сведения о cookie и аналитике, права субъектов ПДн.',
    ogTitle: 'Политика конфиденциальности | Бетон-Строй',
    ogDescription:
      'Условия обработки персональных данных на сайте, цели и сроки, файлы cookie, Яндекс.Метрика и Google Tag Manager по согласию.',
  },
  '/useful': {
    description:
      'Таблица марок бетона, уход за бетоном после заливки и памятка по приёмке смеси на объекте. Материалы для заказчиков в Иваново и области.',
    ogTitle: 'Полезные материалы о бетоне | ProjectBeton',
    ogDescription:
      'Как выбрать марку, как ухаживать за бетоном первые 28 дней и как принять партию без лишних рисков.',
  },
  '/beton-v/:city': {
    description:
      'Бетон с доставкой по Ивановской области. Поставка на объект, подбор марки смеси и расчет стоимости заказа.',
    ogTitle: 'Бетон с доставкой по Ивановской области | ProjectBeton',
    ogDescription:
      'Поставка бетона в города Ивановской области с расчетом стоимости и подбором оптимальной марки под задачу.',
  },
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Invitation, Header, Footer, CookieConsentBanner],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private titleService = inject(Title);
  private meta = inject(Meta);
  protected readonly appTitle = signal('projectBeton-client');
  /** Кнопка «наверх» после прокрутки вниз */
  protected readonly showScrollTop = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    if (isPlatformBrowser(this.platformId)) {
      register();
    }

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.updateScrollTopVisibility();
      /** На части мобильных браузеров скролл шёл без обновления window.scrollY — слушаем и document (capture). */
      const onScroll = () => this.updateScrollTopVisibility();
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => {
        document.removeEventListener('scroll', onScroll, { capture: true } as AddEventListenerOptions);
        window.removeEventListener('scroll', onScroll);
      });
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applySeoForRoute(this.router.url);
        if (isPlatformBrowser(this.platformId)) {
          const tick =
            typeof requestAnimationFrame !== 'undefined'
              ? (fn: () => void) => requestAnimationFrame(fn)
              : (fn: () => void) => setTimeout(fn, 0);
          tick(() => this.updateScrollTopVisibility());
        }
      });
  }

  private scrollThresholdPx(): number {
    if (typeof matchMedia === 'undefined') {
      return 420;
    }
    return matchMedia('(max-width: 768px)').matches ? 160 : 420;
  }

  /** Единая позиция прокрутки для мобильных WebKit / Chrome */
  private getScrollY(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0;
    }
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  private updateScrollTopVisibility(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.showScrollTop.set(this.getScrollY() > this.scrollThresholdPx());
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const smooth =
      typeof matchMedia !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
  }

  private applySeoForRoute(url: string): void {
    const cleanPath = url.split('?')[0];
    const key = cleanPath.startsWith('/beton-v/') ? '/beton-v/:city' : cleanPath;
    const preset =
      SEO_PRESETS[key] ??
      ({
        description:
          'Бетон с доставкой в Иваново и области. Расчет стоимости, актуальные цены и собственный автопарк.',
        ogTitle: this.titleService.getTitle(),
        ogDescription:
          'Закажите бетон с доставкой в Иваново напрямую от производителя. Удобный подбор марки и расчет стоимости.',
      } satisfies SeoPreset);

    this.meta.updateTag({ name: 'description', content: preset.description });
    this.meta.updateTag({ property: 'og:title', content: preset.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: preset.ogDescription });
  }
}
