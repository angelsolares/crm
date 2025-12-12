import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
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
        @for (item of navItems; track item.route) {
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
export class SidebarComponent {
  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();
  
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`
    },
    {
      label: 'Organizations',
      route: '/organizations',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
    },
    {
      label: 'Contacts',
      route: '/contacts',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
    },
    {
      label: 'Projects',
      route: '/projects',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
    },
    {
      label: 'Meetings',
      route: '/meetings',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`
    },
    {
      label: 'Proposals',
      route: '/proposals',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    },
  ];
}

