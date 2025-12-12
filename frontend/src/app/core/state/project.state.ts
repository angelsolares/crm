import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { Project, ProjectFilters, CreateProjectDto, PipelineData } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _projects = signal<Project[]>([]);
  private _selectedProject = signal<Project | null>(null);
  private _pipeline = signal<PipelineData>({});
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  
  // Public read-only signals
  readonly projects = this._projects.asReadonly();
  readonly selectedProject = this._selectedProject.asReadonly();
  readonly pipeline = this._pipeline.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // Computed signals
  readonly hasProjects = computed(() => this._projects().length > 0);
  readonly totalCount = computed(() => this._pagination().total);
  readonly activeProjects = computed(() => 
    this._projects().filter(p => p.status === 'active')
  );
  readonly highInterestProjects = computed(() => 
    this._projects().filter(p => p.interest_level >= 7)
  );
  
  // Actions
  loadProjects(filters: ProjectFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Project>>('projects', filters).subscribe({
      next: (response) => {
        this._projects.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load projects');
        this._isLoading.set(false);
      }
    });
  }
  
  loadProject(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Project>>(`projects/${id}`).subscribe({
      next: (response) => {
        this._selectedProject.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load project');
        this._isLoading.set(false);
      }
    });
  }
  
  loadPipeline(): void {
    this.api.get<{ data: PipelineData }>('projects/pipeline').subscribe({
      next: (response) => {
        this._pipeline.set(response.data);
      }
    });
  }
  
  createProject(data: CreateProjectDto): Promise<Project> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Project>>('projects', data).subscribe({
        next: (response) => {
          this._projects.update(projects => [response.data, ...projects]);
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create project');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Project>>(`projects/${id}`, data).subscribe({
        next: (response) => {
          this._projects.update(projects => 
            projects.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProject()?.id === id) {
            this._selectedProject.set(response.data);
          }
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update project');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateStage(id: string, stage: string): Promise<Project> {
    this._isLoading.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.patch<ApiResponse<Project>>(`projects/${id}/stage`, { stage }).subscribe({
        next: (response) => {
          this._projects.update(projects => 
            projects.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProject()?.id === id) {
            this._selectedProject.set(response.data);
          }
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateInterestLevel(id: string, level: number): Promise<Project> {
    return new Promise((resolve, reject) => {
      this.api.patch<ApiResponse<Project>>(`projects/${id}/interest-level`, { interest_level: level }).subscribe({
        next: (response) => {
          this._projects.update(projects => 
            projects.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProject()?.id === id) {
            this._selectedProject.set(response.data);
          }
          resolve(response.data);
        },
        error: reject
      });
    });
  }
  
  deleteProject(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`projects/${id}`).subscribe({
        next: () => {
          this._projects.update(projects => projects.filter(p => p.id !== id));
          if (this._selectedProject()?.id === id) {
            this._selectedProject.set(null);
          }
          this._isLoading.set(false);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete project');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  clearSelected(): void {
    this._selectedProject.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
}

