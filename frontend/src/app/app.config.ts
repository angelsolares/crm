import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Enable Zoneless change detection - Angular 21+ feature
    provideZonelessChangeDetection(),
    
    // Router with view transitions
    provideRouter(routes, withViewTransitions()),
    
    // HTTP client with interceptors
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
  ]
};

