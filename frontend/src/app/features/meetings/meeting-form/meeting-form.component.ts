import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeetingState } from '../../../core/state/meeting.state';
import { OrganizationState } from '../../../core/state/organization.state';
import { ProjectState } from '../../../core/state/project.state';
import { ContactState } from '../../../core/state/contact.state';
import { CreateMeetingDto, Meeting, MEETING_TYPES } from '../../../core/models/meeting.model';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-enter max-w-3xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/meetings" class="btn-ghost btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">
            {{ isEditMode ? 'Edit Meeting' : 'Schedule Meeting' }}
          </h1>
          <p class="text-midnight-500 mt-1">
            {{ isEditMode ? 'Update meeting details.' : 'Create a new meeting with your contacts.' }}
          </p>
        </div>
      </div>
      
      @if (meetingState.error()) {
        <div class="alert alert-error mb-6">
          {{ meetingState.error() }}
        </div>
      }
      
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
        <!-- Basic Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Meeting Details</h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Title -->
            <div class="form-group">
              <label for="title" class="label">Title <span class="text-red-500">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                [(ngModel)]="formData.title"
                required
                maxlength="255"
                class="input"
                placeholder="Meeting title"
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
                placeholder="Meeting agenda or notes..."
              ></textarea>
            </div>
            
            <!-- Type -->
            <div class="form-group">
              <label class="label">Meeting Type <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-3 gap-3">
                @for (type of meetingTypes; track type.value) {
                  <button
                    type="button"
                    (click)="formData.type = type.value"
                    class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                    [class.border-nexus-500]="formData.type === type.value"
                    [class.bg-nexus-50]="formData.type === type.value"
                    [class.border-midnight-200]="formData.type !== type.value"
                    [class.hover:border-midnight-300]="formData.type !== type.value"
                  >
                    <span [innerHTML]="getTypeIcon(type.value)" class="w-6 h-6"></span>
                    <span class="text-sm font-medium">{{ type.label }}</span>
                  </button>
                }
              </div>
            </div>
            
            <!-- Location -->
            <div class="form-group">
              <label for="location" class="label">
                {{ formData.type === 'virtual' ? 'Meeting Link' : formData.type === 'phone' ? 'Phone Number' : 'Location' }}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                [(ngModel)]="formData.location"
                class="input"
                [placeholder]="getLocationPlaceholder()"
              />
            </div>
          </div>
        </div>
        
        <!-- Schedule -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Schedule</h3>
          </div>
          <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Date & Time -->
              <div class="form-group">
                <label for="scheduled_at" class="label">Date & Time <span class="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  name="scheduled_at"
                  [(ngModel)]="formData.scheduled_at"
                  required
                  class="input"
                />
              </div>
              
              <!-- Duration -->
              <div class="form-group">
                <label for="duration" class="label">Duration</label>
                <select
                  id="duration"
                  name="duration"
                  [(ngModel)]="formData.duration_minutes"
                  class="select"
                >
                  <option [value]="15">15 minutes</option>
                  <option [value]="30">30 minutes</option>
                  <option [value]="45">45 minutes</option>
                  <option [value]="60">1 hour</option>
                  <option [value]="90">1.5 hours</option>
                  <option [value]="120">2 hours</option>
                </select>
              </div>
            </div>
            
            <!-- Follow-up Date -->
            <div class="form-group">
              <label for="follow_up_date" class="label">Follow-up Date (optional)</label>
              <input
                type="date"
                id="follow_up_date"
                name="follow_up_date"
                [(ngModel)]="formData.follow_up_date"
                class="input"
              />
              <p class="text-sm text-midnight-500 mt-1">Set a reminder for follow-up after this meeting.</p>
            </div>
          </div>
        </div>
        
        <!-- Related To -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Related To</h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Relation Type -->
            <div class="form-group">
              <label class="label">Link meeting to:</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relation_type"
                    value="project"
                    [(ngModel)]="relationType"
                    (change)="onRelationTypeChange()"
                    class="text-nexus-600"
                  />
                  <span>Project</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relation_type"
                    value="organization"
                    [(ngModel)]="relationType"
                    (change)="onRelationTypeChange()"
                    class="text-nexus-600"
                  />
                  <span>Organization</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relation_type"
                    value="none"
                    [(ngModel)]="relationType"
                    (change)="onRelationTypeChange()"
                    class="text-nexus-600"
                  />
                  <span>None</span>
                </label>
              </div>
            </div>
            
            @if (relationType === 'project') {
              <div class="form-group">
                <label for="project_id" class="label">Project</label>
                <select
                  id="project_id"
                  name="project_id"
                  [(ngModel)]="formData.project_id"
                  class="select"
                >
                  <option value="">Select a project...</option>
                  @for (project of projectState.projects(); track project.id) {
                    <option [value]="project.id">{{ project.name }} - {{ project.organization?.name }}</option>
                  }
                </select>
              </div>
            }
            
            @if (relationType === 'organization') {
              <div class="form-group">
                <label for="organization_id" class="label">Organization</label>
                <select
                  id="organization_id"
                  name="organization_id"
                  [(ngModel)]="formData.organization_id"
                  class="select"
                >
                  <option value="">Select an organization...</option>
                  @for (org of organizationState.organizations(); track org.id) {
                    <option [value]="org.id">{{ org.name }}</option>
                  }
                </select>
              </div>
            }
          </div>
        </div>
        
        <!-- Attendees -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Attendees</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="label">Select Contacts</label>
              <div class="max-h-60 overflow-y-auto border border-midnight-200 rounded-xl divide-y divide-midnight-100">
                @for (contact of contactState.contacts(); track contact.id) {
                  <label class="flex items-center gap-3 p-3 hover:bg-midnight-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      [checked]="selectedAttendees().includes(contact.id)"
                      (change)="toggleAttendee(contact.id)"
                      class="rounded border-midnight-300 text-nexus-600 focus:ring-nexus-500"
                    />
                    <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold text-sm">
                      {{ contact.first_name.charAt(0) }}{{ contact.last_name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-midnight-900">{{ contact.first_name }} {{ contact.last_name }}</div>
                      @if (contact.organization) {
                        <div class="text-sm text-midnight-500">{{ contact.organization.name }}</div>
                      }
                    </div>
                  </label>
                } @empty {
                  <div class="p-4 text-center text-midnight-500">
                    No contacts available. <a routerLink="/contacts/new" class="text-nexus-600 hover:underline">Create one</a>
                  </div>
                }
              </div>
              @if (selectedAttendees().length > 0) {
                <p class="text-sm text-midnight-500 mt-2">{{ selectedAttendees().length }} attendee(s) selected</p>
              }
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-end gap-4">
          <a routerLink="/meetings" class="btn-ghost">Cancel</a>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="form.invalid || meetingState.isSaving()"
          >
            @if (meetingState.isSaving()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              {{ isEditMode ? 'Update Meeting' : 'Schedule Meeting' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: ``
})
export class MeetingFormComponent implements OnInit {
  meetingState = inject(MeetingState);
  organizationState = inject(OrganizationState);
  projectState = inject(ProjectState);
  contactState = inject(ContactState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  isEditMode = false;
  meetingId: string | null = null;
  meetingTypes = MEETING_TYPES;
  relationType: 'project' | 'organization' | 'none' = 'none';
  selectedAttendees = signal<string[]>([]);
  
  formData: {
    title: string;
    description: string | null;
    type: 'virtual' | 'in_person' | 'phone';
    location: string | null;
    scheduled_at: string;
    duration_minutes: number;
    follow_up_date: string | null;
    project_id: string | null;
    organization_id: string | null;
  } = {
    title: '',
    description: null,
    type: 'virtual',
    location: null,
    scheduled_at: this.getDefaultDateTime(),
    duration_minutes: 60,
    follow_up_date: null,
    project_id: null,
    organization_id: null
  };
  
  ngOnInit(): void {
    // Load related data
    this.organizationState.loadOrganizations({ per_page: 100 });
    this.projectState.loadProjects({ status: 'active', per_page: 100 });
    this.contactState.loadContacts({ per_page: 100 });
    
    // Check if editing
    this.meetingId = this.route.snapshot.paramMap.get('id');
    if (this.meetingId) {
      this.isEditMode = true;
      this.loadMeeting(this.meetingId);
    }
    
    // Check for pre-selected relations
    const projectId = this.route.snapshot.queryParamMap.get('project_id');
    const orgId = this.route.snapshot.queryParamMap.get('organization_id');
    
    if (projectId) {
      this.relationType = 'project';
      this.formData.project_id = projectId;
    } else if (orgId) {
      this.relationType = 'organization';
      this.formData.organization_id = orgId;
    }
  }
  
  private loadMeeting(id: string): void {
    this.meetingState.loadMeeting(id);
    
    const checkLoaded = setInterval(() => {
      const meeting = this.meetingState.selectedMeeting();
      if (meeting && meeting.id === id) {
        clearInterval(checkLoaded);
        this.populateForm(meeting);
      }
    }, 100);
  }
  
  private populateForm(meeting: Meeting): void {
    const scheduledAt = new Date(meeting.scheduled_at);
    
    this.formData = {
      title: meeting.title,
      description: meeting.description,
      type: meeting.type,
      location: meeting.location,
      scheduled_at: scheduledAt.toISOString().slice(0, 16),
      duration_minutes: meeting.duration_minutes,
      follow_up_date: meeting.follow_up_date,
      project_id: meeting.project_id,
      organization_id: meeting.organization_id
    };
    
    // Set relation type
    if (meeting.project_id) {
      this.relationType = 'project';
    } else if (meeting.organization_id) {
      this.relationType = 'organization';
    } else {
      this.relationType = 'none';
    }
    
    // Set attendees
    if (meeting.attendees) {
      this.selectedAttendees.set(meeting.attendees.map(a => a.id));
    }
  }
  
  private getDefaultDateTime(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  }
  
  getTypeIcon(type: string): string {
    switch (type) {
      case 'virtual':
        return '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
      case 'in_person':
        return '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>';
      case 'phone':
        return '<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>';
      default:
        return '';
    }
  }
  
  getLocationPlaceholder(): string {
    switch (this.formData.type) {
      case 'virtual': return 'https://zoom.us/j/... or Google Meet link';
      case 'phone': return '+1 (555) 123-4567';
      case 'in_person': return 'Office address or room name';
      default: return 'Location';
    }
  }
  
  onRelationTypeChange(): void {
    this.formData.project_id = null;
    this.formData.organization_id = null;
  }
  
  toggleAttendee(contactId: string): void {
    this.selectedAttendees.update(attendees => {
      if (attendees.includes(contactId)) {
        return attendees.filter(id => id !== contactId);
      }
      return [...attendees, contactId];
    });
  }
  
  async onSubmit(): Promise<void> {
    const data: CreateMeetingDto = {
      title: this.formData.title,
      description: this.formData.description,
      type: this.formData.type,
      location: this.formData.location,
      scheduled_at: this.formData.scheduled_at,
      duration_minutes: this.formData.duration_minutes,
      follow_up_date: this.formData.follow_up_date,
      project_id: this.relationType === 'project' ? this.formData.project_id : null,
      organization_id: this.relationType === 'organization' ? this.formData.organization_id : null,
      attendee_ids: this.selectedAttendees()
    };
    
    try {
      if (this.isEditMode && this.meetingId) {
        await this.meetingState.updateMeeting(this.meetingId, data);
        this.router.navigate(['/meetings', this.meetingId]);
      } else {
        const meeting = await this.meetingState.createMeeting(data);
        this.router.navigate(['/meetings', meeting.id]);
      }
    } catch (error) {
      // Error is handled by state
    }
  }
}
