import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthenticationService } from './authentication-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const authService = inject(AuthenticationService);
      return authService.isInitialized;
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ],
};
