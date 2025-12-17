import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that protects routes requiring authentication.
 * Redirects to login page if user is not authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  
  // Redirect to login page with return URL
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl }
  });
  
  return false;
};

/**
 * Guard that prevents authenticated users from accessing auth pages.
 * Redirects to dashboard if user is already authenticated.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to dashboard if already logged in
  router.navigate(['/dashboard']);
  return false;
};

