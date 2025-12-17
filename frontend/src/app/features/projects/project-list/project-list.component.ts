import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { ProjectState } from '../../../core/state/project.state';
import { PROJECT_STAGES, PROJECT_STATUSES } from '../../../core/models/project.model';
import { PermissionState } from '../../../core/state/permission.state';
import { HasPermissionDirective } from '../../../shared/directives/permission.directive';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, TitleCasePipe, DecimalPipe, HasPermissionDirective],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Projects</h1>
          <p class="text-midnight-500 mt-1">Track your sales pipeline and opportunities.</p>
        </div>
        <a *hasPermission="'projects.create'" routerLink="/projects/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </a>
      </div>
      
      <!-- Pipeline Overview -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        @for (stage of stages; track stage.value) {
          <div class="card p-4 text-center">
            <div class="w-3 h-3 rounded-full mx-auto mb-2" [class]="stage.color"></div>
            <div class="text-xs text-midnight-500 uppercase font-semibold">{{ stage.label }}</div>
            <div class="text-2xl font-display font-bold text-midnight-900 mt-1">
              {{ projectState.pipeline()[stage.value]?.count || 0 }}
            </div>
          </div>
        }
      </div>
      
      <!-- Projects Table -->
      <div class="card overflow-hidden">
        @if (projectState.isLoading()) {
          <div class="p-6 space-y-4">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="skeleton h-16 rounded-xl"></div>
            }
          </div>
        } @else if (!projectState.hasProjects()) {
          <div class="empty-state py-16">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div class="empty-title">No projects yet</div>
            <div class="empty-description">Start tracking your sales opportunities.</div>
            <a *hasPermission="'projects.create'" routerLink="/projects/new" class="btn-primary mt-4">Create Project</a>
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
                <th>Status</th>
                <th class="w-24"></th>
              </tr>
            </thead>
            <tbody>
              @for (project of projectState.projects(); track project.id) {
                <tr class="group">
                  <td>
                    <a [routerLink]="['/projects', project.id]" class="font-medium text-midnight-900 group-hover:text-nexus-600">
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
                      <div class="w-12 h-2 bg-midnight-100 rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full"
                          [class.bg-red-500]="project.interest_level < 4"
                          [class.bg-yellow-500]="project.interest_level >= 4 && project.interest_level < 7"
                          [class.bg-green-500]="project.interest_level >= 7"
                          [style.width.%]="project.interest_level * 10"
                        ></div>
                      </div>
                      <span class="text-sm">{{ project.interest_level }}</span>
                    </div>
                  </td>
                  <td>
                    @if (project.formatted_budget) {
                      <span class="font-mono">{{ project.formatted_budget }}</span>
                    } @else {
                      <span class="text-midnight-400">—</span>
                    }
                  </td>
                  <td>
                    <span 
                      class="badge capitalize"
                      [class.badge-success]="project.status === 'active'"
                      [class.badge-warning]="project.status === 'on_hold'"
                      [class.badge-neutral]="project.status === 'completed'"
                    >
                      {{ project.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        [routerLink]="['/projects', project.id]" 
                        class="p-2 rounded-lg text-midnight-400 hover:text-nexus-600 hover:bg-nexus-50 transition-colors"
                        title="View"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <a 
                        [routerLink]="['/projects', project.id, 'edit']" 
                        class="p-2 rounded-lg text-midnight-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button 
                        *hasPermission="'projects.delete'"
                        (click)="deleteProject(project.id, project.name)"
                        class="p-2 rounded-lg text-midnight-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
export class ProjectListComponent implements OnInit {
  projectState = inject(ProjectState);
  permissionState = inject(PermissionState);
  stages = PROJECT_STAGES;
  statuses = PROJECT_STATUSES;
  
  ngOnInit(): void {
    this.projectState.loadProjects();
    this.projectState.loadPipeline();
  }
  
  async deleteProject(id: string, name: string): Promise<void> {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await this.projectState.deleteProject(id);
        this.projectState.loadPipeline(); // Refresh pipeline counts
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  }
}

