import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkService } from '../../services/work.service';

@Component({
  selector: 'app-portfolio',
  imports: [CommonModule,],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.less'
})
export class Portfolio {
  public workService = inject(WorkService);
  
  // Теперь это сигнал! Эффект будет реагировать на его изменение.
  private swiperRef = viewChild<ElementRef>('swiperRef');

  public randomWorks = computed(() => {
    const data = [...this.workService.works()];
    return data.sort(() => Math.random() - 0.5);
  });

  constructor() {
    this.workService.loadAll();

    // Эффект теперь следит и за данными (randomWorks), 
    // и за появлением элемента в DOM (swiperRef)
    effect(() => {
      const works = this.randomWorks();
      const swiperEl = this.swiperRef()?.nativeElement;

      if (works.length > 0 && swiperEl) {
        // Небольшая пауза, чтобы DOM успел отрендерить slides из @for
        setTimeout(() => {
          if (!swiperEl.initialized) {
            swiperEl.initialize();
          } else if (swiperEl.swiper) {
            swiperEl.swiper.update();
          }
        }, 100);
      }
    });
  }
}