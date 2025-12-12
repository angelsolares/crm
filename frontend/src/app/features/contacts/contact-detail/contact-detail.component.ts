import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ContactState } from '../../../core/state/contact.state';
import { CONTACT_CATEGORIES, CONTACT_SOURCES } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-enter">
      <!-- Loading State -->
      @if (contactState.isLoading() && !contact()) {
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-nexus-500 border-t-transparent"></div>
        </div>
      }
      
      <!-- Error State -->
      @if (contactState.error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-red-600 mb-4">{{ contactState.error() }}</p>
          <a routerLink="/contacts" class="btn-primary">Back to Contacts</a>
        </div>
      }
      
      <!-- Contact Details -->
      @if (contact(); as contact) {
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div class="flex items-start gap-5">
            <a routerLink="/contacts" class="btn-ghost btn-icon mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            
            <!-- Avatar -->
            <div class="relative">
              @if (contact.photo_url) {
                <img [src]="contact.photo_url" [alt]="contact.full_name" class="w-20 h-20 rounded-2xl object-cover" />
              } @else {
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-nexus-400 to-nexus-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {{ getInitials(contact.full_name) }}
                </div>
              }
              @if (contact.is_primary) {
                <div class="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg" title="Primary Contact">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              }
            </div>
            
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-display font-bold text-midnight-900">
                  {{ contact.full_name }}
                </h1>
                <span [class]="getStatusClass(contact.status)">
                  {{ contact.status }}
                </span>
              </div>
              @if (contact.title) {
                <p class="text-lg text-midnight-600">{{ contact.title }}</p>
              }
              @if (contact.organization) {
                <a 
                  [routerLink]="['/organizations', contact.organization.id]" 
                  class="text-nexus-600 hover:text-nexus-700 font-medium flex items-center gap-1 mt-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ contact.organization.name }}
                </a>
              }
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-2 ml-16 lg:ml-0">
            <a [routerLink]="['/contacts', contact.id, 'edit']" class="btn-ghost">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </a>
            <button (click)="sendEmail()" class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Contact Information -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
              </div>
              <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Email -->
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-nexus-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-midnight-500 mb-1">Email</p>
                      <a [href]="'mailto:' + contact.email" class="text-midnight-900 hover:text-nexus-600 font-medium">
                        {{ contact.email }}
                      </a>
                    </div>
                  </div>
                  
                  <!-- Phone -->
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-midnight-500 mb-1">Phone</p>
                      @if (contact.phone?.full) {
                        <a [href]="'tel:' + contact.phone.full" class="text-midnight-900 hover:text-nexus-600 font-medium">
                          {{ contact.phone.full }}
                        </a>
                      } @else {
                        <span class="text-midnight-400">Not provided</span>
                      }
                    </div>
                  </div>
                  
                  <!-- Department -->
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-midnight-500 mb-1">Department</p>
                      <p class="text-midnight-900 font-medium">
                        {{ contact.department || 'Not specified' }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Category -->
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-midnight-500 mb-1">Category</p>
                      <span [class]="getCategoryClass(contact.category)">
                        {{ getCategoryLabel(contact.category) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            @if (contact.notes) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title flex items-center gap-2">
                    <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Notes
                  </h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap">{{ contact.notes }}</p>
                </div>
              </div>
            }
            
            <!-- Activity Timeline (Placeholder) -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                  <svg class="w-5 h-5 text-nexus-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
              </div>
              <div class="card-body">
                <div class="text-center py-8">
                  <svg class="w-12 h-12 text-midnight-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-midnight-500">No recent activity</p>
                  <p class="text-sm text-midnight-400 mt-1">Meetings and interactions will appear here</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
              </div>
              <div class="card-body space-y-2">
                <a [routerLink]="['/meetings/new']" [queryParams]="{contact_id: contact.id}" class="w-full btn-outline justify-start">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Meeting
                </a>
                <button (click)="callPhone()" class="w-full btn-outline justify-start" [disabled]="!contact.phone?.full">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Contact
                </button>
                @if (contact.organization) {
                  <a [routerLink]="['/projects/new']" [queryParams]="{organization_id: contact.organization.id}" class="w-full btn-outline justify-start">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    New Project
                  </a>
                }
              </div>
            </div>
            
            <!-- Lead Source -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Lead Information</h3>
              </div>
              <div class="card-body space-y-4">
                <div>
                  <p class="text-sm text-midnight-500 mb-1">Source</p>
                  <p class="font-medium text-midnight-900">
                    {{ getSourceLabel(contact.source) || 'Not specified' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-midnight-500 mb-1">Primary Contact</p>
                  <p class="font-medium">
                    @if (contact.is_primary) {
                      <span class="text-amber-600 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Yes
                      </span>
                    } @else {
                      <span class="text-midnight-500">No</span>
                    }
                  </p>
                </div>
                <div>
                  <p class="text-sm text-midnight-500 mb-1">Added</p>
                  <p class="font-medium text-midnight-900">
                    {{ formatDate(contact.created_at) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-midnight-500 mb-1">Last Updated</p>
                  <p class="font-medium text-midnight-900">
                    {{ formatDate(contact.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Organization Card -->
            @if (contact.organization; as org) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Organization</h3>
                </div>
                <div class="card-body">
                  <a [routerLink]="['/organizations', org.id]" class="block group">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-midnight-100 to-midnight-200 flex items-center justify-center text-midnight-600 font-bold">
                        {{ org.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-semibold text-midnight-900 group-hover:text-nexus-600 transition-colors">
                          {{ org.name }}
                        </p>
                        @if (org.industry) {
                          <p class="text-sm text-midnight-500">{{ org.industry.name }}</p>
                        }
                      </div>
                    </div>
                  </a>
                  @if (org.website) {
                    <a [href]="org.website" target="_blank" class="text-sm text-nexus-600 hover:text-nexus-700 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Website
                    </a>
                  }
                </div>
              </div>
            }
            
            <!-- Danger Zone -->
            <div class="card border-red-200 bg-red-50/50">
              <div class="card-header border-red-200">
                <h3 class="card-title text-red-700">Danger Zone</h3>
              </div>
              <div class="card-body">
                <p class="text-sm text-red-600 mb-3">
                  Once deleted, this contact cannot be recovered.
                </p>
                <button 
                  (click)="deleteContact()" 
                  class="w-full btn-danger"
                  [disabled]="isDeleting()"
                >
                  @if (isDeleting()) {
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  } @else {
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Contact
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ContactDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  contactState = inject(ContactState);
  
  isDeleting = signal(false);
  
  contact = computed(() => this.contactState.selectedContact());
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contactState.loadContact(id);
    }
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  
  getStatusClass(status: string): string {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    return status === 'active' 
      ? `${base} bg-emerald-100 text-emerald-700`
      : `${base} bg-midnight-100 text-midnight-600`;
  }
  
  getCategoryClass(category: string): string {
    const base = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (category) {
      case 'decision_maker':
        return `${base} bg-purple-100 text-purple-700`;
      case 'technical':
        return `${base} bg-blue-100 text-blue-700`;
      case 'procurement':
        return `${base} bg-amber-100 text-amber-700`;
      default:
        return `${base} bg-midnight-100 text-midnight-600`;
    }
  }
  
  getCategoryLabel(category: string): string {
    const found = CONTACT_CATEGORIES.find(c => c.value === category);
    return found?.label || category;
  }
  
  getSourceLabel(source: string | null): string | null {
    if (!source) return null;
    const found = CONTACT_SOURCES.find(s => s.value === source);
    return found?.label || source;
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  sendEmail(): void {
    const contact = this.contact();
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
    }
  }
  
  callPhone(): void {
    const contact = this.contact();
    if (contact?.phone?.full) {
      window.location.href = `tel:${contact.phone.full}`;
    }
  }
  
  async deleteContact(): Promise<void> {
    const contact = this.contact();
    if (!contact) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${contact.full_name}? This action cannot be undone.`);
    if (!confirmed) return;
    
    this.isDeleting.set(true);
    try {
      await this.contactState.deleteContact(contact.id);
      this.router.navigate(['/contacts']);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    } finally {
      this.isDeleting.set(false);
    }
  }
}
