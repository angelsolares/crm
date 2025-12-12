import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DashboardStats, ActivityItem } from '../models/dashboard.model';
import { Organization } from '../models/organization.model';
import { Meeting } from '../models/meeting.model';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class DashboardState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _stats = signal<DashboardStats | null>(null);
  private _recentActivity = signal<ActivityItem[]>([]);
  private _upcomingMeetings = signal<Meeting[]>([]);
  private _recentOrganizations = signal<Organization[]>([]);
  private _highPriorityProjects = signal<Project[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Public read-only signals
  readonly stats = this._stats.asReadonly();
  readonly recentActivity = this._recentActivity.asReadonly();
  readonly upcomingMeetings = this._upcomingMeetings.asReadonly();
  readonly recentOrganizations = this._recentOrganizations.asReadonly();
  readonly highPriorityProjects = this._highPriorityProjects.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals
  readonly hasStats = computed(() => !!this._stats());
  readonly activeProjectsCount = computed(() => this._stats()?.projects.active ?? 0);
  readonly clientsCount = computed(() => this._stats()?.organizations.clients ?? 0);
  readonly prospectsCount = computed(() => this._stats()?.organizations.prospects ?? 0);
  readonly scheduledMeetingsCount = computed(() => this._stats()?.meetings.scheduled ?? 0);
  
  // Actions
  loadDashboard(): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    // Load all dashboard data in parallel
    this.loadStats();
    this.loadRecentActivity();
    this.loadUpcomingMeetings();
    this.loadRecentOrganizations();
    this.loadHighPriorityProjects();
  }
  
  private loadStats(): void {
    this.api.get<{ data: DashboardStats }>('dashboard').subscribe({
      next: (response) => {
        this._stats.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load dashboard stats');
        this._isLoading.set(false);
      }
    });
  }
  
  private loadRecentActivity(): void {
    this.api.get<{ data: ActivityItem[] }>('dashboard/activity', { limit: 10 }).subscribe({
      next: (response) => {
        this._recentActivity.set(response.data);
      }
    });
  }
  
  private loadUpcomingMeetings(): void {
    this.api.get<{ data: Meeting[] }>('dashboard/upcoming-meetings', { limit: 5 }).subscribe({
      next: (response) => {
        this._upcomingMeetings.set(response.data);
      }
    });
  }
  
  private loadRecentOrganizations(): void {
    this.api.get<{ data: Organization[] }>('dashboard/recent-organizations', { limit: 5 }).subscribe({
      next: (response) => {
        this._recentOrganizations.set(response.data);
      }
    });
  }
  
  private loadHighPriorityProjects(): void {
    this.api.get<{ data: Project[] }>('dashboard/high-priority-projects', { limit: 5 }).subscribe({
      next: (response) => {
        this._highPriorityProjects.set(response.data);
      }
    });
  }
  
  // Method to update stats in real-time (from WebSocket)
  updateOrganizationCount(delta: number): void {
    this._stats.update(stats => {
      if (!stats) return stats;
      return {
        ...stats,
        organizations: {
          ...stats.organizations,
          total: stats.organizations.total + delta
        }
      };
    });
  }
  
  updateActiveProjectsCount(delta: number): void {
    this._stats.update(stats => {
      if (!stats) return stats;
      return {
        ...stats,
        projects: {
          ...stats.projects,
          active: stats.projects.active + delta
        }
      };
    });
  }
}

