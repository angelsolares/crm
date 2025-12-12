import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { ContactState } from '../../../core/state/contact.state';
import { ContactFilters, CONTACT_CATEGORIES, CONTACT_SOURCES } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [RouterLink, FormsModule, TitleCasePipe, DatePipe],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Contacts</h1>
          <p class="text-midnight-500 mt-1">Manage your business relationships and connections.</p>
        </div>
        <a routerLink="/contacts/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Contact
        </a>
      </div>
      
      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Search -->
            <div class="flex-1 min-w-[200px]">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"
                  placeholder="Search contacts..."
                  class="input pl-10"
                />
              </div>
            </div>
            
            <!-- Category Filter -->
            <select 
              [(ngModel)]="filters().category"
              (ngModelChange)="onFilterChange('category', $event)"
              class="select w-44"
            >
              <option value="">All Categories</option>
              @for (cat of categories; track cat.value) {
                <option [value]="cat.value">{{ cat.label }}</option>
              }
            </select>
            
            <!-- Status Filter -->
            <select 
              [(ngModel)]="filters().status"
              (ngModelChange)="onFilterChange('status', $event)"
              class="select w-36"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Contacts Grid -->
      <div class="card overflow-hidden">
        @if (contactState.isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            @for (_ of [1,2,3,4,5,6]; track $index) {
              <div class="p-4 border border-midnight-100 rounded-xl animate-pulse">
                <div class="flex items-center gap-3">
                  <div class="skeleton w-12 h-12 rounded-full"></div>
                  <div class="flex-1">
                    <div class="skeleton h-4 w-32 mb-2"></div>
                    <div class="skeleton h-3 w-24"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (!contactState.hasContacts()) {
          <div class="empty-state py-16">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div class="empty-title">No contacts found</div>
            <div class="empty-description">Get started by adding your first contact.</div>
            <a routerLink="/contacts/new" class="btn-primary mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </a>
          </div>
        } @else {
          <div class="divide-y divide-midnight-100">
            @for (contact of contactState.contacts(); track contact.id) {
              <a 
                [routerLink]="['/contacts', contact.id]" 
                class="flex items-center gap-4 p-4 hover:bg-midnight-50/50 transition-colors group"
              >
                @if (contact.photo_url) {
                  <img [src]="contact.photo_url" [alt]="contact.full_name" class="w-12 h-12 rounded-full object-cover" />
                } @else {
                  <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold">
                    {{ contact.first_name.charAt(0) }}{{ contact.last_name.charAt(0) }}
                  </div>
                }
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-midnight-900 group-hover:text-nexus-600 transition-colors">
                      {{ contact.full_name }}
                    </span>
                    @if (contact.is_primary) {
                      <span class="badge badge-success text-xs">Primary</span>
                    }
                  </div>
                  <div class="text-sm text-midnight-500">
                    @if (contact.title) {
                      {{ contact.title }}
                    }
                    @if (contact.organization) {
                      {{ contact.title ? ' at ' : '' }}{{ contact.organization.name }}
                    }
                  </div>
                </div>
                
                <div class="text-right hidden sm:block">
                  <div class="text-sm text-midnight-600">{{ contact.email }}</div>
                  @if (contact.phone.full) {
                    <div class="text-sm text-midnight-500">{{ contact.phone.full }}</div>
                  }
                </div>
                
                <span 
                  class="badge capitalize hidden md:inline-flex"
                  [class.badge-info]="contact.category === 'decision_maker'"
                  [class.badge-warning]="contact.category === 'technical'"
                  [class.badge-neutral]="contact.category === 'general'"
                >
                  {{ contact.category | titlecase }}
                </span>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class ContactListComponent implements OnInit {
  contactState = inject(ContactState);
  
  searchQuery = '';
  filters = signal<ContactFilters>({});
  categories = CONTACT_CATEGORIES;
  sources = CONTACT_SOURCES;
  
  private searchTimeout: any;
  
  ngOnInit(): void {
    this.contactState.loadContacts();
  }
  
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.update(f => ({ ...f, search: this.searchQuery, page: 1 }));
      this.loadWithFilters();
    }, 300);
  }
  
  onFilterChange(key: keyof ContactFilters, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value || undefined, page: 1 }));
    this.loadWithFilters();
  }
  
  loadWithFilters(): void {
    this.contactState.loadContacts(this.filters());
  }
}

