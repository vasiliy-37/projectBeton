import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Invitation } from './components/invitation/invitation';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
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
  imports: [RouterOutlet, Invitation, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private titleService = inject(Title);
  private meta = inject(Meta);
  protected readonly appTitle = signal('projectBeton-client');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      register();
    }
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applySeoForRoute(this.router.url);
      });
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
