import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory function to create a role guard for specific roles.
 * 
 * Usage in routes:
 *   canActivate: [roleGuard(['admin'])]
 *   canActivate: [roleGuard(['admin', 'manager'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // First check if authenticated
    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }
    
    // Then check if user has required role
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }
    
    // Redirect to unauthorized page or dashboard
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * Guard that only allows admin users.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  if (authService.isAdmin()) {
    return true;
  }
  
  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Guard that allows admin and manager users.
 */
export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  if (authService.isAdmin() || authService.isManager()) {
    return true;
  }
  
  router.navigate(['/unauthorized']);
  return false;
};

