import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-950 via-nexus-900 to-nexus-950 px-4 py-12">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-nexus-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative w-full max-w-md">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-nexus-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-3xl font-display font-bold text-white tracking-tight">Create Account</h1>
          <p class="text-nexus-400 mt-2">Join Entheo Nexus today</p>
        </div>
        
        <!-- Register Card -->
        <div class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Name Field -->
            <div>
              <label for="name" class="block text-sm font-medium text-nexus-200 mb-2">
                Full name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  [class.border-red-500]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
                />
              </div>
              @if (registerForm.get('name')?.touched && registerForm.get('name')?.errors) {
                <p class="mt-2 text-sm text-red-400">
                  @if (registerForm.get('name')?.errors?.['required']) {
                    Name is required
                  } @else if (registerForm.get('name')?.errors?.['maxlength']) {
                    Name cannot exceed 255 characters
                  }
                </p>
              }
            </div>
            
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
                  class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  [class.border-red-500]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                />
              </div>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.errors) {
                <p class="mt-2 text-sm text-red-400">
                  @if (registerForm.get('email')?.errors?.['required']) {
                    Email is required
                  } @else if (registerForm.get('email')?.errors?.['email']) {
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
                  class="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  [class.border-red-500]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
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
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.errors) {
                <p class="mt-2 text-sm text-red-400">
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Password is required
                  } @else if (registerForm.get('password')?.errors?.['minlength']) {
                    Password must be at least 8 characters
                  } @else if (registerForm.get('password')?.errors?.['pattern']) {
                    Password must contain uppercase, lowercase, and numbers
                  }
                </p>
              }
              <!-- Password strength indicator -->
              <div class="mt-2 space-y-1">
                <div class="flex gap-1">
                  @for (i of [1,2,3,4]; track i) {
                    <div 
                      class="h-1 flex-1 rounded-full transition-colors"
                      [class]="getPasswordStrength() >= i ? getStrengthColor() : 'bg-white/10'"
                    ></div>
                  }
                </div>
                <p class="text-xs text-nexus-500">
                  Use 8+ characters with mixed case and numbers
                </p>
              </div>
            </div>
            
            <!-- Confirm Password Field -->
            <div>
              <label for="password_confirmation" class="block text-sm font-medium text-nexus-200 mb-2">
                Confirm password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="password_confirmation"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="password_confirmation"
                  class="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-nexus-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  [class.border-red-500]="registerForm.get('password_confirmation')?.touched && registerForm.get('password_confirmation')?.invalid"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPassword()"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-nexus-500 hover:text-nexus-300 transition-colors"
                >
                  @if (showConfirmPassword()) {
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
              @if (registerForm.get('password_confirmation')?.touched && registerForm.errors?.['passwordMismatch']) {
                <p class="mt-2 text-sm text-red-400">Passwords do not match</p>
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
              [disabled]="registerForm.invalid || authService.isLoading()"
              class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-nexus-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-nexus-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              @if (authService.isLoading()) {
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              } @else {
                Create account
              }
            </button>
          </form>
          
          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-nexus-400">
              Already have an account?
              <a routerLink="/auth/login" class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
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
export class RegisterComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  registerForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  currentYear = new Date().getFullYear();
  
  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
  
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
  
  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }
  
  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    
    return strength;
  }
  
  getStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.authService.clearError();
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}

