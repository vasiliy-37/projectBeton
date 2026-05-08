import { mergeApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  bootstrapApplication,
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(
  App,
  mergeApplicationConfig(appConfig, {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideClientHydration(withEventReplay())
    ]
  })
).catch((err) => console.error(err));
