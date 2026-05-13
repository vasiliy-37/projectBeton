import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../cookie-consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-consent-banner.html',
  styleUrl: './cookie-consent-banner.less',
})
export class CookieConsentBanner {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly consent = inject(CookieConsentService);

  protected readonly visible = computed(
    () => isPlatformBrowser(this.platformId) && this.consent.level() === null,
  );

  acceptNecessary(): void {
    this.consent.acceptNecessaryOnly();
  }

  acceptAnalytics(): void {
    this.consent.acceptAnalytics();
  }
}
