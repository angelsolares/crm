import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe, NgClass } from '@angular/common';
import { MeetingState } from '../../../core/state/meeting.state';
import { MeetingFilters, MEETING_TYPES, MEETING_STATUSES } from '../../../core/models/meeting.model';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, TitleCasePipe, NgClass],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Meetings</h1>
          <p class="text-midnight-500 mt-1">Schedule and manage your meetings.</p>
        </div>
        <a routerLink="/meetings/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Meeting
        </a>
      </div>
      
      <!-- Statistics Overview -->
      @if (meetingState.statistics(); as stats) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-display font-bold text-midnight-900">{{ stats.upcoming_count }}</div>
                <div class="text-sm text-midnight-500">Upcoming</div>
              </div>
            </div>
          </div>
          
          <div class="card p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-display font-bold text-midnight-900">{{ stats.completed }}</div>
                <div class="text-sm text-midnight-500">Completed</div>
              </div>
            </div>
          </div>
          
          <div class="card p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-display font-bold text-midnight-900">{{ stats.needs_followup }}</div>
                <div class="text-sm text-midnight-500">Need Follow-up</div>
              </div>
            </div>
          </div>
          
          <div class="card p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-display font-bold text-midnight-900">{{ stats.total }}</div>
                <div class="text-sm text-midnight-500">Total</div>
              </div>
            </div>
          </div>
        </div>
      }
      
      <!-- Today's Meetings -->
      @if (meetingState.todayMeetings().length > 0) {
        <div class="card border-l-4 border-l-nexus-500">
          <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
              <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Today's Meetings
            </h3>
          </div>
          <div class="divide-y divide-midnight-100">
            @for (meeting of meetingState.todayMeetings(); track meeting.id) {
              <a 
                [routerLink]="['/meetings', meeting.id]" 
                class="flex items-center gap-4 p-4 hover:bg-midnight-50/50 transition-colors"
              >
                <div class="w-12 h-12 rounded-lg flex items-center justify-center" [ngClass]="getTypeBackground(meeting.type)">
                  <span [innerHTML]="getTypeIcon(meeting.type)"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-midnight-900">{{ meeting.title }}</div>
                  <div class="text-sm text-midnight-500">
                    {{ meeting.scheduled_at | date:'shortTime' }} · {{ meeting.duration_minutes }} min
                    @if (meeting.location) {
                      · {{ meeting.location }}
                    }
                  </div>
                </div>
                <span class="badge" [ngClass]="getTypeBadgeClass(meeting.type)">
                  {{ meeting.type | titlecase }}
                </span>
              </a>
            }
          </div>
        </div>
      }
      
      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Status Filter -->
            <select 
              [(ngModel)]="filters().status"
              (ngModelChange)="onFilterChange('status', $event)"
              class="select w-36"
            >
              <option value="">All Status</option>
              @for (status of statuses; track status.value) {
                <option [value]="status.value">{{ status.label }}</option>
              }
            </select>
            
            <!-- Type Filter -->
            <select 
              [(ngModel)]="filters().type"
              (ngModelChange)="onFilterChange('type', $event)"
              class="select w-36"
            >
              <option value="">All Types</option>
              @for (type of types; track type.value) {
                <option [value]="type.value">{{ type.label }}</option>
              }
            </select>
            
            <!-- Date Range -->
            <div class="flex items-center gap-2">
              <input
                type="date"
                [(ngModel)]="filters().from_date"
                (ngModelChange)="onFilterChange('from_date', $event)"
                class="input w-40"
                placeholder="From"
              />
              <span class="text-midnight-400">to</span>
              <input
                type="date"
                [(ngModel)]="filters().to_date"
                (ngModelChange)="onFilterChange('to_date', $event)"
                class="input w-40"
                placeholder="To"
              />
            </div>
            
            <!-- Clear Filters -->
            @if (hasActiveFilters()) {
              <button (click)="clearFilters()" class="btn-ghost text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            }
          </div>
        </div>
      </div>
      
      <!-- Meetings Table -->
      <div class="card overflow-hidden">
        @if (meetingState.isLoading()) {
          <div class="p-6 space-y-4">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="skeleton h-16 rounded-xl"></div>
            }
          </div>
        } @else if (!meetingState.hasMeetings()) {
          <div class="empty-state py-16">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div class="empty-title">No meetings found</div>
            <div class="empty-description">Schedule your first meeting to get started.</div>
            <a routerLink="/meetings/new" class="btn-primary mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Schedule Meeting
            </a>
          </div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Meeting</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Related To</th>
                <th>Status</th>
                <th class="w-20"></th>
              </tr>
            </thead>
            <tbody>
              @for (meeting of meetingState.meetings(); track meeting.id) {
                <tr class="group">
                  <td>
                    <a [routerLink]="['/meetings', meeting.id]" class="font-medium text-midnight-900 group-hover:text-nexus-600">
                      {{ meeting.title }}
                    </a>
                    @if (meeting.location) {
                      <div class="text-sm text-midnight-500">{{ meeting.location }}</div>
                    }
                  </td>
                  <td>
                    <div class="text-midnight-900">{{ meeting.scheduled_at | date:'mediumDate' }}</div>
                    <div class="text-sm text-midnight-500">{{ meeting.scheduled_at | date:'shortTime' }}</div>
                  </td>
                  <td>
                    <span class="font-mono text-sm">{{ meeting.duration_minutes }} min</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getTypeBadgeClass(meeting.type)">
                      {{ meeting.type | titlecase }}
                    </span>
                  </td>
                  <td>
                    @if (meeting.project) {
                      <a [routerLink]="['/projects', meeting.project.id]" class="text-midnight-600 hover:text-nexus-600">
                        {{ meeting.project.name }}
                      </a>
                    } @else if (meeting.organization) {
                      <a [routerLink]="['/organizations', meeting.organization.id]" class="text-midnight-600 hover:text-nexus-600">
                        {{ meeting.organization.name }}
                      </a>
                    } @else {
                      <span class="text-midnight-400">—</span>
                    }
                  </td>
                  <td>
                    <span 
                      class="badge"
                      [class.badge-info]="meeting.status === 'scheduled'"
                      [class.badge-success]="meeting.status === 'completed'"
                      [class.badge-error]="meeting.status === 'cancelled'"
                      [class.badge-warning]="meeting.status === 'rescheduled'"
                    >
                      {{ meeting.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        [routerLink]="['/meetings', meeting.id]" 
                        class="p-1.5 rounded-lg hover:bg-midnight-100 text-midnight-500 hover:text-midnight-700"
                        title="View"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      @if (meeting.status === 'scheduled') {
                        <a 
                          [routerLink]="['/meetings', meeting.id, 'edit']" 
                          class="p-1.5 rounded-lg hover:bg-midnight-100 text-midnight-500 hover:text-midnight-700"
                          title="Edit"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class MeetingListComponent implements OnInit {
  meetingState = inject(MeetingState);
  
  types = MEETING_TYPES;
  statuses = MEETING_STATUSES;
  filters = signal<MeetingFilters>({});
  
  ngOnInit(): void {
    this.meetingState.loadMeetings();
    this.meetingState.loadStatistics();
  }
  
  getTypeBackground(type: string): string {
    switch (type) {
      case 'virtual': return 'bg-blue-100';
      case 'in_person': return 'bg-green-100';
      case 'phone': return 'bg-purple-100';
      default: return 'bg-midnight-100';
    }
  }
  
  getTypeIcon(type: string): string {
    switch (type) {
      case 'virtual':
        return '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
      case 'in_person':
        return '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>';
      case 'phone':
        return '<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>';
      default:
        return '<svg class="w-5 h-5 text-midnight-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
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
  
  onFilterChange(key: keyof MeetingFilters, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value || undefined, page: 1 }));
    this.loadWithFilters();
  }
  
  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.status || f.type || f.from_date || f.to_date);
  }
  
  clearFilters(): void {
    this.filters.set({});
    this.meetingState.loadMeetings();
  }
  
  loadWithFilters(): void {
    this.meetingState.loadMeetings(this.filters());
  }
}
