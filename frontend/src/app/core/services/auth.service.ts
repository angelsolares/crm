import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionState } from '../state/permission.state';

// Auth API uses the base URL without /dev prefix
const AUTH_API_URL = environment.apiUrl.replace('/api/dev', '/api');

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
  email_verified_at?: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'entheo_nexus_token';
  private readonly USER_KEY = 'entheo_nexus_user';
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private permissionState = inject(PermissionState);
  
  // State signals
  private _user = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Public read-only signals
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly userRole = computed(() => this._user()?.role ?? null);
  
  constructor() {
    this.loadUserFromStorage();
  }
  
  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Store token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  /**
   * Remove token
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Store user data
   */
  private setStoredUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Remove stored user
   */
  private removeStoredUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  /**
   * Load user from storage on app init
   */
  private loadUserFromStorage(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this._user.set(user);
        // Verify token is still valid by fetching current user
        this.fetchCurrentUser();
      } catch {
        this.clearAuth();
      }
    }
  }
  
  /**
   * Fetch current user from API
   */
  fetchCurrentUser(): void {
    this._isLoading.set(true);
    this.http.get<User>(`${AUTH_API_URL}/auth/me`).subscribe({
      next: (user) => {
        this._user.set(user);
        this.setStoredUser(user);
        this._isLoading.set(false);
        this._error.set(null);
        // Load permissions after user is authenticated
        this.permissionState.loadPermissions();
      },
      error: () => {
        this.clearAuth();
        this._isLoading.set(false);
      }
    });
  }
  
  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return this.http.post<AuthResponse>(`${AUTH_API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this._user.set(response.user);
        this.setStoredUser(response.user);
        this._isLoading.set(false);
        // Load permissions after successful login
        this.permissionState.loadPermissions();
      }),
      catchError((error) => {
        this._isLoading.set(false);
        const message = error.error?.message || 'Login failed. Please try again.';
        this._error.set(message);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Register new user
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return this.http.post<AuthResponse>(`${AUTH_API_URL}/auth/register`, data).pipe(
      tap((response) => {
        this.setToken(response.token);
        this._user.set(response.user);
        this.setStoredUser(response.user);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        const message = error.error?.message || 'Registration failed. Please try again.';
        this._error.set(message);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Logout user
   */
  logout(): void {
    const token = this.getToken();
    
    if (token) {
      // Call logout endpoint to revoke token
      this.http.post(`${AUTH_API_URL}/auth/logout`, {}).subscribe({
        complete: () => this.clearAuth(),
        error: () => this.clearAuth()
      });
    } else {
      this.clearAuth();
    }
  }
  
  /**
   * Clear all auth data
   */
  private clearAuth(): void {
    this.removeToken();
    this.removeStoredUser();
    this._user.set(null);
    this._error.set(null);
    // Clear permissions on logout
    this.permissionState.clear();
    this.router.navigate(['/auth/login']);
  }
  
  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }
  
  /**
   * Check if user has any of the given roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
  
  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }
  
  /**
   * Check if user is manager
   */
  isManager(): boolean {
    return this.hasRole('manager');
  }
  
  /**
   * Check if user is sales rep
   */
  isSalesRep(): boolean {
    return this.hasRole('sales_rep');
  }
  
  /**
   * Check if user can manage users (admin only)
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }
}
