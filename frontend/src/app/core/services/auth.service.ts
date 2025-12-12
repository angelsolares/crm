import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'entheo_nexus_token';
  
  // State signals
  private _user = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  
  // Public read-only signals
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  
  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.fetchCurrentUser();
    }
  }
  
  fetchCurrentUser(): void {
    this._isLoading.set(true);
    this.http.get<User>(`${environment.apiUrl}/user`).subscribe({
      next: (user) => {
        this._user.set(user);
        this._isLoading.set(false);
      },
      error: () => {
        this._user.set(null);
        this._isLoading.set(false);
        this.removeToken();
      }
    });
  }
  
  logout(): void {
    this.removeToken();
    this._user.set(null);
  }
}

