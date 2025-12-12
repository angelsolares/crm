import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ProjectState } from '../../../core/state/project.state';
import { ProposalState } from '../../../core/state/proposal.state';
import { MeetingState } from '../../../core/state/meeting.state';
import { PROJECT_STAGES, PROJECT_STATUSES } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <div class="page-enter space-y-6">
      @if (projectState.isLoading()) {
        <div class="space-y-4">
          <div class="skeleton h-8 w-64"></div>
          <div class="skeleton h-4 w-48"></div>
          <div class="card p-6">
            <div class="skeleton h-32"></div>
          </div>
        </div>
      } @else if (projectState.selectedProject(); as project) {
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <a routerLink="/projects" class="text-midnight-400 hover:text-midnight-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <span class="badge" [class]="getStageBadgeClass(project.stage)">
                {{ project.stage_label }}
              </span>
              <span 
                class="badge"
                [class.badge-success]="project.status === 'active'"
                [class.badge-warning]="project.status === 'on_hold'"
                [class.badge-neutral]="project.status === 'completed'"
                [class.badge-error]="project.status === 'cancelled'"
              >
                {{ project.status | titlecase }}
              </span>
            </div>
            <h1 class="text-2xl font-display font-bold text-midnight-900">{{ project.name }}</h1>
            @if (project.organization) {
              <p class="text-midnight-500 mt-1">
                <a [routerLink]="['/organizations', project.organization.id]" class="text-nexus-600 hover:underline">
                  {{ project.organization.name }}
                </a>
              </p>
            }
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            <a [routerLink]="['/projects', project.id, 'edit']" class="btn-ghost">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </a>
            <a [routerLink]="['/proposals/new']" [queryParams]="{project_id: project.id}" class="btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New Proposal
            </a>
            <a [routerLink]="['/meetings/new']" [queryParams]="{project_id: project.id}" class="btn-outline">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Meeting
            </a>
          </div>
        </div>
        
        <!-- Pipeline Progress -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Pipeline Progress</h3>
          </div>
          <div class="card-body">
            <div class="flex items-center gap-2">
              @for (stage of stages; track stage.value; let i = $index) {
                <button
                  (click)="updateStage(stage.value)"
                  class="flex-1 group relative"
                  [disabled]="projectState.isLoading()"
                >
                  <div 
                    class="h-2 rounded-full transition-all"
                    [class]="getStageProgressClass(stage.value, project.stage)"
                  ></div>
                  <div 
                    class="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow transition-all"
                    [class]="getStageProgressClass(stage.value, project.stage)"
                  ></div>
                  <div class="text-xs text-center mt-3 text-midnight-500 group-hover:text-midnight-700">
                    {{ stage.label }}
                  </div>
                </button>
                @if (i < stages.length - 1) {
                  <div class="w-4"></div>
                }
              }
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            @if (project.description) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap">{{ project.description }}</p>
                </div>
              </div>
            }
            
            <!-- Interest Level -->
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <h3 class="card-title">Interest Level</h3>
                <span class="text-sm text-midnight-500">Click to adjust</span>
              </div>
              <div class="card-body">
                <div class="flex items-center gap-4">
                  <div class="flex-1 flex gap-1">
                    @for (level of [1,2,3,4,5,6,7,8,9,10]; track level) {
                      <button
                        (click)="updateInterestLevel(level)"
                        class="flex-1 h-8 rounded transition-all hover:scale-110"
                        [class.bg-red-400]="level <= project.interest_level && project.interest_level < 4"
                        [class.bg-yellow-400]="level <= project.interest_level && project.interest_level >= 4 && project.interest_level < 7"
                        [class.bg-green-400]="level <= project.interest_level && project.interest_level >= 7"
                        [class.bg-midnight-200]="level > project.interest_level"
                        [class.hover:bg-midnight-300]="level > project.interest_level"
                        [disabled]="projectState.isLoading()"
                      ></button>
                    }
                  </div>
                  <div 
                    class="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-2xl"
                    [class.bg-red-100]="project.interest_level < 4"
                    [class.text-red-700]="project.interest_level < 4"
                    [class.bg-yellow-100]="project.interest_level >= 4 && project.interest_level < 7"
                    [class.text-yellow-700]="project.interest_level >= 4 && project.interest_level < 7"
                    [class.bg-green-100]="project.interest_level >= 7"
                    [class.text-green-700]="project.interest_level >= 7"
                  >
                    {{ project.interest_level }}
                  </div>
                </div>
                <div class="flex justify-between text-xs text-midnight-500 mt-2">
                  <span>Low Interest</span>
                  <span>{{ project.interest_label }}</span>
                  <span>High Interest</span>
                </div>
              </div>
            </div>
            
            <!-- Proposals -->
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <h3 class="card-title">Proposals</h3>
                <a 
                  [routerLink]="['/proposals/new']" 
                  [queryParams]="{project_id: project.id}"
                  class="btn-ghost btn-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </a>
              </div>
              @if (project.proposals && project.proposals.length > 0) {
                <div class="divide-y divide-midnight-100">
                  @for (proposal of project.proposals; track proposal.id) {
                    <a 
                      [routerLink]="['/proposals', proposal.id]" 
                      class="flex items-center gap-4 p-4 hover:bg-midnight-50/50 transition-colors"
                    >
                      <div class="w-10 h-10 rounded-lg bg-midnight-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-midnight-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-midnight-900">{{ proposal.title }}</div>
                        <div class="text-sm text-midnight-500">{{ proposal.reference_number }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-mono font-medium">{{ proposal.formatted_total }}</div>
                        <span 
                          class="badge text-xs"
                          [class.bg-slate-100]="proposal.status === 'draft'"
                          [class.text-slate-700]="proposal.status === 'draft'"
                          [class.bg-blue-100]="proposal.status === 'sent'"
                          [class.text-blue-700]="proposal.status === 'sent'"
                          [class.bg-green-100]="proposal.status === 'accepted'"
                          [class.text-green-700]="proposal.status === 'accepted'"
                          [class.bg-red-100]="proposal.status === 'rejected'"
                          [class.text-red-700]="proposal.status === 'rejected'"
                        >
                          {{ proposal.status | titlecase }}
                        </span>
                      </div>
                    </a>
                  }
                </div>
              } @else {
                <div class="card-body text-center py-8">
                  <p class="text-midnight-500">No proposals yet</p>
                  <a 
                    [routerLink]="['/proposals/new']" 
                    [queryParams]="{project_id: project.id}"
                    class="btn-outline btn-sm mt-3"
                  >
                    Create First Proposal
                  </a>
                </div>
              }
            </div>
            
            <!-- Meetings -->
            <div class="card">
              <div class="card-header flex items-center justify-between">
                <h3 class="card-title">Meetings</h3>
                <a 
                  [routerLink]="['/meetings/new']" 
                  [queryParams]="{project_id: project.id}"
                  class="btn-ghost btn-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Schedule
                </a>
              </div>
              @if (project.meetings && project.meetings.length > 0) {
                <div class="divide-y divide-midnight-100">
                  @for (meeting of project.meetings; track meeting.id) {
                    <a 
                      [routerLink]="['/meetings', meeting.id]" 
                      class="flex items-center gap-4 p-4 hover:bg-midnight-50/50 transition-colors"
                    >
                      <div 
                        class="w-10 h-10 rounded-lg flex items-center justify-center"
                        [class.bg-blue-100]="meeting.type === 'virtual'"
                        [class.bg-green-100]="meeting.type === 'in_person'"
                        [class.bg-purple-100]="meeting.type === 'phone'"
                      >
                        @switch (meeting.type) {
                          @case ('virtual') {
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }
                          @case ('in_person') {
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          }
                          @case ('phone') {
                            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          }
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-midnight-900">{{ meeting.title }}</div>
                        <div class="text-sm text-midnight-500">
                          {{ meeting.scheduled_at | date:'mediumDate' }} at {{ meeting.scheduled_at | date:'shortTime' }}
                        </div>
                      </div>
                      <span 
                        class="badge"
                        [class.badge-info]="meeting.status === 'scheduled'"
                        [class.badge-success]="meeting.status === 'completed'"
                        [class.badge-error]="meeting.status === 'cancelled'"
                      >
                        {{ meeting.status | titlecase }}
                      </span>
                    </a>
                  }
                </div>
              } @else {
                <div class="card-body text-center py-8">
                  <p class="text-midnight-500">No meetings scheduled</p>
                  <a 
                    [routerLink]="['/meetings/new']" 
                    [queryParams]="{project_id: project.id}"
                    class="btn-outline btn-sm mt-3"
                  >
                    Schedule First Meeting
                  </a>
                </div>
              }
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Key Metrics -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Key Metrics</h3>
              </div>
              <div class="card-body space-y-4">
                @if (project.formatted_budget) {
                  <div class="flex justify-between items-center">
                    <span class="text-midnight-500">Budget</span>
                    <span class="font-mono font-bold text-midnight-900">{{ project.formatted_budget }}</span>
                  </div>
                }
                <div class="flex justify-between items-center">
                  <span class="text-midnight-500">Interest</span>
                  <span 
                    class="font-bold"
                    [class.text-red-600]="project.interest_level < 4"
                    [class.text-yellow-600]="project.interest_level >= 4 && project.interest_level < 7"
                    [class.text-green-600]="project.interest_level >= 7"
                  >
                    {{ project.interest_level }}/10 ({{ project.interest_label }})
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-midnight-500">Stage</span>
                  <span class="badge" [class]="getStageBadgeClass(project.stage)">{{ project.stage_label }}</span>
                </div>
              </div>
            </div>
            
            <!-- Details -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Details</h3>
              </div>
              <div class="card-body space-y-4">
                @if (project.start_date) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Start Date</span>
                    <span class="text-midnight-900">{{ project.start_date | date:'mediumDate' }}</span>
                  </div>
                }
                @if (project.expected_close_date) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Expected Close</span>
                    <span class="text-midnight-900">{{ project.expected_close_date | date:'mediumDate' }}</span>
                  </div>
                }
                @if (project.actual_close_date) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Actual Close</span>
                    <span class="text-midnight-900">{{ project.actual_close_date | date:'mediumDate' }}</span>
                  </div>
                }
                <div class="flex justify-between">
                  <span class="text-midnight-500">Created</span>
                  <span class="text-midnight-900">{{ project.created_at | date:'mediumDate' }}</span>
                </div>
                @if (project.assigned_user) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Assigned To</span>
                    <span class="text-midnight-900">{{ project.assigned_user.name }}</span>
                  </div>
                }
              </div>
            </div>
            
            <!-- Primary Contact -->
            @if (project.primary_contact) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Primary Contact</h3>
                </div>
                <div class="card-body">
                  <a 
                    [routerLink]="['/contacts', project.primary_contact.id]" 
                    class="flex items-center gap-3 p-3 rounded-lg bg-midnight-50 hover:bg-midnight-100 transition-colors"
                  >
                    <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark font-semibold">
                      {{ project.primary_contact.first_name.charAt(0) }}{{ project.primary_contact.last_name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-midnight-900">
                        {{ project.primary_contact.first_name }} {{ project.primary_contact.last_name }}
                      </div>
                      @if (project.primary_contact.email) {
                        <div class="text-sm text-midnight-500 truncate">{{ project.primary_contact.email }}</div>
                      }
                    </div>
                  </a>
                </div>
              </div>
            }
            
            <!-- Organization -->
            @if (project.organization) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Organization</h3>
                </div>
                <div class="card-body">
                  <a 
                    [routerLink]="['/organizations', project.organization.id]" 
                    class="block p-3 rounded-lg bg-midnight-50 hover:bg-midnight-100 transition-colors"
                  >
                    <div class="font-medium text-midnight-900">{{ project.organization.name }}</div>
                    @if (project.organization.type) {
                      <div class="text-sm text-midnight-500 capitalize">{{ project.organization.type }}</div>
                    }
                  </a>
                </div>
              </div>
            }
            
            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
              </div>
              <div class="card-body space-y-2">
                @if (!project.is_closed) {
                  <button 
                    (click)="updateStage('closed_won')" 
                    class="btn-outline w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                    [disabled]="projectState.isLoading()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark as Won
                  </button>
                  <button 
                    (click)="updateStage('closed_lost')" 
                    class="btn-outline w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    [disabled]="projectState.isLoading()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark as Lost
                  </button>
                }
              </div>
            </div>
            
            <!-- Danger Zone -->
            <div class="card border-red-200">
              <div class="card-header">
                <h3 class="card-title text-red-600">Danger Zone</h3>
              </div>
              <div class="card-body">
                <button 
                  (click)="deleteProject()" 
                  class="btn-outline text-red-600 border-red-200 hover:bg-red-50 w-full"
                  [disabled]="projectState.isLoading()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state py-16">
          <div class="empty-title">Project not found</div>
          <a routerLink="/projects" class="btn-primary mt-4">Back to Projects</a>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ProjectDetailComponent implements OnInit {
  projectState = inject(ProjectState);
  proposalState = inject(ProposalState);
  meetingState = inject(MeetingState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  stages = PROJECT_STAGES;
  statuses = PROJECT_STATUSES;
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectState.loadProject(id);
    }
  }
  
  getStageBadgeClass(stage: string): string {
    const stageConfig = this.stages.find(s => s.value === stage);
    return stageConfig ? `${stageConfig.color} text-white` : 'bg-midnight-200';
  }
  
  getStageProgressClass(stage: string, currentStage: string): string {
    const stageIndex = this.stages.findIndex(s => s.value === stage);
    const currentIndex = this.stages.findIndex(s => s.value === currentStage);
    
    if (stageIndex <= currentIndex) {
      const stageConfig = this.stages.find(s => s.value === currentStage);
      return stageConfig?.color || 'bg-nexus-500';
    }
    return 'bg-midnight-200';
  }
  
  async updateStage(stage: string): Promise<void> {
    const project = this.projectState.selectedProject();
    if (!project) return;
    
    if (stage === 'closed_won' || stage === 'closed_lost') {
      const action = stage === 'closed_won' ? 'won' : 'lost';
      if (!confirm(`Are you sure you want to mark this project as ${action}?`)) {
        return;
      }
    }
    
    await this.projectState.updateStage(project.id, stage);
  }
  
  async updateInterestLevel(level: number): Promise<void> {
    const project = this.projectState.selectedProject();
    if (!project) return;
    
    await this.projectState.updateInterestLevel(project.id, level);
  }
  
  async deleteProject(): Promise<void> {
    const project = this.projectState.selectedProject();
    if (!project) return;
    
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await this.projectState.deleteProject(project.id);
      this.router.navigate(['/projects']);
    }
  }
}
