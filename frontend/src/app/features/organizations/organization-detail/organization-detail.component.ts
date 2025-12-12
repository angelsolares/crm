import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { OrganizationState } from '../../../core/state/organization.state';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  template: `
    <div class="page-enter space-y-6">
      @if (orgState.isLoading()) {
        <!-- Loading State -->
        <div class="animate-pulse space-y-6">
          <div class="flex items-center gap-4">
            <div class="skeleton w-12 h-12 rounded-xl"></div>
            <div>
              <div class="skeleton h-8 w-64 mb-2"></div>
              <div class="skeleton h-4 w-40"></div>
            </div>
          </div>
          <div class="skeleton h-64 rounded-2xl"></div>
        </div>
      } @else if (organization()) {
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex items-start gap-4">
            <a routerLink="/organizations" class="btn-ghost btn-icon mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            
            @if (organization()!.logo_url) {
              <img 
                [src]="organization()!.logo_url" 
                [alt]="organization()!.name"
                class="w-16 h-16 rounded-2xl object-cover"
              />
            } @else {
              <div class="w-16 h-16 rounded-2xl bg-nexus-100 flex items-center justify-center text-nexus-700 font-display font-bold text-2xl">
                {{ organization()!.name.charAt(0) }}
              </div>
            }
            
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-display font-bold text-midnight-900">
                  {{ organization()!.name }}
                </h1>
                <span 
                  class="badge"
                  [class.badge-success]="organization()!.status === 'client'"
                  [class.badge-info]="organization()!.status === 'prospect'"
                  [class.badge-neutral]="organization()!.status === 'inactive'"
                >
                  {{ organization()!.status | titlecase }}
                </span>
              </div>
              <div class="flex items-center gap-4 mt-1 text-midnight-500">
                @if (organization()!.industry) {
                  <span>{{ organization()!.industry!.name }}</span>
                }
                @if (organization()!.size) {
                  <span>•</span>
                  <span class="capitalize">{{ organization()!.size }} Company</span>
                }
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <a 
              [routerLink]="['/organizations', organization()!.id, 'edit']"
              class="btn-secondary"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </a>
            <button (click)="deleteOrganization()" class="btn-danger">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="border-b border-midnight-200">
          <nav class="flex gap-6">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                class="relative py-3 text-sm font-medium transition-colors"
                [class.text-nexus-600]="activeTab() === tab.id"
                [class.text-midnight-500]="activeTab() !== tab.id"
              >
                {{ tab.label }}
                @if (activeTab() === tab.id) {
                  <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-600 rounded-full"></span>
                }
              </button>
            }
          </nav>
        </div>
        
        <!-- Tab Content -->
        @switch (activeTab()) {
          @case ('details') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Main Info -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Contact Info -->
                <div class="card">
                  <div class="card-header">
                    <h2 class="font-display font-semibold text-midnight-900">Contact Information</h2>
                  </div>
                  <div class="card-body">
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt class="text-sm text-midnight-500">Email</dt>
                        <dd class="mt-1 font-medium text-midnight-900">
                          @if (organization()!.email) {
                            <a [href]="'mailto:' + organization()!.email" class="hover:text-nexus-600">
                              {{ organization()!.email }}
                            </a>
                          } @else {
                            <span class="text-midnight-400">Not provided</span>
                          }
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm text-midnight-500">Phone</dt>
                        <dd class="mt-1 font-medium text-midnight-900">
                          {{ organization()!.phone.full || 'Not provided' }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm text-midnight-500">Website</dt>
                        <dd class="mt-1 font-medium text-midnight-900">
                          @if (organization()!.website) {
                            <a [href]="organization()!.website" target="_blank" class="hover:text-nexus-600">
                              {{ organization()!.website }}
                            </a>
                          } @else {
                            <span class="text-midnight-400">Not provided</span>
                          }
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm text-midnight-500">Address</dt>
                        <dd class="mt-1 font-medium text-midnight-900">
                          {{ organization()!.formatted_address || 'Not provided' }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <!-- Notes -->
                @if (organization()!.notes) {
                  <div class="card">
                    <div class="card-header">
                      <h2 class="font-display font-semibold text-midnight-900">Notes</h2>
                    </div>
                    <div class="card-body">
                      <p class="text-midnight-600 whitespace-pre-wrap">{{ organization()!.notes }}</p>
                    </div>
                  </div>
                }
              </div>
              
              <!-- Sidebar -->
              <div class="space-y-6">
                <!-- Quick Actions -->
                <div class="card">
                  <div class="card-header">
                    <h2 class="font-display font-semibold text-midnight-900">Quick Actions</h2>
                  </div>
                  <div class="card-body space-y-2">
                    <a 
                      routerLink="/contacts/new"
                      [queryParams]="{organization_id: organization()!.id}"
                      class="btn-ghost w-full justify-start"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add Contact
                    </a>
                    <a 
                      routerLink="/projects/new"
                      [queryParams]="{organization_id: organization()!.id}"
                      class="btn-ghost w-full justify-start"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Create Project
                    </a>
                    <a 
                      routerLink="/meetings/new"
                      [queryParams]="{organization_id: organization()!.id}"
                      class="btn-ghost w-full justify-start"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Meeting
                    </a>
                    @if (organization()!.type !== 'branch') {
                      <a 
                        routerLink="/organizations/new"
                        [queryParams]="{parent_id: organization()!.id}"
                        class="btn-ghost w-full justify-start"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Add {{ organization()!.type === 'parent' ? 'Subsidiary' : 'Branch' }}
                      </a>
                    }
                  </div>
                </div>
                
                <!-- Metadata -->
                <div class="card">
                  <div class="card-header">
                    <h2 class="font-display font-semibold text-midnight-900">Details</h2>
                  </div>
                  <div class="card-body space-y-3">
                    <div class="flex justify-between text-sm">
                      <span class="text-midnight-500">Type</span>
                      <span class="font-medium text-midnight-900 capitalize">{{ organization()!.type }}</span>
                    </div>
                    @if (organization()!.parent) {
                      <div class="flex justify-between text-sm">
                        <span class="text-midnight-500">Parent</span>
                        <a 
                          [routerLink]="['/organizations', organization()!.parent!.id]"
                          class="font-medium text-nexus-600 hover:text-nexus-700"
                        >
                          {{ organization()!.parent!.name }}
                        </a>
                      </div>
                    }
                    <div class="flex justify-between text-sm">
                      <span class="text-midnight-500">Created</span>
                      <span class="font-medium text-midnight-900">
                        {{ organization()!.created_at | date:'MMM d, y' }}
                      </span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-midnight-500">Updated</span>
                      <span class="font-medium text-midnight-900">
                        {{ organization()!.updated_at | date:'MMM d, y' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          
          @case ('subsidiaries') {
            <div class="card">
              <div class="card-body">
                @if (organization()!.children && organization()!.children!.length > 0) {
                  <div class="divide-y divide-midnight-100">
                    @for (child of organization()!.children; track child.id) {
                      <a 
                        [routerLink]="['/organizations', child.id]"
                        class="flex items-center gap-4 py-4 hover:bg-midnight-50/50 -mx-6 px-6 transition-colors"
                      >
                        <div class="w-10 h-10 rounded-lg bg-nexus-100 flex items-center justify-center text-nexus-700 font-semibold">
                          {{ child.name.charAt(0) }}
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-midnight-900">{{ child.name }}</div>
                          <div class="text-sm text-midnight-500 capitalize">{{ child.type }}</div>
                        </div>
                        <svg class="w-5 h-5 text-midnight-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    }
                  </div>
                } @else {
                  <div class="empty-state py-12">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div class="empty-title">No subsidiaries or branches</div>
                    <div class="empty-description">Add child organizations to build your hierarchy.</div>
                    @if (organization()!.type !== 'branch') {
                      <a 
                        routerLink="/organizations/new"
                        [queryParams]="{parent_id: organization()!.id}"
                        class="btn-primary mt-4"
                      >
                        Add {{ organization()!.type === 'parent' ? 'Subsidiary' : 'Branch' }}
                      </a>
                    }
                  </div>
                }
              </div>
            </div>
          }
          
          @case ('contacts') {
            <div class="card">
              <div class="card-body">
                @if (organization()!.contacts && organization()!.contacts!.length > 0) {
                  <div class="divide-y divide-midnight-100">
                    @for (contact of organization()!.contacts; track contact.id) {
                      <a 
                        [routerLink]="['/contacts', contact.id]"
                        class="flex items-center gap-4 py-4 hover:bg-midnight-50/50 -mx-6 px-6 transition-colors"
                      >
                        <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold text-sm">
                          {{ contact.first_name.charAt(0) }}{{ contact.last_name.charAt(0) }}
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-midnight-900">{{ contact.full_name }}</div>
                          <div class="text-sm text-midnight-500">{{ contact.title || contact.email }}</div>
                        </div>
                        @if (contact.is_primary) {
                          <span class="badge badge-success">Primary</span>
                        }
                        <svg class="w-5 h-5 text-midnight-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    }
                  </div>
                } @else {
                  <div class="empty-state py-12">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div class="empty-title">No contacts yet</div>
                    <div class="empty-description">Add contacts to this organization.</div>
                    <a 
                      routerLink="/contacts/new"
                      [queryParams]="{organization_id: organization()!.id}"
                      class="btn-primary mt-4"
                    >
                      Add Contact
                    </a>
                  </div>
                }
              </div>
            </div>
          }
        }
      } @else {
        <!-- Not Found -->
        <div class="empty-state py-16">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="empty-title">Organization not found</div>
          <div class="empty-description">The organization you're looking for doesn't exist.</div>
          <a routerLink="/organizations" class="btn-primary mt-4">
            Back to Organizations
          </a>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class OrganizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  orgState = inject(OrganizationState);
  
  organization = computed(() => this.orgState.selectedOrganization());
  activeTab = signal<'details' | 'subsidiaries' | 'contacts'>('details');
  
  tabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'subsidiaries' as const, label: 'Subsidiaries & Branches' },
    { id: 'contacts' as const, label: 'Contacts' },
  ];
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orgState.loadOrganization(id);
    }
  }
  
  async deleteOrganization(): Promise<void> {
    if (!this.organization()) return;
    
    if (confirm(`Are you sure you want to delete "${this.organization()!.name}"? This action cannot be undone.`)) {
      try {
        await this.orgState.deleteOrganization(this.organization()!.id);
        this.router.navigate(['/organizations']);
      } catch (error) {
        alert('Failed to delete organization. It may have subsidiaries or associated data.');
      }
    }
  }
}

