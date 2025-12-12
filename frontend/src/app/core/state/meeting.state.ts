import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { Meeting, MeetingFilters, CreateMeetingDto } from '../models/meeting.model';

export interface MeetingStatistics {
  total: number;
  scheduled: number;
  completed: number;
  upcoming_count: number;
  needs_followup: number;
  by_type: Record<string, number>;
}

export interface ConflictCheckResult {
  has_conflicts: boolean;
  conflicts: Meeting[];
}

@Injectable({ providedIn: 'root' })
export class MeetingState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _meetings = signal<Meeting[]>([]);
  private _selectedMeeting = signal<Meeting | null>(null);
  private _upcomingMeetings = signal<Meeting[]>([]);
  private _needsFollowUp = signal<Meeting[]>([]);
  private _statistics = signal<MeetingStatistics | null>(null);
  private _isLoading = signal<boolean>(false);
  private _isSaving = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  
  // Public read-only signals
  readonly meetings = this._meetings.asReadonly();
  readonly selectedMeeting = this._selectedMeeting.asReadonly();
  readonly upcomingMeetings = this._upcomingMeetings.asReadonly();
  readonly needsFollowUp = this._needsFollowUp.asReadonly();
  readonly statistics = this._statistics.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // Computed signals
  readonly hasMeetings = computed(() => this._meetings().length > 0);
  readonly totalCount = computed(() => this._pagination().total);
  readonly scheduledMeetings = computed(() => 
    this._meetings().filter(m => m.status === 'scheduled')
  );
  readonly completedMeetings = computed(() => 
    this._meetings().filter(m => m.status === 'completed')
  );
  readonly upcomingCount = computed(() => this._statistics()?.upcoming_count ?? 0);
  readonly needsFollowUpCount = computed(() => this._statistics()?.needs_followup ?? 0);
  
  // Today's meetings
  readonly todayMeetings = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this._meetings().filter(m => 
      m.scheduled_at.startsWith(today) && m.status === 'scheduled'
    );
  });
  
  // Actions
  loadMeetings(filters: MeetingFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Meeting>>('meetings', filters).subscribe({
      next: (response) => {
        this._meetings.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load meetings');
        this._isLoading.set(false);
      }
    });
  }
  
  loadMeeting(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Meeting>>(`meetings/${id}`).subscribe({
      next: (response) => {
        this._selectedMeeting.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load meeting');
        this._isLoading.set(false);
      }
    });
  }
  
  loadUpcoming(limit: number = 10): void {
    this.api.get<{ data: Meeting[] }>('meetings/upcoming', { limit }).subscribe({
      next: (response) => {
        this._upcomingMeetings.set(response.data);
      }
    });
  }
  
  loadNeedsFollowUp(): void {
    this.api.get<{ data: Meeting[] }>('meetings/needs-follow-up').subscribe({
      next: (response) => {
        this._needsFollowUp.set(response.data);
      }
    });
  }
  
  loadStatistics(): void {
    this.api.get<{ data: MeetingStatistics }>('meetings/statistics').subscribe({
      next: (response) => {
        this._statistics.set(response.data);
      }
    });
  }
  
  createMeeting(data: CreateMeetingDto): Promise<Meeting> {
    this._isSaving.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Meeting>>('meetings', data).subscribe({
        next: (response) => {
          this._meetings.update(meetings => [response.data, ...meetings]);
          // Update upcoming if it's a scheduled meeting
          if (response.data.status === 'scheduled') {
            this._upcomingMeetings.update(meetings => {
              const updated = [response.data, ...meetings];
              return updated.sort((a, b) => 
                new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
              );
            });
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create meeting');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateMeeting(id: string, data: Partial<CreateMeetingDto>): Promise<Meeting> {
    this._isSaving.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Meeting>>(`meetings/${id}`, data).subscribe({
        next: (response) => {
          this._meetings.update(meetings => 
            meetings.map(m => m.id === id ? response.data : m)
          );
          if (this._selectedMeeting()?.id === id) {
            this._selectedMeeting.set(response.data);
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update meeting');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  deleteMeeting(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`meetings/${id}`).subscribe({
        next: () => {
          this._meetings.update(meetings => meetings.filter(m => m.id !== id));
          this._upcomingMeetings.update(meetings => meetings.filter(m => m.id !== id));
          if (this._selectedMeeting()?.id === id) {
            this._selectedMeeting.set(null);
          }
          this._isLoading.set(false);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete meeting');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  completeMeeting(id: string, outcome?: string, actionItems?: string): Promise<Meeting> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Meeting>>(`meetings/${id}/complete`, { 
        outcome, 
        action_items: actionItems 
      }).subscribe({
        next: (response) => {
          this.updateMeetingInLists(id, response.data);
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to complete meeting');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  cancelMeeting(id: string): Promise<Meeting> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Meeting>>(`meetings/${id}/cancel`, {}).subscribe({
        next: (response) => {
          this.updateMeetingInLists(id, response.data);
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to cancel meeting');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  rescheduleMeeting(id: string, newDate: string, newDuration?: number): Promise<Meeting> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Meeting>>(`meetings/${id}/reschedule`, { 
        scheduled_at: newDate,
        duration_minutes: newDuration
      }).subscribe({
        next: (response) => {
          this.updateMeetingInLists(id, response.data);
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to reschedule meeting');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  checkConflicts(scheduledAt: string, durationMinutes: number, excludeId?: string): Promise<ConflictCheckResult> {
    return new Promise((resolve, reject) => {
      this.api.post<{ data: ConflictCheckResult }>('meetings/check-conflicts', { 
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        exclude_id: excludeId
      }).subscribe({
        next: (response) => resolve(response.data),
        error: reject
      });
    });
  }
  
  // Helper to update meeting in all lists
  private updateMeetingInLists(id: string, updatedMeeting: Meeting): void {
    this._meetings.update(meetings => 
      meetings.map(m => m.id === id ? updatedMeeting : m)
    );
    
    // Update or remove from upcoming
    if (updatedMeeting.status === 'scheduled') {
      this._upcomingMeetings.update(meetings => {
        const updated = meetings.map(m => m.id === id ? updatedMeeting : m);
        return updated.sort((a, b) => 
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
      });
    } else {
      this._upcomingMeetings.update(meetings => meetings.filter(m => m.id !== id));
    }
    
    // Update selected meeting if it's the one we updated
    if (this._selectedMeeting()?.id === id) {
      this._selectedMeeting.set(updatedMeeting);
    }
  }
  
  clearSelected(): void {
    this._selectedMeeting.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
  
  // Real-time update methods for WebSocket integration
  addMeetingFromRealtime(meeting: Meeting): void {
    this._meetings.update(meetings => [meeting, ...meetings]);
    if (meeting.status === 'scheduled') {
      this._upcomingMeetings.update(meetings => {
        const updated = [meeting, ...meetings];
        return updated.sort((a, b) => 
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
      });
    }
  }
  
  updateMeetingFromRealtime(meeting: Meeting): void {
    this.updateMeetingInLists(meeting.id, meeting);
  }
  
  removeMeetingFromRealtime(meetingId: string): void {
    this._meetings.update(meetings => meetings.filter(m => m.id !== meetingId));
    this._upcomingMeetings.update(meetings => meetings.filter(m => m.id !== meetingId));
  }
}

