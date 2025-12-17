import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { 
  Proposal, 
  ProposalFilters, 
  CreateProposalDto, 
  UpdateProposalDto,
  ProposalStatistics 
} from '../models/proposal.model';

@Injectable({ providedIn: 'root' })
export class ProposalState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _proposals = signal<Proposal[]>([]);
  private _selectedProposal = signal<Proposal | null>(null);
  private _statistics = signal<ProposalStatistics | null>(null);
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
  readonly proposals = this._proposals.asReadonly();
  readonly selectedProposal = this._selectedProposal.asReadonly();
  readonly statistics = this._statistics.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // Computed signals
  readonly hasProposals = computed(() => this._proposals().length > 0);
  readonly totalCount = computed(() => this._pagination().total);
  readonly draftProposals = computed(() => 
    this._proposals().filter(p => p.status === 'draft')
  );
  readonly pendingProposals = computed(() => 
    this._proposals().filter(p => ['sent', 'viewed'].includes(p.status))
  );
  readonly acceptedProposals = computed(() => 
    this._proposals().filter(p => p.status === 'accepted')
  );
  readonly acceptanceRate = computed(() => this._statistics()?.acceptance_rate ?? 0);
  
  // Actions
  loadProposals(filters: ProposalFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Proposal>>('proposals', filters).subscribe({
      next: (response) => {
        this._proposals.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load proposals');
        this._isLoading.set(false);
      }
    });
  }
  
  loadProposal(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Proposal>>(`proposals/${id}`).subscribe({
      next: (response) => {
        this._selectedProposal.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load proposal');
        this._isLoading.set(false);
      }
    });
  }
  
  loadStatistics(): void {
    this.api.get<{ data: ProposalStatistics }>('proposals/statistics').subscribe({
      next: (response) => {
        this._statistics.set(response.data);
      }
    });
  }
  
  loadByProject(projectId: string): void {
    this._isLoading.set(true);
    
    this.api.get<{ data: Proposal[] }>(`proposals/by-project/${projectId}`).subscribe({
      next: (response) => {
        this._proposals.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load proposals');
        this._isLoading.set(false);
      }
    });
  }
  
  createProposal(data: CreateProposalDto): Promise<Proposal> {
    this._isSaving.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Proposal>>('proposals', data).subscribe({
        next: (response) => {
          this._proposals.update(proposals => [response.data, ...proposals]);
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateProposal(id: string, data: UpdateProposalDto): Promise<Proposal> {
    this._isSaving.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Proposal>>(`proposals/${id}`, data).subscribe({
        next: (response) => {
          this._proposals.update(proposals => 
            proposals.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProposal()?.id === id) {
            this._selectedProposal.set(response.data);
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  deleteProposal(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`proposals/${id}`).subscribe({
        next: () => {
          this._proposals.update(proposals => proposals.filter(p => p.id !== id));
          if (this._selectedProposal()?.id === id) {
            this._selectedProposal.set(null);
          }
          this._isLoading.set(false);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete proposal');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  duplicateProposal(id: string): Promise<Proposal> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Proposal>>(`proposals/${id}/duplicate`, {}).subscribe({
        next: (response) => {
          this._proposals.update(proposals => [response.data, ...proposals]);
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to duplicate proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  sendProposal(id: string): Promise<Proposal> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Proposal>>(`proposals/${id}/send`, {}).subscribe({
        next: (response) => {
          this._proposals.update(proposals => 
            proposals.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProposal()?.id === id) {
            this._selectedProposal.set(response.data);
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to send proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  acceptProposal(id: string): Promise<Proposal> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Proposal>>(`proposals/${id}/accept`, {}).subscribe({
        next: (response) => {
          this._proposals.update(proposals => 
            proposals.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProposal()?.id === id) {
            this._selectedProposal.set(response.data);
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to accept proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  rejectProposal(id: string, reason?: string): Promise<Proposal> {
    this._isSaving.set(true);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Proposal>>(`proposals/${id}/reject`, { reason }).subscribe({
        next: (response) => {
          this._proposals.update(proposals => 
            proposals.map(p => p.id === id ? response.data : p)
          );
          if (this._selectedProposal()?.id === id) {
            this._selectedProposal.set(response.data);
          }
          this._isSaving.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to reject proposal');
          this._isSaving.set(false);
          reject(err);
        }
      });
    });
  }
  
  clearSelected(): void {
    this._selectedProposal.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
}



