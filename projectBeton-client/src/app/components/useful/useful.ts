import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-useful',
  imports: [],
  templateUrl: './useful.html',
  styleUrl: './useful.less'
})
export class Useful {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    /**
     * Прокрутка к якорю только при первом заходе по ссылке с #.
     * Полное обновление страницы (F5): не уводим к последней статье — убираем hash и остаёмся вверху.
     */
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const fragment = this.router.parseUrl(this.router.url).fragment;
      if (!fragment || !document.getElementById(fragment)) {
        return;
      }
      if (this.isFullPageReload()) {
        const pathOnly = this.router.url.split('#')[0];
        void this.router.navigateByUrl(pathOnly, { replaceUrl: true }).then(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
        return;
      }
      const schedule =
        typeof requestAnimationFrame !== 'undefined'
          ? (fn: () => void) => requestAnimationFrame(fn)
          : (fn: () => void) => setTimeout(fn, 0);
      schedule(() => this.scrollToAnchor(fragment));
    });
  }

  /** Только полная перезагрузка вкладки (обновить), не SPA-переходы */
  private isFullPageReload(): boolean {
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0] as
        | PerformanceNavigationTiming
        | undefined;
      return nav?.type === 'reload';
    } catch {
      return false;
    }
  }

  /**
   * Клик по оглавлению: обновляем fragment через Router (anchorScrolling выключен — без автоскролла),
   * затем один scrollIntoView.
   */
  goToSection(event: Event, anchorId: string): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    void this.router.navigate(['/useful'], { fragment: anchorId, replaceUrl: true }).then(() => {
      const schedule =
        typeof requestAnimationFrame !== 'undefined'
          ? (fn: () => void) => requestAnimationFrame(fn)
          : (fn: () => void) => setTimeout(fn, 0);
      schedule(() => this.scrollToAnchor(anchorId));
    });
  }

  private scrollToAnchor(anchorId: string): void {
    const resolved = this.preferredScrollBehavior();
    document.getElementById(anchorId)?.scrollIntoView({ behavior: resolved, block: 'start' });
  }

  private preferredScrollBehavior(): ScrollBehavior {
    if (typeof matchMedia === 'undefined') {
      return 'smooth';
    }
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  }
}
