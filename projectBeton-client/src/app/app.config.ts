import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/** Общий конфиг для браузера и SSR. Не включайте сюда гидратацию и другие browser-only провайдеры. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withFetch())
  ]
};
