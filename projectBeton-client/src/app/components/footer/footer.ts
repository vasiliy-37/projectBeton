import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { PhoneDataService } from '../../phone-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.less'
})

export class Footer implements OnInit, OnDestroy {

  public phoneNumber: string = 'Загрузка...';
  public phoneHref: string = '#';
  private dataSubscription: Subscription | undefined;

  currentIndex: number = 0;
  totalSections: number = 3;
  sectionWidth: number = 100 / this.totalSections;
  currentOffset: number = 0;

  constructor(private PhoneDataService: PhoneDataService) { }

  ngOnInit(): void {
    this.dataSubscription = this.PhoneDataService.getPhoneNumberData().subscribe({
      next: data => {
        this.phoneNumber = data.phoneNumber;
        this.phoneHref = data.phoneHref;
      },
      error: err => {
        console.error('Ошибка загрузки номера телефона в футере:', err);
        this.phoneNumber = 'Номер недоступен';
        this.phoneHref = '#';
      }
    });

    this.checkScreenSize();

    // Запускаем автопрокрутку только на мобильных
    if (this.isMobile()) {
      this.startAutoScroll();
    }

  }

  ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe(); // Очистка подписки
        }
        this.stopAutoScroll(); // Ваша существующая логика
    }

  // Переменные для автопрокрутки
  autoScrollInterval: any;
  AUTO_SCROLL_DELAY: number = 5000;

  // Точка переключения между мобильным и десктопным макетом
  readonly MOBILE_BREAKPOINT = 768;

  // Проверяет, является ли текущий размер экрана мобильным
  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= this.MOBILE_BREAKPOINT;
  }

  // 🛑 Новая функция: Сброс при изменении размера экрана
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  // 🛑 Новая функция: Контроль состояния скролла
  checkScreenSize(): void {
    if (this.isMobile()) {
      // На мобильном: запускаем скролл, если он не запущен
      if (!this.autoScrollInterval) {
        this.startAutoScroll();
      }
    } else {
      // На десктопе: СБРОС СМЕЩЕНИЯ и отключение автопрокрутки
      this.currentIndex = 0;
      this.currentOffset = 0;
      this.stopAutoScroll();
    }
  }

  // ------------------------------------------------------------------
  // ЛОГИКА ПРОКРУТКИ
  // ------------------------------------------------------------------

  updateOffset(): void {
    // Применяем смещение только если мы на мобильном
    if (this.isMobile()) {
      this.currentOffset = -(this.currentIndex * this.sectionWidth);
    } else {
      // На десктопе всегда 0
      this.currentOffset = 0;
    }
  }

  nextSection(): void {
    if (!this.isMobile()) return; // Игнорируем нажатия на десктопе

    this.stopAutoScroll();
    this.currentIndex = (this.currentIndex + 1) % this.totalSections;
    this.updateOffset();
  }

  prevSection(): void {
    if (!this.isMobile()) return; // Игнорируем нажатия на десктопе

    this.stopAutoScroll();
    this.currentIndex = (this.currentIndex - 1 + this.totalSections) % this.totalSections;
    this.updateOffset();
  }

  // ------------------------------------------------------------------
  // ЛОГИКА АВТОПРОКРУТКИ
  // --------------------------------------------------

  startAutoScroll(): void {
    if (!this.isMobile()) return; // Не запускаем на десктопе

    this.autoScrollInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.totalSections;
      this.updateOffset();
    }, this.AUTO_SCROLL_DELAY);
  }

  stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null; // Сброс, чтобы можно было запустить снова
    }
  }
}