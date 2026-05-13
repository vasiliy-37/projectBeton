import { Component, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PhoneDataService } from '../../phone-data.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.less'
})

export class Footer implements OnInit, OnDestroy {
  readonly copyrightYear = new Date().getFullYear();

  private formatPhone(rawPhone: string): string {
    const digits = String(rawPhone || '').replace(/\D/g, '');

    if (digits.length === 11 && (digits.startsWith('74932') || digits.startsWith('84932'))) {
      return `+7 (4932) ${digits.slice(5, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }

    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
      const normalized = `7${digits.slice(1)}`;
      return `+${normalized[0]} (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
    }

    if (digits.length === 6) {
      return `+7 (4932) ${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
    }

    if (digits.length === 10 && digits.startsWith('4932')) {
      return `+7 (${digits.slice(0, 4)}) ${digits.slice(4, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }

    return rawPhone;
  }
  
  readonly phoneNumber = computed(() => {
    if (this.phoneDataService.isLoading()) {
      return 'Загрузка...';
    }
    // Если данные есть, берем номер; иначе — сообщение об ошибке
    const phone = this.phoneDataService.phoneData()?.phoneNumber;
    return phone ? this.formatPhone(phone) : 'Номер недоступен';
  });
  
  readonly phoneHref = computed(() => {
    // Если данные есть, берем ссылку; иначе — '#'
    return this.phoneDataService.phoneData()?.phoneHref ?? '#';
  });

  readonly primaryEmail = computed(() => {
    if (this.phoneDataService.isLoading()) {
      return 'Загрузка...';
    }
    return this.phoneDataService.phoneData()?.primaryEmail ?? 'Почта не указана';
  });

  readonly primaryEmailHref = computed(() => {
    return this.phoneDataService.phoneData()?.primaryEmailHref ?? '#';
  });

  readonly address = computed(() => {
    if (this.phoneDataService.isLoading()) {
      return 'Загрузка...';
    }
    return this.phoneDataService.phoneData()?.address ?? 'Адрес не указан';
  });


  currentIndex = 0;
  readonly totalSections = 3;
  isMobileView = false;

  constructor(private phoneDataService: PhoneDataService) { } // Исправлено для конвенции

  ngOnInit(): void {
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    // 🛑 dataSubscription.unsubscribe() удалено.
    this.stopAutoScroll(); 
  }

  autoScrollInterval: ReturnType<typeof setInterval> | null = null;
  readonly AUTO_SCROLL_DELAY = 5000;

  // Точка переключения между мобильным и десктопным макетом
  readonly MOBILE_BREAKPOINT = 768;

  // Проверяет, является ли текущий размер экрана мобильным
  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= this.MOBILE_BREAKPOINT;
  }

  // 🛑 Новая функция: Сброс при изменении размера экрана
  @HostListener('window:resize', ['$event'])
  onResize(_event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobileView = this.isMobile();
    if (this.isMobileView) {
      if (!this.autoScrollInterval) {
        this.startAutoScroll();
      }
    } else {
      this.currentIndex = 0;
      this.stopAutoScroll();
    }
  }

  sliderTransform(): string {
    return this.isMobileView ? `translate3d(-${this.currentIndex * 100}%, 0, 0)` : 'none';
  }

  nextSection(): void {
    if (!this.isMobileView) return;

    this.stopAutoScroll();
    this.currentIndex = (this.currentIndex + 1) % this.totalSections;
    this.startAutoScroll();
  }

  prevSection(): void {
    if (!this.isMobileView) return;

    this.stopAutoScroll();
    this.currentIndex = (this.currentIndex - 1 + this.totalSections) % this.totalSections;
    this.startAutoScroll();
  }

  startAutoScroll(): void {
    if (!this.isMobileView || this.autoScrollInterval) return;

    this.autoScrollInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.totalSections;
    }, this.AUTO_SCROLL_DELAY);
  }

  stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null; // Сброс, чтобы можно было запустить снова
    }
  }
}