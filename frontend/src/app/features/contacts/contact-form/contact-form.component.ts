import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactState } from '../../../core/state/contact.state';
import { OrganizationState } from '../../../core/state/organization.state';
import { CreateContactDto, CONTACT_SOURCES, CONTACT_CATEGORIES, ContactCategory } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-enter max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/contacts" class="btn-ghost btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">
            {{ isEditMode ? 'Edit Contact' : 'New Contact' }}
          </h1>
          <p class="text-midnight-500 mt-1">
            {{ isEditMode ? 'Update contact information.' : 'Add a new contact to your CRM.' }}
          </p>
        </div>
      </div>
      
      @if (contactState.error()) {
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ contactState.error() }}
        </div>
      }
      
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
        <!-- Personal Information -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
          </div>
          <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- First Name -->
              <div class="form-group">
                <label for="first_name" class="label">First Name <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  [(ngModel)]="formData.first_name"
                  required
                  maxlength="100"
                  class="input"
                  placeholder="John"
                />
              </div>
              
              <!-- Last Name -->
              <div class="form-group">
                <label for="last_name" class="label">Last Name <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  [(ngModel)]="formData.last_name"
                  required
                  maxlength="100"
                  class="input"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="label">Email <span class="text-red-500">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="formData.email"
                required
                class="input"
                placeholder="john.doe@company.com"
              />
            </div>
            
            <!-- Phone -->
            <div class="form-group">
              <label class="label">Phone Number</label>
              <div class="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="text"
                    name="phone_country_code"
                    [(ngModel)]="formData.phone_country_code"
                    class="input text-center"
                    placeholder="+1"
                    maxlength="5"
                  />
                </div>
                <div class="col-span-2">
                  <input
                    type="tel"
                    name="phone_number"
                    [(ngModel)]="formData.phone_number"
                    class="input"
                    placeholder="555-123-4567"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="extension"
                    [(ngModel)]="formData.extension"
                    class="input"
                    placeholder="Ext."
                    maxlength="10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Work Information -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Work Information
            </h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Organization -->
            <div class="form-group">
              <label for="organization_id" class="label">Organization <span class="text-red-500">*</span></label>
              <select
                id="organization_id"
                name="organization_id"
                [(ngModel)]="formData.organization_id"
                required
                class="select"
              >
                <option value="">Select an organization...</option>
                @for (org of organizationState.organizations(); track org.id) {
                  <option [value]="org.id">{{ org.name }}</option>
                }
              </select>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title -->
              <div class="form-group">
                <label for="title" class="label">Job Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  [(ngModel)]="formData.title"
                  maxlength="100"
                  class="input"
                  placeholder="e.g., CEO, Director, Manager"
                />
              </div>
              
              <!-- Department -->
              <div class="form-group">
                <label for="department" class="label">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  [(ngModel)]="formData.department"
                  maxlength="100"
                  class="input"
                  placeholder="e.g., Sales, Engineering, HR"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Category -->
              <div class="form-group">
                <label for="category" class="label">Contact Category</label>
                <select
                  id="category"
                  name="category"
                  [(ngModel)]="formData.category"
                  class="select"
                >
                  @for (cat of categories; track cat.value) {
                    <option [value]="cat.value">{{ cat.label }}</option>
                  }
                </select>
              </div>
              
              <!-- Source -->
              <div class="form-group">
                <label for="source" class="label">Lead Source</label>
                <select
                  id="source"
                  name="source"
                  [(ngModel)]="formData.source"
                  class="select"
                >
                  <option value="">Select source...</option>
                  @for (src of sources; track src.value) {
                    <option [value]="src.value">{{ src.label }}</option>
                  }
                </select>
              </div>
            </div>
            
            <!-- Primary Contact Toggle -->
            <div class="flex items-center gap-3 p-4 bg-midnight-50 rounded-xl">
              <input
                type="checkbox"
                id="is_primary"
                name="is_primary"
                [(ngModel)]="formData.is_primary"
                class="w-5 h-5 rounded border-midnight-300 text-nexus-600 focus:ring-nexus-500"
              />
              <label for="is_primary" class="flex-1">
                <span class="font-medium text-midnight-900">Primary Contact</span>
                <p class="text-sm text-midnight-500">Mark as the main point of contact for this organization</p>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Additional Notes
            </h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="formData.notes"
                rows="4"
                class="textarea"
                placeholder="Any additional notes about this contact..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="flex items-center justify-between pt-4">
          <a routerLink="/contacts" class="btn-ghost">
            Cancel
          </a>
          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="contactState.isLoading() || !form.valid"
          >
            @if (contactState.isLoading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ isEditMode ? 'Update Contact' : 'Create Contact' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ContactFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  contactState = inject(ContactState);
  organizationState = inject(OrganizationState);
  
  sources = CONTACT_SOURCES;
  categories = CONTACT_CATEGORIES;
  
  isEditMode = false;
  contactId: string | null = null;
  
  formData: CreateContactDto = {
    organization_id: '',
    first_name: '',
    last_name: '',
    email: '',
    title: null,
    department: null,
    category: 'general',
    source: null,
    phone_country_code: '+1',
    phone_number: null,
    extension: null,
    notes: null,
    is_primary: false,
  };
  
  ngOnInit(): void {
    // Load organizations for the dropdown
    this.organizationState.loadOrganizations({ per_page: 100 });
    
    // Check if we're editing
    this.contactId = this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.isEditMode = true;
      this.loadContact();
    }
    
    // Check for pre-selected organization from query params
    const orgId = this.route.snapshot.queryParamMap.get('organization_id');
    if (orgId) {
      this.formData.organization_id = orgId;
    }
  }
  
  private loadContact(): void {
    if (!this.contactId) return;
    
    this.contactState.loadContact(this.contactId);
    
    // Wait for contact to load and populate form
    const checkContact = setInterval(() => {
      const contact = this.contactState.selectedContact();
      if (contact && contact.id === this.contactId) {
        this.formData = {
          organization_id: contact.organization_id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          title: contact.title,
          department: contact.department,
          category: contact.category,
          source: contact.source,
          phone_country_code: contact.phone?.country_code || '+1',
          phone_number: contact.phone?.number || null,
          extension: contact.phone?.extension || null,
          notes: contact.notes,
          is_primary: contact.is_primary,
        };
        clearInterval(checkContact);
      }
    }, 100);
    
    // Clear interval after 5 seconds to avoid memory leak
    setTimeout(() => clearInterval(checkContact), 5000);
  }
  
  async onSubmit(): Promise<void> {
    try {
      if (this.isEditMode && this.contactId) {
        await this.contactState.updateContact(this.contactId, this.formData);
      } else {
        await this.contactState.createContact(this.formData);
      }
      this.router.navigate(['/contacts']);
    } catch (error) {
      // Error is handled by the state
      console.error('Failed to save contact:', error);
    }
  }
}
