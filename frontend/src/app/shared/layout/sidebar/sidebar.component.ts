import { Component, input, output, inject, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionState } from '../../../core/state/permission.state';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  module?: string; // Module key for permission check (uses 'view' action)
  adminOnly?: boolean; // Legacy support
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <aside 
      class="fixed left-0 top-0 h-screen bg-white border-r border-midnight-100 flex flex-col transition-all duration-300 z-50"
      [class.w-64]="!isCollapsed()"
      [class.w-20]="isCollapsed()"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-midnight-100">
        @if (!isCollapsed()) {
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-nexus-gradient flex items-center justify-center">
              <span class="text-white font-display font-bold text-lg">EN</span>
            </div>
            <div>
              <h1 class="font-display font-bold text-midnight-900">Entheo Nexus</h1>
              <span class="text-xs text-midnight-500">CRM Platform</span>
            </div>
          </div>
        } @else {
          <div class="w-10 h-10 rounded-xl bg-nexus-gradient flex items-center justify-center mx-auto">
            <span class="text-white font-display font-bold text-lg">EN</span>
          </div>
        }
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        @for (item of visibleNavItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [class.justify-center]="isCollapsed()"
            [class.px-3]="isCollapsed()"
            [title]="isCollapsed() ? item.label : ''"
          >
            <span [innerHTML]="item.icon" class="w-5 h-5 flex-shrink-0"></span>
            @if (!isCollapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
        
        <!-- Admin Section Divider -->
        @if (showAdminSection()) {
          <div class="pt-4 mt-4 border-t border-midnight-100">
            @if (!isCollapsed()) {
              <p class="px-3 mb-2 text-xs font-semibold text-midnight-400 uppercase tracking-wider">Administration</p>
            }
            @for (item of adminNavItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="nav-item"
                [class.justify-center]="isCollapsed()"
                [class.px-3]="isCollapsed()"
                [title]="isCollapsed() ? item.label : ''"
              >
                <span [innerHTML]="item.icon" class="w-5 h-5 flex-shrink-0"></span>
                @if (!isCollapsed()) {
                  <span>{{ item.label }}</span>
                }
              </a>
            }
          </div>
        }
      </nav>
      
      <!-- Collapse toggle -->
      <div class="p-4 border-t border-midnight-100">
        <button
          (click)="toggleCollapse.emit()"
          class="w-full btn-ghost justify-center"
          [title]="isCollapsed() ? 'Expand' : 'Collapse'"
        >
          <svg 
            class="w-5 h-5 transition-transform duration-200"
            [class.rotate-180]="isCollapsed()"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: ``
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private permissionState = inject(PermissionState);
  
  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  ngOnInit(): void {
    // Load permissions when sidebar initializes (if authenticated)
    if (this.authService.isAuthenticated() && !this.permissionState.isLoaded()) {
      this.permissionState.loadPermissions();
    }
  }
  
  // Filter nav items based on user permissions
  visibleNavItems = computed(() => {
    return this.navItems.filter(item => this.canViewModule(item));
  });

  // Admin section items
  adminNavItems = computed(() => {
    if (!this.authService.isAdmin()) return [];
    return this.adminItems;
  });

  // Show admin section divider
  showAdminSection = computed(() => {
    return this.authService.isAdmin() && this.adminItems.length > 0;
  });

  /**
   * Check if user can view a module.
   * Uses permission state if loaded, otherwise falls back to role check.
   */
  private canViewModule(item: NavItem): boolean {
    // If no module specified, show to all authenticated users
    if (!item.module) return true;

    // Check using permission state
    if (this.permissionState.isLoaded()) {
      return this.permissionState.can(item.module as any, 'view' as any);
    }

    // Fallback: use legacy adminOnly flag
    if (item.adminOnly) {
      return this.authService.isAdmin();
    }

    return true;
  }
  
  // Main navigation items
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      module: 'dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`
    },
    {
      label: 'Organizations',
      route: '/organizations',
      module: 'organizations',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
    },
    {
      label: 'Contacts',
      route: '/contacts',
      module: 'contacts',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
    },
    {
      label: 'Projects',
      route: '/projects',
      module: 'projects',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
    },
    {
      label: 'Meetings',
      route: '/meetings',
      module: 'meetings',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`
    },
    {
      label: 'Proposals',
      route: '/proposals',
      module: 'proposals',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    },
  ];

  // Admin-only navigation items
  adminItems: NavItem[] = [
    {
      label: 'Users',
      route: '/admin/users',
      module: 'users',
      adminOnly: true,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
    },
    {
      label: 'Permissions',
      route: '/admin/permissions',
      module: 'users', // Uses same permission as users
      adminOnly: true,
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`
    },
  ];
}
