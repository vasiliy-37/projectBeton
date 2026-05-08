import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side render on each request (не статический prerender при ng build).
 * Иначе сборка дергает /api/* без запущенного backend и падает по таймауту.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
