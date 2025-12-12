import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProjectState } from '../../../core/state/project.state';
import { OrganizationState } from '../../../core/state/organization.state';
import { ContactState } from '../../../core/state/contact.state';
import { 
  CreateProjectDto, 
  Project, 
  PROJECT_STAGES, 
  PROJECT_STATUSES,
  ProjectStage,
  ProjectStatus
} from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="page-enter max-w-3xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/projects" class="btn-ghost btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">
            {{ isEditMode ? 'Edit Project' : 'New Project' }}
          </h1>
          <p class="text-midnight-500 mt-1">
            {{ isEditMode ? 'Update project details and pipeline stage.' : 'Create a new project opportunity.' }}
          </p>
        </div>
      </div>
      
      @if (projectState.error()) {
        <div class="alert alert-error mb-6">
          {{ projectState.error() }}
        </div>
      }
      
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
        <!-- Basic Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Project Information</h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Name -->
            <div class="form-group">
              <label for="name" class="label">Project Name <span class="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="formData.name"
                required
                maxlength="255"
                class="input"
                placeholder="e.g., Website Redesign, CRM Implementation"
              />
            </div>
            
            <!-- Description -->
            <div class="form-group">
              <label for="description" class="label">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="formData.description"
                rows="3"
                class="input"
                placeholder="Brief description of the project scope and objectives..."
              ></textarea>
            </div>
            
            <!-- Organization -->
            <div class="form-group">
              <label for="organization_id" class="label">Organization <span class="text-red-500">*</span></label>
              <select
                id="organization_id"
                name="organization_id"
                [(ngModel)]="formData.organization_id"
                (ngModelChange)="onOrganizationChange($event)"
                required
                class="select"
              >
                <option value="">Select an organization...</option>
                @for (org of organizationState.organizations(); track org.id) {
                  <option [value]="org.id">{{ org.name }}</option>
                }
              </select>
            </div>
            
            <!-- Primary Contact -->
            <div class="form-group">
              <label for="primary_contact_id" class="label">Primary Contact</label>
              <select
                id="primary_contact_id"
                name="primary_contact_id"
                [(ngModel)]="formData.primary_contact_id"
                class="select"
                [disabled]="!formData.organization_id"
              >
                <option value="">Select a contact...</option>
                @for (contact of filteredContacts(); track contact.id) {
                  <option [value]="contact.id">{{ contact.first_name }} {{ contact.last_name }}</option>
                }
              </select>
              @if (!formData.organization_id) {
                <p class="text-sm text-midnight-500 mt-1">Select an organization first</p>
              }
            </div>
          </div>
        </div>
        
        <!-- Pipeline Stage -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Pipeline Stage</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (stage of stages; track stage.value) {
                <button
                  type="button"
                  (click)="formData.stage = stage.value"
                  class="p-4 rounded-xl border-2 transition-all flex items-center gap-3"
                  [class.border-nexus-500]="formData.stage === stage.value"
                  [class.bg-nexus-50]="formData.stage === stage.value"
                  [class.border-midnight-200]="formData.stage !== stage.value"
                  [class.hover:border-midnight-300]="formData.stage !== stage.value"
                >
                  <div class="w-3 h-3 rounded-full" [class]="stage.color"></div>
                  <span class="font-medium text-sm">{{ stage.label }}</span>
                </button>
              }
            </div>
          </div>
        </div>
        
        <!-- Interest Level -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Interest Level</h3>
            <p class="text-sm text-midnight-500">Rate the client's interest from 1 (low) to 10 (high)</p>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <input
                  type="range"
                  id="interest_level"
                  name="interest_level"
                  [(ngModel)]="formData.interest_level"
                  min="1"
                  max="10"
                  step="1"
                  class="flex-1 h-2 bg-midnight-200 rounded-lg appearance-none cursor-pointer accent-nexus-600"
                />
                <div 
                  class="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl"
                  [class.bg-red-100]="formData.interest_level < 4"
                  [class.text-red-700]="formData.interest_level < 4"
                  [class.bg-yellow-100]="formData.interest_level >= 4 && formData.interest_level < 7"
                  [class.text-yellow-700]="formData.interest_level >= 4 && formData.interest_level < 7"
                  [class.bg-green-100]="formData.interest_level >= 7"
                  [class.text-green-700]="formData.interest_level >= 7"
                >
                  {{ formData.interest_level }}
                </div>
              </div>
              <div class="flex justify-between text-sm text-midnight-500">
                <span>Low Interest</span>
                <span>High Interest</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Budget & Timeline -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Budget & Timeline</h3>
          </div>
          <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Budget -->
              <div class="form-group">
                <label for="budget" class="label">Budget</label>
                <div class="flex gap-2">
                  <select
                    id="currency"
                    name="currency"
                    [(ngModel)]="formData.currency"
                    class="select w-24"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="MXN">MXN</option>
                  </select>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    [(ngModel)]="formData.budget"
                    min="0"
                    step="100"
                    class="input flex-1"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <!-- Status -->
              <div class="form-group">
                <label for="status" class="label">Status</label>
                <select
                  id="status"
                  name="status"
                  [(ngModel)]="formData.status"
                  class="select"
                >
                  @for (status of statuses; track status.value) {
                    <option [value]="status.value">{{ status.label }}</option>
                  }
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Start Date -->
              <div class="form-group">
                <label for="start_date" class="label">Start Date</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  [(ngModel)]="formData.start_date"
                  class="input"
                />
              </div>
              
              <!-- Expected Close Date -->
              <div class="form-group">
                <label for="expected_close_date" class="label">Expected Close Date</label>
                <input
                  type="date"
                  id="expected_close_date"
                  name="expected_close_date"
                  [(ngModel)]="formData.expected_close_date"
                  class="input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Summary Preview -->
        @if (formData.name && formData.organization_id) {
          <div class="card bg-midnight-50 border-midnight-200">
            <div class="card-body">
              <h4 class="font-medium text-midnight-700 mb-3">Preview</h4>
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-nexus-gradient flex items-center justify-center text-white font-display font-bold">
                  {{ formData.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="font-display font-bold text-midnight-900">{{ formData.name }}</div>
                  <div class="text-sm text-midnight-500 mt-1">
                    {{ getOrganizationName() }}
                    @if (formData.budget) {
                      · {{ formData.budget | currency:formData.currency:'symbol':'1.0-0' }}
                    }
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="badge" [class]="getStageColor()">{{ getStageName() }}</span>
                    <span 
                      class="badge"
                      [class.badge-success]="formData.status === 'active'"
                      [class.badge-warning]="formData.status === 'on_hold'"
                      [class.badge-neutral]="formData.status === 'completed'"
                      [class.badge-error]="formData.status === 'cancelled'"
                    >
                      {{ getStatusLabel() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        
        <!-- Actions -->
        <div class="flex items-center justify-end gap-4">
          <a routerLink="/projects" class="btn-ghost">Cancel</a>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="form.invalid || projectState.isLoading()"
          >
            @if (projectState.isLoading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              {{ isEditMode ? 'Update Project' : 'Create Project' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: ``
})
export class ProjectFormComponent implements OnInit {
  projectState = inject(ProjectState);
  organizationState = inject(OrganizationState);
  contactState = inject(ContactState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  isEditMode = false;
  projectId: string | null = null;
  stages = PROJECT_STAGES;
  statuses = PROJECT_STATUSES;
  
  filteredContacts = signal<any[]>([]);
  
  formData: {
    name: string;
    description: string | null;
    organization_id: string;
    primary_contact_id: string | null;
    stage: ProjectStage;
    status: ProjectStatus;
    interest_level: number;
    budget: number | null;
    currency: string;
    start_date: string | null;
    expected_close_date: string | null;
  } = {
    name: '',
    description: null,
    organization_id: '',
    primary_contact_id: null,
    stage: 'qualification',
    status: 'active',
    interest_level: 5,
    budget: null,
    currency: 'USD',
    start_date: null,
    expected_close_date: null
  };
  
  ngOnInit(): void {
    // Load organizations and contacts
    this.organizationState.loadOrganizations({ per_page: 100 });
    this.contactState.loadContacts({ per_page: 200 });
    
    // Check if editing
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEditMode = true;
      this.loadProject(this.projectId);
    }
    
    // Check for pre-selected organization
    const orgId = this.route.snapshot.queryParamMap.get('organization_id');
    if (orgId) {
      this.formData.organization_id = orgId;
      this.onOrganizationChange(orgId);
    }
  }
  
  private loadProject(id: string): void {
    this.projectState.loadProject(id);
    
    const checkLoaded = setInterval(() => {
      const project = this.projectState.selectedProject();
      if (project && project.id === id) {
        clearInterval(checkLoaded);
        this.populateForm(project);
      }
    }, 100);
  }
  
  private populateForm(project: Project): void {
    this.formData = {
      name: project.name,
      description: project.description,
      organization_id: project.organization_id,
      primary_contact_id: project.primary_contact_id,
      stage: project.stage,
      status: project.status,
      interest_level: project.interest_level,
      budget: project.budget,
      currency: project.currency,
      start_date: project.start_date,
      expected_close_date: project.expected_close_date
    };
    
    // Load contacts for the organization
    this.onOrganizationChange(project.organization_id);
  }
  
  onOrganizationChange(orgId: string): void {
    if (orgId) {
      // Filter contacts by organization
      const allContacts = this.contactState.contacts();
      this.filteredContacts.set(
        allContacts.filter(c => c.organization_id === orgId)
      );
    } else {
      this.filteredContacts.set([]);
      this.formData.primary_contact_id = null;
    }
  }
  
  getOrganizationName(): string {
    const org = this.organizationState.organizations().find(o => o.id === this.formData.organization_id);
    return org?.name || '';
  }
  
  getStageName(): string {
    return this.stages.find(s => s.value === this.formData.stage)?.label || '';
  }
  
  getStageColor(): string {
    const stage = this.stages.find(s => s.value === this.formData.stage);
    return stage ? `${stage.color} text-white` : 'bg-midnight-200';
  }
  
  getStatusLabel(): string {
    return this.statuses.find(s => s.value === this.formData.status)?.label || '';
  }
  
  async onSubmit(): Promise<void> {
    const data: CreateProjectDto = {
      name: this.formData.name,
      description: this.formData.description,
      organization_id: this.formData.organization_id,
      primary_contact_id: this.formData.primary_contact_id || null,
      stage: this.formData.stage,
      status: this.formData.status,
      interest_level: this.formData.interest_level,
      budget: this.formData.budget,
      currency: this.formData.currency,
      start_date: this.formData.start_date,
      expected_close_date: this.formData.expected_close_date
    };
    
    try {
      if (this.isEditMode && this.projectId) {
        await this.projectState.updateProject(this.projectId, data);
        this.router.navigate(['/projects', this.projectId]);
      } else {
        const project = await this.projectState.createProject(data);
        this.router.navigate(['/projects', project.id]);
      }
    } catch (error) {
      // Error is handled by state
    }
  }
}
