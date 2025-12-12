import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { Organization, OrganizationFilters, CreateOrganizationDto, Industry } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _organizations = signal<Organization[]>([]);
  private _selectedOrganization = signal<Organization | null>(null);
  private _industries = signal<Industry[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  
  // Public read-only signals
  readonly organizations = this._organizations.asReadonly();
  readonly selectedOrganization = this._selectedOrganization.asReadonly();
  readonly industries = this._industries.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // Computed signals
  readonly hasOrganizations = computed(() => this._organizations().length > 0);
  readonly parentOrganizations = computed(() => 
    this._organizations().filter(org => org.type === 'parent')
  );
  readonly totalCount = computed(() => this._pagination().total);
  
  // Actions
  loadOrganizations(filters: OrganizationFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Organization>>('organizations', filters).subscribe({
      next: (response) => {
        this._organizations.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load organizations');
        this._isLoading.set(false);
      }
    });
  }
  
  loadOrganization(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Organization>>(`organizations/${id}`).subscribe({
      next: (response) => {
        this._selectedOrganization.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load organization');
        this._isLoading.set(false);
      }
    });
  }
  
  loadIndustries(): void {
    this.api.get<{ data: Industry[] }>('industries').subscribe({
      next: (response) => {
        this._industries.set(response.data);
      },
      error: () => {
        // Silent fail for industries
      }
    });
  }
  
  createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Organization>>('organizations', data).subscribe({
        next: (response) => {
          // Add to list
          this._organizations.update(orgs => [response.data, ...orgs]);
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create organization');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateOrganization(id: string, data: Partial<CreateOrganizationDto>): Promise<Organization> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Organization>>(`organizations/${id}`, data).subscribe({
        next: (response) => {
          // Update in list
          this._organizations.update(orgs => 
            orgs.map(org => org.id === id ? response.data : org)
          );
          // Update selected if same
          if (this._selectedOrganization()?.id === id) {
            this._selectedOrganization.set(response.data);
          }
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update organization');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  deleteOrganization(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`organizations/${id}`).subscribe({
        next: () => {
          // Remove from list
          this._organizations.update(orgs => orgs.filter(org => org.id !== id));
          // Clear selected if same
          if (this._selectedOrganization()?.id === id) {
            this._selectedOrganization.set(null);
          }
          this._isLoading.set(false);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete organization');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  clearSelected(): void {
    this._selectedOrganization.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
}

