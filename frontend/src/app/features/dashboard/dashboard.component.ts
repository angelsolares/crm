import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { DashboardState } from '../../core/state/dashboard.state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Dashboard</h1>
          <p class="text-midnight-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="exportDashboard()" class="btn-outline" [disabled]="isExporting()">
            @if (isExporting()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            }
          </button>
          <a routerLink="/organizations/new" class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Organization
          </a>
        </div>
      </div>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Organizations -->
        <div class="stat-card animate-slide-up stagger-1">
          <div class="flex items-center justify-between">
            <div class="stat-label">Total Organizations</div>
            <div class="w-10 h-10 rounded-xl bg-nexus-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          @if (dashboardState.isLoading()) {
            <div class="stat-value skeleton h-8 w-20 mt-2"></div>
          } @else {
            <div class="stat-value">{{ dashboardState.stats()?.organizations?.total || 0 }}</div>
          }
          <div class="stat-change positive">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {{ dashboardState.stats()?.organizations?.new_this_month || 0 }} this month
          </div>
        </div>
        
        <!-- Clients -->
        <div class="stat-card animate-slide-up stagger-2">
          <div class="flex items-center justify-between">
            <div class="stat-label">Active Clients</div>
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          @if (dashboardState.isLoading()) {
            <div class="stat-value skeleton h-8 w-20 mt-2"></div>
          } @else {
            <div class="stat-value">{{ dashboardState.clientsCount() }}</div>
          }
          <div class="text-sm text-midnight-500 mt-2">
            {{ dashboardState.prospectsCount() }} prospects
          </div>
        </div>
        
        <!-- Active Projects -->
        <div class="stat-card animate-slide-up stagger-3">
          <div class="flex items-center justify-between">
            <div class="stat-label">Active Projects</div>
            <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          @if (dashboardState.isLoading()) {
            <div class="stat-value skeleton h-8 w-20 mt-2"></div>
          } @else {
            <div class="stat-value">{{ dashboardState.activeProjectsCount() }}</div>
          }
          <div class="text-sm text-midnight-500 mt-2">
            {{ dashboardState.stats()?.projects?.won_this_month || 0 }} won this month
          </div>
        </div>
        
        <!-- Meetings -->
        <div class="stat-card animate-slide-up stagger-4">
          <div class="flex items-center justify-between">
            <div class="stat-label">Scheduled Meetings</div>
            <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          @if (dashboardState.isLoading()) {
            <div class="stat-value skeleton h-8 w-20 mt-2"></div>
          } @else {
            <div class="stat-value">{{ dashboardState.scheduledMeetingsCount() }}</div>
          }
          <div class="text-sm text-midnight-500 mt-2">
            {{ dashboardState.stats()?.meetings?.upcoming_week || 0 }} this week
          </div>
        </div>
      </div>
      
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Organizations -->
        <div class="lg:col-span-2 card animate-slide-up stagger-5">
          <div class="card-header flex items-center justify-between">
            <h2 class="font-display font-semibold text-midnight-900">Recent Organizations</h2>
            <a routerLink="/organizations" class="text-sm text-nexus-600 hover:text-nexus-700 font-medium">
              View all →
            </a>
          </div>
          <div class="card-body p-0">
            @if (dashboardState.isLoading()) {
              <div class="p-6 space-y-4">
                @for (_ of [1,2,3]; track $index) {
                  <div class="flex items-center gap-4">
                    <div class="skeleton w-12 h-12 rounded-xl"></div>
                    <div class="flex-1">
                      <div class="skeleton h-4 w-32 mb-2"></div>
                      <div class="skeleton h-3 w-24"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (dashboardState.recentOrganizations().length === 0) {
              <div class="empty-state py-12">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div class="empty-title">No organizations yet</div>
                <div class="empty-description">Get started by adding your first organization.</div>
                <a routerLink="/organizations/new" class="btn-primary mt-4">
                  Add Organization
                </a>
              </div>
            } @else {
              <div class="divide-y divide-midnight-100">
                @for (org of dashboardState.recentOrganizations(); track org.id) {
                  <a 
                    [routerLink]="['/organizations', org.id]" 
                    class="flex items-center gap-4 p-4 hover:bg-midnight-50/50 transition-colors"
                  >
                    @if (org.logo_url) {
                      <img [src]="org.logo_url" [alt]="org.name" class="w-12 h-12 rounded-xl object-cover" />
                    } @else {
                      <div class="w-12 h-12 rounded-xl bg-nexus-100 flex items-center justify-center text-nexus-700 font-display font-bold text-lg">
                        {{ org.name.charAt(0) }}
                      </div>
                    }
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-midnight-900 truncate">{{ org.name }}</div>
                      <div class="text-sm text-midnight-500 flex items-center gap-2">
                        @if (org.industry) {
                          <span>{{ org.industry.name }}</span>
                          <span>•</span>
                        }
                        <span>{{ org.formatted_address || 'No address' }}</span>
                      </div>
                    </div>
                    <span 
                      class="badge"
                      [class.badge-success]="org.status === 'client'"
                      [class.badge-info]="org.status === 'prospect'"
                      [class.badge-neutral]="org.status === 'inactive'"
                    >
                      {{ org.status | titlecase }}
                    </span>
                  </a>
                }
              </div>
            }
          </div>
        </div>
        
        <!-- Upcoming Meetings -->
        <div class="card animate-slide-up stagger-5">
          <div class="card-header flex items-center justify-between">
            <h2 class="font-display font-semibold text-midnight-900">Upcoming Meetings</h2>
            <a routerLink="/meetings" class="text-sm text-nexus-600 hover:text-nexus-700 font-medium">
              View all →
            </a>
          </div>
          <div class="card-body p-0">
            @if (dashboardState.isLoading()) {
              <div class="p-4 space-y-4">
                @for (_ of [1,2,3]; track $index) {
                  <div class="skeleton h-16 rounded-xl"></div>
                }
              </div>
            } @else if (dashboardState.upcomingMeetings().length === 0) {
              <div class="empty-state py-8">
                <svg class="empty-icon w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div class="empty-title text-sm">No meetings scheduled</div>
              </div>
            } @else {
              <div class="divide-y divide-midnight-100">
                @for (meeting of dashboardState.upcomingMeetings(); track meeting.id) {
                  <a 
                    [routerLink]="['/meetings', meeting.id]" 
                    class="block p-4 hover:bg-midnight-50/50 transition-colors"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                           [class.bg-blue-100]="meeting.type === 'virtual'"
                           [class.bg-green-100]="meeting.type === 'in_person'"
                           [class.bg-amber-100]="meeting.type === 'phone'">
                        @if (meeting.type === 'virtual') {
                          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        } @else if (meeting.type === 'in_person') {
                          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        } @else {
                          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-midnight-900 truncate">{{ meeting.title }}</div>
                        <div class="text-sm text-midnight-500">
                          {{ meeting.scheduled_at | date:'EEE, MMM d • h:mm a' }}
                        </div>
                        @if (meeting.organization) {
                          <div class="text-xs text-midnight-400 mt-1">{{ meeting.organization.name }}</div>
                        }
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </div>
      
      <!-- High Priority Projects -->
      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h2 class="font-display font-semibold text-midnight-900">High Priority Projects</h2>
          <a routerLink="/projects" class="text-sm text-nexus-600 hover:text-nexus-700 font-medium">
            View all →
          </a>
        </div>
        <div class="overflow-x-auto">
          @if (dashboardState.isLoading()) {
            <div class="p-6">
              <div class="skeleton h-40 rounded-xl"></div>
            </div>
          } @else if (dashboardState.highPriorityProjects().length === 0) {
            <div class="empty-state py-8">
              <svg class="empty-icon w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div class="empty-title text-sm">No high priority projects</div>
              <div class="empty-description text-xs">Projects with interest level 7+ will appear here</div>
            </div>
          } @else {
            <table class="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Organization</th>
                  <th>Stage</th>
                  <th>Interest</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                @for (project of dashboardState.highPriorityProjects(); track project.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/projects', project.id]" class="font-medium text-midnight-900 hover:text-nexus-600">
                        {{ project.name }}
                      </a>
                    </td>
                    <td>
                      @if (project.organization) {
                        <a [routerLink]="['/organizations', project.organization.id]" class="text-midnight-600 hover:text-nexus-600">
                          {{ project.organization.name }}
                        </a>
                      } @else {
                        <span class="text-midnight-400">—</span>
                      }
                    </td>
                    <td>
                      <span class="badge badge-info">{{ project.stage_label }}</span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-2 bg-midnight-100 rounded-full overflow-hidden">
                          <div 
                            class="h-full rounded-full"
                            [class.bg-red-500]="project.interest_level < 4"
                            [class.bg-yellow-500]="project.interest_level >= 4 && project.interest_level < 7"
                            [class.bg-green-500]="project.interest_level >= 7"
                            [style.width.%]="project.interest_level * 10"
                          ></div>
                        </div>
                        <span class="text-sm text-midnight-600">{{ project.interest_level }}/10</span>
                      </div>
                    </td>
                    <td>
                      @if (project.formatted_budget) {
                        <span class="font-mono text-midnight-900">{{ project.formatted_budget }}</span>
                      } @else {
                        <span class="text-midnight-400">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class DashboardComponent implements OnInit {
  dashboardState = inject(DashboardState);
  isExporting = signal(false);
  
  ngOnInit(): void {
    this.dashboardState.loadDashboard();
  }
  
  exportDashboard(): void {
    this.isExporting.set(true);
    
    const stats = this.dashboardState.stats();
    const recentOrgs = this.dashboardState.recentOrganizations();
    const upcomingMeetings = this.dashboardState.upcomingMeetings();
    const highPriorityProjects = this.dashboardState.highPriorityProjects();
    
    // Build CSV content
    let csvContent = '';
    
    // Dashboard Summary
    csvContent += 'DASHBOARD SUMMARY REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Statistics Section
    csvContent += '=== STATISTICS ===\n';
    csvContent += `Total Organizations,${stats?.organizations?.total || 0}\n`;
    csvContent += `Active Clients,${stats?.organizations?.clients || 0}\n`;
    csvContent += `Prospects,${stats?.organizations?.prospects || 0}\n`;
    csvContent += `New This Month,${stats?.organizations?.new_this_month || 0}\n`;
    csvContent += `Total Contacts,${stats?.contacts?.total || 0}\n`;
    csvContent += `Active Projects,${stats?.projects?.active || 0}\n`;
    csvContent += `Won This Month,${stats?.projects?.won_this_month || 0}\n`;
    csvContent += `Scheduled Meetings,${stats?.meetings?.scheduled || 0}\n`;
    csvContent += `Meetings This Week,${stats?.meetings?.upcoming_week || 0}\n\n`;
    
    // Recent Organizations Section
    csvContent += '=== RECENT ORGANIZATIONS ===\n';
    csvContent += 'Name,Status,Email\n';
    recentOrgs.forEach(org => {
      csvContent += `"${org.name}","${org.status}","${org.email || ''}"\n`;
    });
    csvContent += '\n';
    
    // Upcoming Meetings Section
    csvContent += '=== UPCOMING MEETINGS ===\n';
    csvContent += 'Title,Date,Type,Organization\n';
    upcomingMeetings.forEach(meeting => {
      const date = new Date(meeting.scheduled_at).toLocaleString();
      csvContent += `"${meeting.title}","${date}","${meeting.type}","${meeting.organization?.name || ''}"\n`;
    });
    csvContent += '\n';
    
    // High Priority Projects Section
    csvContent += '=== HIGH PRIORITY PROJECTS ===\n';
    csvContent += 'Name,Organization,Stage,Interest Level,Budget\n';
    highPriorityProjects.forEach(project => {
      csvContent += `"${project.name}","${project.organization?.name || ''}","${project.stage_label}","${project.interest_level}/10","${project.formatted_budget || 'N/A'}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset loading state
    setTimeout(() => {
      this.isExporting.set(false);
    }, 500);
  }
}

