import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-950 via-nexus-900 to-nexus-950 px-4 py-12">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-nexus-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative w-full max-w-md">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-nexus-400 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-nexus-500/25">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-3xl font-display font-bold text-white tracking-tight">Entheo Nexus</h1>
          <p class="text-nexus-400 mt-2">Sign in to your account</p>
        </div>
        
        <!-- Login Card -->
        <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-nexus-200 mb-2">
                Email address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-nexus-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  [class.border-red-500]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
                />
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors) {
                <p class="mt-2 text-sm text-red-400">
                  @if (loginForm.get('email')?.errors?.['required']) {
                    Email is required
                  } @else if (loginForm.get('email')?.errors?.['email']) {
                    Please enter a valid email
                  }
                </p>
              }
            </div>
            
            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-nexus-200 mb-2">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-nexus-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  [class.border-red-500]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-nexus-500 hover:text-nexus-300 transition-colors"
                >
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors) {
                <p class="mt-2 text-sm text-red-400">
                  @if (loginForm.get('password')?.errors?.['required']) {
                    Password is required
                  } @else if (loginForm.get('password')?.errors?.['minlength']) {
                    Password must be at least 8 characters
                  }
                </p>
              }
            </div>
            
            <!-- Error Message -->
            @if (authService.error()) {
              <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-red-400">{{ authService.error() }}</p>
                </div>
              </div>
            }
            
            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || authService.isLoading()"
              class="w-full py-3 px-4 bg-gradient-to-r from-nexus-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-nexus-500/25 hover:shadow-xl hover:shadow-nexus-500/30 focus:outline-none focus:ring-2 focus:ring-nexus-400 focus:ring-offset-2 focus:ring-offset-nexus-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              @if (authService.isLoading()) {
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              } @else {
                Sign in
              }
            </button>
          </form>
          
          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-nexus-400">
              Don't have an account?
              <a routerLink="/auth/register" class="text-nexus-300 hover:text-white font-medium transition-colors">
                Create one
              </a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <p class="text-center text-nexus-600 text-sm mt-8">
          &copy; {{ currentYear }} Entheospace. All rights reserved.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  loginForm: FormGroup;
  showPassword = signal(false);
  currentYear = new Date().getFullYear();
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.authService.clearError();
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Get return URL from query params or default to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }
}

