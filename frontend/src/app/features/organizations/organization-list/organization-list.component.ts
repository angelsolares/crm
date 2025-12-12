import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { OrganizationState } from '../../../core/state/organization.state';
import { OrganizationFilters } from '../../../core/models/organization.model';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [RouterLink, FormsModule, TitleCasePipe, DatePipe],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Organizations</h1>
          <p class="text-midnight-500 mt-1">Manage your corporate hierarchy and relationships.</p>
        </div>
        <a routerLink="/organizations/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Organization
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
                  placeholder="Search organizations..."
                  class="input pl-10"
                />
              </div>
            </div>
            
            <!-- Type Filter -->
            <select 
              [(ngModel)]="filters().type"
              (ngModelChange)="onFilterChange('type', $event)"
              class="select w-40"
            >
              <option value="">All Types</option>
              <option value="parent">Parent</option>
              <option value="subsidiary">Subsidiary</option>
              <option value="branch">Branch</option>
            </select>
            
            <!-- Status Filter -->
            <select 
              [(ngModel)]="filters().status"
              (ngModelChange)="onFilterChange('status', $event)"
              class="select w-40"
            >
              <option value="">All Statuses</option>
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <!-- Industry Filter -->
            <select 
              [(ngModel)]="filters().industry_id"
              (ngModelChange)="onFilterChange('industry_id', $event)"
              class="select w-48"
            >
              <option value="">All Industries</option>
              @for (industry of orgState.industries(); track industry.id) {
                <option [value]="industry.id">{{ industry.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>
      
      <!-- Organizations Table -->
      <div class="card overflow-hidden">
        @if (orgState.isLoading()) {
          <div class="p-6 space-y-4">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="flex items-center gap-4">
                <div class="skeleton w-12 h-12 rounded-xl"></div>
                <div class="flex-1">
                  <div class="skeleton h-4 w-48 mb-2"></div>
                  <div class="skeleton h-3 w-32"></div>
                </div>
                <div class="skeleton h-6 w-20 rounded-full"></div>
              </div>
            }
          </div>
        } @else if (!orgState.hasOrganizations()) {
          <div class="empty-state py-16">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div class="empty-title">No organizations found</div>
            <div class="empty-description">
              @if (hasActiveFilters()) {
                Try adjusting your filters or search query.
              } @else {
                Get started by creating your first organization.
              }
            </div>
            @if (!hasActiveFilters()) {
              <a routerLink="/organizations/new" class="btn-primary mt-4">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Organization
              </a>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Contacts</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (org of orgState.organizations(); track org.id) {
                  <tr class="group">
                    <td>
                      <a [routerLink]="['/organizations', org.id]" class="flex items-center gap-3">
                        @if (org.logo_url) {
                          <img [src]="org.logo_url" [alt]="org.name" class="w-10 h-10 rounded-lg object-cover" />
                        } @else {
                          <div class="w-10 h-10 rounded-lg bg-nexus-100 flex items-center justify-center text-nexus-700 font-semibold">
                            {{ org.name.charAt(0) }}
                          </div>
                        }
                        <div>
                          <div class="font-medium text-midnight-900 group-hover:text-nexus-600 transition-colors">
                            {{ org.name }}
                          </div>
                          @if (org.email) {
                            <div class="text-sm text-midnight-500">{{ org.email }}</div>
                          }
                        </div>
                      </a>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        @if (org.depth > 1) {
                          <span class="text-midnight-300">
                            @for (_ of getDepthIndicators(org.depth); track $index) {
                              └
                            }
                          </span>
                        }
                        <span class="text-midnight-600">{{ org.type | titlecase }}</span>
                      </div>
                    </td>
                    <td>
                      @if (org.industry) {
                        <span class="text-midnight-600">{{ org.industry.name }}</span>
                      } @else {
                        <span class="text-midnight-400">—</span>
                      }
                    </td>
                    <td>
                      <span 
                        class="badge"
                        [class.badge-success]="org.status === 'client'"
                        [class.badge-info]="org.status === 'prospect'"
                        [class.badge-neutral]="org.status === 'inactive'"
                      >
                        {{ org.status | titlecase }}
                      </span>
                    </td>
                    <td>
                      <span class="text-midnight-600">{{ org.contacts_count ?? 0 }}</span>
                    </td>
                    <td>
                      <span class="text-midnight-500 text-sm">
                        {{ org.created_at | date:'MMM d, y' }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          [routerLink]="['/organizations', org.id, 'edit']"
                          class="btn-ghost btn-icon"
                          title="Edit"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                        <button 
                          (click)="deleteOrganization(org.id)"
                          class="btn-ghost btn-icon text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          @if (orgState.pagination().lastPage > 1) {
            <div class="px-6 py-4 border-t border-midnight-100 flex items-center justify-between">
              <div class="text-sm text-midnight-500">
                Showing {{ (orgState.pagination().currentPage - 1) * orgState.pagination().perPage + 1 }} 
                to {{ Math.min(orgState.pagination().currentPage * orgState.pagination().perPage, orgState.pagination().total) }}
                of {{ orgState.pagination().total }} results
              </div>
              <div class="flex items-center gap-2">
                <button 
                  (click)="goToPage(orgState.pagination().currentPage - 1)"
                  [disabled]="orgState.pagination().currentPage === 1"
                  class="btn-ghost btn-icon"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    class="btn-ghost px-3 py-1 text-sm"
                    [class.bg-nexus-100]="page === orgState.pagination().currentPage"
                    [class.text-nexus-700]="page === orgState.pagination().currentPage"
                  >
                    {{ page }}
                  </button>
                }
                
                <button 
                  (click)="goToPage(orgState.pagination().currentPage + 1)"
                  [disabled]="orgState.pagination().currentPage === orgState.pagination().lastPage"
                  class="btn-ghost btn-icon"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: ``
})
export class OrganizationListComponent implements OnInit {
  orgState = inject(OrganizationState);
  
  searchQuery = '';
  filters = signal<OrganizationFilters>({});
  
  private searchTimeout: any;
  Math = Math;
  
  ngOnInit(): void {
    this.orgState.loadOrganizations();
  }
  
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.update(f => ({ ...f, search: this.searchQuery, page: 1 }));
      this.loadWithFilters();
    }, 300);
  }
  
  onFilterChange(key: keyof OrganizationFilters, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value || undefined, page: 1 }));
    this.loadWithFilters();
  }
  
  loadWithFilters(): void {
    this.orgState.loadOrganizations(this.filters());
  }
  
  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.search || f.type || f.status || f.industry_id);
  }
  
  goToPage(page: number): void {
    this.filters.update(f => ({ ...f, page }));
    this.loadWithFilters();
  }
  
  getPageNumbers(): number[] {
    const current = this.orgState.pagination().currentPage;
    const last = this.orgState.pagination().lastPage;
    const pages: number[] = [];
    
    for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  getDepthIndicators(depth: number): number[] {
    return Array(depth - 1).fill(0);
  }
  
  async deleteOrganization(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        await this.orgState.deleteOrganization(id);
      } catch (error) {
        alert('Failed to delete organization. It may have subsidiaries or associated data.');
      }
    }
  }
}

