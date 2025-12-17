import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexus-950 via-nexus-900 to-nexus-950 px-4">
      <!-- Decorative background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexus-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative text-center max-w-md">
        <!-- Icon -->
        <div class="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full mb-8">
          <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <!-- Title -->
        <h1 class="text-4xl font-display font-bold text-white mb-4">Access Denied</h1>
        
        <!-- Description -->
        <p class="text-nexus-400 text-lg mb-8">
          You don't have permission to access this resource. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            routerLink="/dashboard"
            class="px-6 py-3 bg-gradient-to-r from-nexus-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-nexus-500/25 hover:shadow-xl hover:shadow-nexus-500/30 transition-all"
          >
            Go to Dashboard
          </a>
          <button 
            onclick="history.back()"
            class="px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UnauthorizedComponent {}

