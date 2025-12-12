import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrganizationState } from '../../../core/state/organization.state';
import { Organization, CreateOrganizationDto } from '../../../core/models/organization.model';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-enter max-w-4xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/organizations" class="btn-ghost btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">
            @if (isEditMode()) {
              Edit Organization
            } @else if (preselectedParentId()) {
              New Subsidiary / Branch
            } @else {
              New Organization
            }
          </h1>
          <p class="text-midnight-500 mt-1">
            @if (isEditMode()) {
              Update organization details.
            } @else if (preselectedParentId()) {
              Add a child organization under the parent.
            } @else {
              Add a new organization to your CRM.
            }
          </p>
        </div>
      </div>
      
      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Information -->
        <div class="card">
          <div class="card-header">
            <h2 class="font-display font-semibold text-midnight-900">Basic Information</h2>
          </div>
          <div class="card-body space-y-4">
            <!-- Parent Organization (for subsidiaries/branches) -->
            <div [class.bg-nexus-50]="preselectedParentId()" [class.p-4]="preselectedParentId()" [class.rounded-xl]="preselectedParentId()" [class.border]="preselectedParentId()" [class.border-nexus-200]="preselectedParentId()">
              @if (preselectedParentId()) {
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span class="font-medium text-nexus-700">Creating a subsidiary/branch under:</span>
                </div>
              }
              <label class="label">{{ preselectedParentId() ? 'Parent Organization' : 'Parent Organization (optional)' }}</label>
              <select formControlName="parent_id" class="select" [class.bg-white]="preselectedParentId()">
                <option value="">None (Standalone Organization)</option>
                @for (org of parentOrganizations(); track org.id) {
                  <option [value]="org.id">
                    {{ org.name }} ({{ org.type }})
                  </option>
                }
              </select>
              @if (!preselectedParentId()) {
                <p class="text-xs text-midnight-500 mt-1">
                  Select a parent to create a subsidiary or branch.
                </p>
              }
            </div>
            
            <!-- Name -->
            <div>
              <label class="label">Organization Name *</label>
              <input 
                type="text" 
                formControlName="name" 
                class="input"
                [class.input-error]="form.get('name')?.touched && form.get('name')?.invalid"
                placeholder="Acme Corporation"
              />
              @if (form.get('name')?.touched && form.get('name')?.hasError('required')) {
                <p class="text-red-500 text-sm mt-1">Organization name is required.</p>
              }
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Industry -->
              <div>
                <label class="label">Industry</label>
                <select formControlName="industry_id" class="select">
                  <option value="">Select Industry</option>
                  @for (industry of orgState.industries(); track industry.id) {
                    <option [value]="industry.id">{{ industry.name }}</option>
                  }
                </select>
              </div>
              
              <!-- Size -->
              <div>
                <label class="label">Company Size</label>
                <select formControlName="size" class="select">
                  <option value="">Select Size</option>
                  <option value="small">Small (1-50 employees)</option>
                  <option value="medium">Medium (51-200 employees)</option>
                  <option value="large">Large (201-1000 employees)</option>
                  <option value="enterprise">Enterprise (1000+ employees)</option>
                </select>
              </div>
            </div>
            
            <!-- Status -->
            <div>
              <label class="label">Status</label>
              <div class="flex items-center gap-4">
                @for (status of ['prospect', 'client', 'inactive']; track status) {
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      formControlName="status" 
                      [value]="status"
                      class="w-4 h-4 text-nexus-600 focus:ring-nexus-500"
                    />
                    <span class="text-midnight-700 capitalize">{{ status }}</span>
                  </label>
                }
              </div>
            </div>
          </div>
        </div>
        
        <!-- Contact Information -->
        <div class="card">
          <div class="card-header">
            <h2 class="font-display font-semibold text-midnight-900">Contact Information</h2>
          </div>
          <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Email -->
              <div>
                <label class="label">Email</label>
                <input 
                  type="email" 
                  formControlName="email" 
                  class="input"
                  [class.input-error]="form.get('email')?.touched && form.get('email')?.invalid"
                  placeholder="contact&#64;company.com"
                />
                @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                  <p class="text-red-500 text-sm mt-1">Please enter a valid email.</p>
                }
              </div>
              
              <!-- Website -->
              <div>
                <label class="label">Website</label>
                <input 
                  type="url" 
                  formControlName="website" 
                  class="input"
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Phone Country Code -->
              <div>
                <label class="label">Country Code</label>
                <select formControlName="phone_country_code" class="select">
                  <option value="">Select</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+52">+52 (MX)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+55">+55 (BR)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+91">+91 (IN)</option>
                </select>
              </div>
              
              <!-- Phone Number -->
              <div class="md:col-span-2">
                <label class="label">Phone Number</label>
                <input 
                  type="tel" 
                  formControlName="phone_number" 
                  class="input"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Address -->
        <div class="card" formGroupName="address_data">
          <div class="card-header">
            <h2 class="font-display font-semibold text-midnight-900">Address</h2>
          </div>
          <div class="card-body space-y-4">
            <!-- Street -->
            <div>
              <label class="label">Street Address</label>
              <input 
                type="text" 
                formControlName="street" 
                class="input"
                placeholder="123 Main Street"
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- City -->
              <div>
                <label class="label">City</label>
                <input 
                  type="text" 
                  formControlName="city" 
                  class="input"
                  placeholder="San Francisco"
                />
              </div>
              
              <!-- State -->
              <div>
                <label class="label">State / Province</label>
                <input 
                  type="text" 
                  formControlName="state" 
                  class="input"
                  placeholder="California"
                />
              </div>
              
              <!-- Postal Code -->
              <div>
                <label class="label">Postal Code</label>
                <input 
                  type="text" 
                  formControlName="postal_code" 
                  class="input"
                  placeholder="94102"
                />
              </div>
            </div>
            
            <!-- Country -->
            <div>
              <label class="label">Country</label>
              <input 
                type="text" 
                formControlName="country" 
                class="input"
                placeholder="United States"
              />
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        <div class="card">
          <div class="card-header">
            <h2 class="font-display font-semibold text-midnight-900">Additional Notes</h2>
          </div>
          <div class="card-body">
            <textarea 
              formControlName="notes" 
              rows="4"
              class="textarea"
              placeholder="Any additional information about this organization..."
            ></textarea>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <a routerLink="/organizations" class="btn-secondary">
            Cancel
          </a>
          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="form.invalid || isSubmitting()"
          >
            @if (isSubmitting()) {
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              {{ isEditMode() ? 'Update Organization' : 'Create Organization' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: ``
})
export class OrganizationFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  orgState = inject(OrganizationState);
  
  form: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  organizationId = signal<string | null>(null);
  parentOrganizations = signal<Organization[]>([]);
  preselectedParentId = signal<string | null>(null);
  
  constructor() {
    this.form = this.fb.group({
      parent_id: [''],
      name: ['', Validators.required],
      industry_id: [''],
      size: [''],
      status: ['prospect'],
      email: ['', Validators.email],
      website: [''],
      phone_country_code: [''],
      phone_number: [''],
      address_data: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        postal_code: [''],
        country: ['']
      }),
      notes: ['']
    });
  }
  
  ngOnInit(): void {
    // Load industries if not loaded
    if (this.orgState.industries().length === 0) {
      this.orgState.loadIndustries();
    }
    
    // Load parent organizations for dropdown
    this.loadParentOrganizations();
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.organizationId.set(id);
      this.loadOrganization(id);
    } else {
      // Check for parent_id in query params (for creating subsidiaries/branches)
      const parentId = this.route.snapshot.queryParamMap.get('parent_id');
      if (parentId) {
        this.preselectedParentId.set(parentId);
        this.form.patchValue({ parent_id: parentId });
      }
    }
  }
  
  private loadParentOrganizations(): void {
    // Load all organizations that can be parents (parent or subsidiary, not branches)
    // We need to make a separate API call and store the result
    this.orgState.loadOrganizations({ per_page: 100 });
    
    // Wait for organizations to load and filter for potential parents
    const checkLoaded = setInterval(() => {
      const orgs = this.orgState.organizations();
      if (orgs.length > 0 || !this.orgState.isLoading()) {
        // Filter out branches - only parent and subsidiary can be parents
        const potentialParents = orgs.filter(org => org.type !== 'branch');
        this.parentOrganizations.set(potentialParents);
        clearInterval(checkLoaded);
      }
    }, 100);
    
    // Clear interval after 5 seconds to avoid memory leak
    setTimeout(() => clearInterval(checkLoaded), 5000);
  }
  
  private loadOrganization(id: string): void {
    this.orgState.loadOrganization(id);
    
    // Subscribe to changes (in a real app, use effect() or computed())
    // For simplicity, we'll poll the state
    const checkLoaded = setInterval(() => {
      const org = this.orgState.selectedOrganization();
      if (org && org.id === id) {
        this.patchForm(org);
        clearInterval(checkLoaded);
      }
    }, 100);
  }
  
  private patchForm(org: Organization): void {
    this.form.patchValue({
      parent_id: org.parent?.id || '',
      name: org.name,
      industry_id: org.industry?.id || '',
      size: org.size || '',
      status: org.status,
      email: org.email || '',
      website: org.website || '',
      phone_country_code: org.phone.country_code || '',
      phone_number: org.phone.number || '',
      address_data: {
        street: org.address?.street || '',
        city: org.address?.city || '',
        state: org.address?.state || '',
        postal_code: org.address?.postal_code || '',
        country: org.address?.country || ''
      },
      notes: org.notes || ''
    });
  }
  
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    
    this.isSubmitting.set(true);
    
    const formValue = this.form.value;
    const data: CreateOrganizationDto = {
      name: formValue.name,
      parent_id: formValue.parent_id || null,
      industry_id: formValue.industry_id ? parseInt(formValue.industry_id) : null,
      size: formValue.size || null,
      status: formValue.status,
      email: formValue.email || null,
      website: formValue.website || null,
      phone_country_code: formValue.phone_country_code || null,
      phone_number: formValue.phone_number || null,
      address_data: this.cleanAddressData(formValue.address_data),
      notes: formValue.notes || null
    };
    
    try {
      if (this.isEditMode()) {
        await this.orgState.updateOrganization(this.organizationId()!, data);
        this.router.navigate(['/organizations', this.organizationId()]);
      } else {
        const org = await this.orgState.createOrganization(data);
        this.router.navigate(['/organizations', org.id]);
      }
    } catch (error) {
      console.error('Failed to save organization:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
  
  private cleanAddressData(address: any): any {
    // Remove empty fields
    const cleaned: any = {};
    for (const key of Object.keys(address)) {
      if (address[key]) {
        cleaned[key] = address[key];
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
}

