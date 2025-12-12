import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe, NgClass } from '@angular/common';
import { MeetingState } from '../../../core/state/meeting.state';
import { Meeting } from '../../../core/models/meeting.model';

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, TitleCasePipe, NgClass],
  template: `
    <div class="page-enter space-y-6">
      @if (meetingState.isLoading()) {
        <div class="space-y-4">
          <div class="skeleton h-8 w-64"></div>
          <div class="skeleton h-4 w-48"></div>
          <div class="card p-6">
            <div class="skeleton h-32"></div>
          </div>
        </div>
      } @else if (meetingState.selectedMeeting(); as meeting) {
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <a routerLink="/meetings" class="text-midnight-400 hover:text-midnight-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <span 
                class="badge"
                [class.badge-info]="meeting.status === 'scheduled'"
                [class.badge-success]="meeting.status === 'completed'"
                [class.badge-error]="meeting.status === 'cancelled'"
                [class.badge-warning]="meeting.status === 'rescheduled'"
              >
                {{ meeting.status | titlecase }}
              </span>
              <span class="badge" [ngClass]="getTypeBadgeClass(meeting.type)">
                {{ meeting.type | titlecase }}
              </span>
            </div>
            <h1 class="text-2xl font-display font-bold text-midnight-900">{{ meeting.title }}</h1>
            <p class="text-midnight-500 mt-1">
              {{ meeting.scheduled_at | date:'fullDate' }} at {{ meeting.scheduled_at | date:'shortTime' }}
              · {{ meeting.duration_minutes }} minutes
            </p>
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            @if (meeting.status === 'scheduled') {
              <a [routerLink]="['/meetings', meeting.id, 'edit']" class="btn-ghost">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </a>
              <button (click)="openCompleteModal()" class="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm" [disabled]="meetingState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Mark Complete
              </button>
              <button (click)="openRescheduleModal()" class="btn-outline" [disabled]="meetingState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reschedule
              </button>
              <button (click)="cancelMeeting()" class="btn bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 focus:ring-red-500" [disabled]="meetingState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            }
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            @if (meeting.description) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap">{{ meeting.description }}</p>
                </div>
              </div>
            }
            
            <!-- Outcome (if completed) -->
            @if (meeting.status === 'completed') {
              <div class="card border-l-4 border-l-green-500">
                <div class="card-header">
                  <h3 class="card-title flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Meeting Outcome
                  </h3>
                </div>
                <div class="card-body space-y-4">
                  @if (meeting.outcome) {
                    <div>
                      <div class="text-sm font-medium text-midnight-500 mb-1">Summary</div>
                      <p class="text-midnight-700 whitespace-pre-wrap">{{ meeting.outcome }}</p>
                    </div>
                  }
                  @if (meeting.action_items) {
                    <div>
                      <div class="text-sm font-medium text-midnight-500 mb-1">Action Items</div>
                      <p class="text-midnight-700 whitespace-pre-wrap">{{ meeting.action_items }}</p>
                    </div>
                  }
                </div>
              </div>
            }
            
            <!-- Attendees -->
            @if (meeting.attendees && meeting.attendees.length > 0) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Attendees ({{ meeting.attendees.length }})</h3>
                </div>
                <div class="divide-y divide-midnight-100">
                  @for (attendee of meeting.attendees; track attendee.id) {
                    <a 
                      [routerLink]="['/contacts', attendee.id]" 
                      class="flex items-center gap-3 p-4 hover:bg-midnight-50/50 transition-colors"
                    >
                      <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold">
                        {{ attendee.first_name.charAt(0) }}{{ attendee.last_name.charAt(0) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-midnight-900">{{ attendee.first_name }} {{ attendee.last_name }}</div>
                        @if (attendee.email) {
                          <div class="text-sm text-midnight-500">{{ attendee.email }}</div>
                        }
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Details -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Details</h3>
              </div>
              <div class="card-body space-y-4">
                <div class="flex justify-between">
                  <span class="text-midnight-500">Date</span>
                  <span class="text-midnight-900">{{ meeting.scheduled_at | date:'mediumDate' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-midnight-500">Time</span>
                  <span class="text-midnight-900">{{ meeting.scheduled_at | date:'shortTime' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-midnight-500">Duration</span>
                  <span class="text-midnight-900">{{ meeting.duration_minutes }} minutes</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-midnight-500">Type</span>
                  <span class="text-midnight-900 capitalize">{{ meeting.type | titlecase }}</span>
                </div>
                @if (meeting.location) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Location</span>
                    <span class="text-midnight-900">{{ meeting.location }}</span>
                  </div>
                }
                @if (meeting.creator) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Organizer</span>
                    <span class="text-midnight-900">{{ meeting.creator.name }}</span>
                  </div>
                }
              </div>
            </div>
            
            <!-- Related Project/Organization -->
            @if (meeting.project) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Project</h3>
                </div>
                <div class="card-body">
                  <a 
                    [routerLink]="['/projects', meeting.project.id]" 
                    class="block p-3 rounded-lg bg-midnight-50 hover:bg-midnight-100 transition-colors"
                  >
                    <div class="font-medium text-midnight-900">{{ meeting.project.name }}</div>
                    @if (meeting.project.organization) {
                      <div class="text-sm text-midnight-500 mt-1">{{ meeting.project.organization.name }}</div>
                    }
                  </a>
                </div>
              </div>
            } @else if (meeting.organization) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Organization</h3>
                </div>
                <div class="card-body">
                  <a 
                    [routerLink]="['/organizations', meeting.organization.id]" 
                    class="block p-3 rounded-lg bg-midnight-50 hover:bg-midnight-100 transition-colors"
                  >
                    <div class="font-medium text-midnight-900">{{ meeting.organization.name }}</div>
                  </a>
                </div>
              </div>
            }
            
            <!-- Follow-up -->
            @if (meeting.follow_up_date) {
              <div class="card border-l-4 border-l-amber-500">
                <div class="card-header">
                  <h3 class="card-title flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Follow-up Required
                  </h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700">
                    <span class="font-medium">{{ meeting.follow_up_date | date:'mediumDate' }}</span>
                  </p>
                </div>
              </div>
            }
            
            <!-- Danger Zone -->
            @if (meeting.status === 'scheduled') {
              <div class="card border-red-200">
                <div class="card-header">
                  <h3 class="card-title text-red-600">Danger Zone</h3>
                </div>
                <div class="card-body">
                  <button 
                    (click)="deleteMeeting()" 
                    class="btn-outline text-red-600 border-red-200 hover:bg-red-50 w-full"
                    [disabled]="meetingState.isSaving()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Meeting
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
        
        <!-- Complete Modal -->
        @if (showCompleteModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-midnight-100">
                <h3 class="text-lg font-display font-bold text-midnight-900">Complete Meeting</h3>
                <p class="text-midnight-500 mt-1">Record the outcome and action items from this meeting.</p>
              </div>
              <div class="p-6 space-y-4">
                <div class="form-group">
                  <label class="label">Outcome / Summary</label>
                  <textarea
                    [(ngModel)]="completeData.outcome"
                    rows="3"
                    class="input"
                    placeholder="What was discussed and decided..."
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="label">Action Items</label>
                  <textarea
                    [(ngModel)]="completeData.actionItems"
                    rows="3"
                    class="input"
                    placeholder="List any follow-up tasks..."
                  ></textarea>
                </div>
              </div>
              <div class="p-6 border-t border-midnight-100 flex justify-end gap-3">
                <button (click)="closeCompleteModal()" class="btn-ghost">Cancel</button>
                <button (click)="completeMeeting()" class="btn-primary bg-green-600 hover:bg-green-700" [disabled]="meetingState.isSaving()">
                  @if (meetingState.isSaving()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Complete Meeting
                </button>
              </div>
            </div>
          </div>
        }
        
        <!-- Reschedule Modal -->
        @if (showRescheduleModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div class="p-6 border-b border-midnight-100">
                <h3 class="text-lg font-display font-bold text-midnight-900">Reschedule Meeting</h3>
                <p class="text-midnight-500 mt-1">Select a new date and time.</p>
              </div>
              <div class="p-6 space-y-4">
                <div class="form-group">
                  <label class="label">New Date & Time</label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="rescheduleData.newDate"
                    class="input"
                  />
                </div>
                <div class="form-group">
                  <label class="label">Duration (minutes)</label>
                  <input
                    type="number"
                    [(ngModel)]="rescheduleData.duration"
                    min="15"
                    step="15"
                    class="input"
                  />
                </div>
              </div>
              <div class="p-6 border-t border-midnight-100 flex justify-end gap-3">
                <button (click)="closeRescheduleModal()" class="btn-ghost">Cancel</button>
                <button 
                  (click)="rescheduleMeeting()" 
                  class="btn-primary" 
                  [disabled]="meetingState.isSaving() || !rescheduleData.newDate"
                >
                  @if (meetingState.isSaving()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="empty-state py-16">
          <div class="empty-title">Meeting not found</div>
          <a routerLink="/meetings" class="btn-primary mt-4">Back to Meetings</a>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class MeetingDetailComponent implements OnInit {
  meetingState = inject(MeetingState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  showCompleteModal = signal(false);
  showRescheduleModal = signal(false);
  
  completeData = {
    outcome: '',
    actionItems: ''
  };
  
  rescheduleData = {
    newDate: '',
    duration: 60
  };
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.meetingState.loadMeeting(id);
    }
  }
  
  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'virtual': return 'bg-blue-100 text-blue-700';
      case 'in_person': return 'bg-green-100 text-green-700';
      case 'phone': return 'bg-purple-100 text-purple-700';
      default: return 'bg-midnight-100 text-midnight-700';
    }
  }
  
  openCompleteModal(): void {
    this.completeData = { outcome: '', actionItems: '' };
    this.showCompleteModal.set(true);
  }
  
  closeCompleteModal(): void {
    this.showCompleteModal.set(false);
  }
  
  async completeMeeting(): Promise<void> {
    const meeting = this.meetingState.selectedMeeting();
    if (!meeting) return;
    
    await this.meetingState.completeMeeting(
      meeting.id, 
      this.completeData.outcome || undefined, 
      this.completeData.actionItems || undefined
    );
    this.closeCompleteModal();
  }
  
  openRescheduleModal(): void {
    const meeting = this.meetingState.selectedMeeting();
    if (meeting) {
      // Convert to datetime-local format
      const date = new Date(meeting.scheduled_at);
      this.rescheduleData.newDate = date.toISOString().slice(0, 16);
      this.rescheduleData.duration = meeting.duration_minutes;
    }
    this.showRescheduleModal.set(true);
  }
  
  closeRescheduleModal(): void {
    this.showRescheduleModal.set(false);
  }
  
  async rescheduleMeeting(): Promise<void> {
    const meeting = this.meetingState.selectedMeeting();
    if (!meeting || !this.rescheduleData.newDate) return;
    
    await this.meetingState.rescheduleMeeting(
      meeting.id,
      this.rescheduleData.newDate,
      this.rescheduleData.duration
    );
    this.closeRescheduleModal();
  }
  
  async cancelMeeting(): Promise<void> {
    const meeting = this.meetingState.selectedMeeting();
    if (!meeting) return;
    
    if (confirm('Are you sure you want to cancel this meeting?')) {
      await this.meetingState.cancelMeeting(meeting.id);
    }
  }
  
  async deleteMeeting(): Promise<void> {
    const meeting = this.meetingState.selectedMeeting();
    if (!meeting) return;
    
    if (confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      await this.meetingState.deleteMeeting(meeting.id);
      this.router.navigate(['/meetings']);
    }
  }
}
