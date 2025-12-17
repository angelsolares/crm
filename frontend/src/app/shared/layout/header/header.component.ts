import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Organization } from '../../../core/models/organization.model';
import { Contact } from '../../../core/models/contact.model';
import { Project } from '../../../core/models/project.model';

interface SearchResults {
  organizations: Organization[];
  contacts: Contact[];
  projects: Project[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  template: `
    <header class="h-16 bg-white border-b border-midnight-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <!-- Left: Menu toggle + Search -->
      <div class="flex items-center gap-4 flex-1">
        <button 
          (click)="toggleSidebar.emit()"
          class="btn-ghost btn-icon lg:hidden"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <!-- Global Search -->
        <div class="relative flex-1 max-w-xl">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            (focus)="showResults.set(true)"
            (blur)="hideResultsDelayed()"
            placeholder="Search organizations, contacts, projects..."
            class="input pl-10 pr-4 py-2 bg-midnight-50 border-transparent focus:bg-white"
          />
          
          <!-- Search Results Dropdown -->
          @if (showResults() && searchQuery.length >= 2) {
            <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card-hover border border-midnight-100 overflow-hidden z-50 animate-scale-in">
              @if (isSearching()) {
                <div class="p-4 text-center text-midnight-500">
                  <div class="animate-pulse-soft">Searching...</div>
                </div>
              } @else if (hasResults()) {
                <!-- Organizations -->
                @if (searchResults().organizations.length > 0) {
                  <div class="px-3 py-2 bg-midnight-50 text-xs font-semibold text-midnight-600 uppercase">
                    Organizations
                  </div>
                  @for (org of searchResults().organizations; track org.id) {
                    <button 
                      (mousedown)="navigateTo('/organizations', org.id)"
                      class="w-full px-4 py-2 text-left hover:bg-midnight-50 flex items-center gap-3"
                    >
                      @if (org.logo_url) {
                        <img [src]="org.logo_url" class="w-8 h-8 rounded-lg object-cover" />
                      } @else {
                        <div class="w-8 h-8 rounded-lg bg-nexus-100 flex items-center justify-center text-nexus-700 font-semibold text-sm">
                          {{ org.name.charAt(0) }}
                        </div>
                      }
                      <div>
                        <div class="font-medium text-midnight-900">{{ org.name }}</div>
                        <div class="text-xs text-midnight-500">{{ org.type | titlecase }} • {{ org.status | titlecase }}</div>
                      </div>
                    </button>
                  }
                }
                
                <!-- Contacts -->
                @if (searchResults().contacts.length > 0) {
                  <div class="px-3 py-2 bg-midnight-50 text-xs font-semibold text-midnight-600 uppercase">
                    Contacts
                  </div>
                  @for (contact of searchResults().contacts; track contact.id) {
                    <button 
                      (mousedown)="navigateTo('/contacts', contact.id)"
                      class="w-full px-4 py-2 text-left hover:bg-midnight-50 flex items-center gap-3"
                    >
                      <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold text-sm">
                        {{ contact.first_name.charAt(0) }}{{ contact.last_name.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-medium text-midnight-900">{{ contact.full_name }}</div>
                        <div class="text-xs text-midnight-500">{{ contact.title || contact.email }}</div>
                      </div>
                    </button>
                  }
                }
                
                <!-- Projects -->
                @if (searchResults().projects.length > 0) {
                  <div class="px-3 py-2 bg-midnight-50 text-xs font-semibold text-midnight-600 uppercase">
                    Projects
                  </div>
                  @for (project of searchResults().projects; track project.id) {
                    <button 
                      (mousedown)="navigateTo('/projects', project.id)"
                      class="w-full px-4 py-2 text-left hover:bg-midnight-50 flex items-center gap-3"
                    >
                      <div class="w-8 h-8 rounded-lg bg-nexus-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-nexus-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-medium text-midnight-900">{{ project.name }}</div>
                        <div class="text-xs text-midnight-500">{{ project.stage_label }} • {{ project.interest_label }} interest</div>
                      </div>
                    </button>
                  }
                }
              } @else {
                <div class="p-4 text-center text-midnight-500">
                  No results found
                </div>
              }
            </div>
          }
        </div>
      </div>
      
      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Notifications -->
        <button class="btn-ghost btn-icon relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <!-- User menu -->
        <div class="relative flex items-center gap-3 pl-3 border-l border-midnight-100">
          <button 
            (click)="toggleUserMenu()"
            class="flex items-center gap-3 hover:bg-midnight-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div class="avatar avatar-md bg-nexus-100 text-nexus-700 font-semibold">
              {{ getUserInitials() }}
            </div>
            <div class="hidden sm:block text-left">
              <div class="text-sm font-medium text-midnight-900">{{ authService.user()?.name }}</div>
              <div class="text-xs text-midnight-500 capitalize">{{ authService.user()?.role?.replace('_', ' ') }}</div>
            </div>
            <svg class="w-4 h-4 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- User Dropdown -->
          @if (showUserMenu()) {
            <div class="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-card-hover border border-midnight-100 overflow-hidden z-50 animate-scale-in">
              <div class="px-4 py-3 border-b border-midnight-100">
                <div class="text-sm font-medium text-midnight-900">{{ authService.user()?.name }}</div>
                <div class="text-xs text-midnight-500">{{ authService.user()?.email }}</div>
              </div>
              <div class="py-2">
                <button 
                  (click)="onLogout()"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: ``
})
export class HeaderComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  authService = inject(AuthService);
  
  toggleSidebar = output<void>();
  
  searchQuery = '';
  showResults = signal(false);
  showUserMenu = signal(false);
  isSearching = signal(false);
  searchResults = signal<SearchResults>({ organizations: [], contacts: [], projects: [] });
  
  private searchTimeout: any;
  
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    
    if (this.searchQuery.length < 2) {
      this.searchResults.set({ organizations: [], contacts: [], projects: [] });
      return;
    }
    
    this.isSearching.set(true);
    
    this.searchTimeout = setTimeout(() => {
      this.api.get<{ data: SearchResults }>('search', { q: this.searchQuery, limit: 5 })
        .subscribe({
          next: (response) => {
            this.searchResults.set(response.data);
            this.isSearching.set(false);
          },
          error: () => {
            this.isSearching.set(false);
          }
        });
    }, 300);
  }
  
  hasResults(): boolean {
    const results = this.searchResults();
    return results.organizations.length > 0 || 
           results.contacts.length > 0 || 
           results.projects.length > 0;
  }
  
  hideResultsDelayed(): void {
    setTimeout(() => this.showResults.set(false), 200);
  }
  
  navigateTo(basePath: string, id: string): void {
    this.showResults.set(false);
    this.searchQuery = '';
    this.router.navigate([basePath, id]);
  }
  
  getUserInitials(): string {
    const user = this.authService.user();
    if (!user?.name) return 'U';
    
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }
  
  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }
  
  onLogout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
  }
}

