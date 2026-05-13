import {
  Component,
  inject,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
  viewChild,
  ElementRef,
  effect,
  PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WorkService, WorkItem } from '../../services/work.service';

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = items[i]!;
    items[i] = items[j]!;
    items[j] = t;
  }
  return items;
}

type SwiperHost = HTMLElement & {
  initialized?: boolean;
  initialize?: () => void;
  swiper?: { update: () => void };
};

@Component({
  selector: 'app-portfolio',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Portfolio {
  public workService = inject(WorkService);
  private platformId = inject(PLATFORM_ID);

  private swiperRef = viewChild<ElementRef<SwiperHost>>('swiperRef');

  /** Порядок слайдов фиксируется при смене данных (без Math.random в computed — он ломал мемоизацию). */
  readonly displayWorks = signal<WorkItem[]>([]);

  private swiperLayoutVersion = 0;

  constructor() {
    this.workService.loadAll();

    effect(() => {
      const incoming = this.workService.works();
      const copy = [...incoming];
      shuffleInPlace(copy);
      this.displayWorks.set(copy);
    });

    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const works = this.displayWorks();
      const swiperEl = this.swiperRef()?.nativeElement;
      if (!works.length || !swiperEl || typeof swiperEl.initialize !== 'function') {
        return;
      }
      const run = ++this.swiperLayoutVersion;
      queueMicrotask(() => {
        if (run !== this.swiperLayoutVersion) {
          return;
        }
        if (!swiperEl.initialized) {
          swiperEl.initialize?.();
        } else if (swiperEl.swiper) {
          swiperEl.swiper.update();
        }
      });
    });
  }
}
