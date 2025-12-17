import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ProposalState } from '../../../core/state/proposal.state';
import { 
  ProposalFilters, 
  PROPOSAL_STATUSES, 
  getProposalStatusConfig 
} from '../../../core/models/proposal.model';

@Component({
  selector: 'app-proposal-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Proposals</h1>
          <p class="text-midnight-500 mt-1">Create and manage client proposals.</p>
        </div>
        <a routerLink="/proposals/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </a>
      </div>
      
      <!-- Statistics Overview -->
      @if (proposalState.statistics()) {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (status of statuses; track status.value) {
            <button 
              (click)="filterByStatus(status.value)"
              class="card p-4 text-center transition-all hover:shadow-md cursor-pointer"
              [class.ring-2]="filters().status === status.value"
              [class.ring-nexus-500]="filters().status === status.value"
            >
              <div class="w-3 h-3 rounded-full mx-auto mb-2" [class]="status.color"></div>
              <div class="text-xs text-midnight-500 uppercase font-semibold">{{ status.label }}</div>
              <div class="text-2xl font-display font-bold text-midnight-900 mt-1">
                {{ getStatCount(status.value) }}
              </div>
            </button>
          }
        </div>
      }
      
      <!-- Key Metrics -->
      @if (proposalState.statistics(); as stats) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card p-4">
            <div class="text-sm text-midnight-500">Acceptance Rate</div>
            <div class="text-2xl font-display font-bold text-green-600 mt-1">
              {{ stats.acceptance_rate }}%
            </div>
          </div>
          <div class="card p-4">
            <div class="text-sm text-midnight-500">Value Pending</div>
            <div class="text-2xl font-display font-bold text-blue-600 mt-1">
              {{ stats.total_value_pending | currency:'USD':'symbol':'1.0-0' }}
            </div>
          </div>
          <div class="card p-4">
            <div class="text-sm text-midnight-500">Value Accepted</div>
            <div class="text-2xl font-display font-bold text-nexus-600 mt-1">
              {{ stats.total_value_accepted | currency:'USD':'symbol':'1.0-0' }}
            </div>
          </div>
        </div>
      }
      
      <!-- Filters -->
      <div class="card">
        <div class="card-body">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Search -->
            <div class="flex-1 min-w-[200px]">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearch()"
                  placeholder="Search proposals..."
                  class="input pl-10"
                />
              </div>
            </div>
            
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
      
      <!-- Proposals Table -->
      <div class="card overflow-hidden">
        @if (proposalState.isLoading()) {
          <div class="p-6 space-y-4">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="skeleton h-16 rounded-xl"></div>
            }
          </div>
        } @else if (!proposalState.hasProposals()) {
          <div class="empty-state py-16">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="empty-title">No proposals found</div>
            <div class="empty-description">Create your first proposal to get started.</div>
            <a routerLink="/proposals/new" class="btn-primary mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Proposal
            </a>
          </div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Title</th>
                <th>Project</th>
                <th>Total</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th class="w-20"></th>
              </tr>
            </thead>
            <tbody>
              @for (proposal of proposalState.proposals(); track proposal.id) {
                <tr class="group">
                  <td>
                    <a [routerLink]="['/proposals', proposal.id]" class="font-mono text-sm text-midnight-600 hover:text-nexus-600">
                      {{ proposal.reference_number }}
                    </a>
                  </td>
                  <td>
                    <a [routerLink]="['/proposals', proposal.id]" class="font-medium text-midnight-900 group-hover:text-nexus-600">
                      {{ proposal.title }}
                    </a>
                  </td>
                  <td>
                    @if (proposal.project) {
                      <a [routerLink]="['/projects', proposal.project.id]" class="text-midnight-600 hover:text-nexus-600">
                        {{ proposal.project.name }}
                      </a>
                    } @else {
                      <span class="text-midnight-400">—</span>
                    }
                  </td>
                  <td>
                    <span class="font-mono font-medium">{{ proposal.formatted_total }}</span>
                  </td>
                  <td>
                    @if (proposal.valid_until) {
                      <span [class.text-red-600]="proposal.is_expired">
                        {{ proposal.valid_until | date:'mediumDate' }}
                      </span>
                      @if (proposal.is_expired) {
                        <span class="badge badge-error text-xs ml-1">Expired</span>
                      }
                    } @else {
                      <span class="text-midnight-400">—</span>
                    }
                  </td>
                  <td>
                    <span 
                      class="badge"
                      [class]="getStatusBadgeClass(proposal.status)"
                    >
                      {{ proposal.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        [routerLink]="['/proposals', proposal.id]" 
                        class="p-1.5 rounded-lg hover:bg-midnight-100 text-midnight-500 hover:text-midnight-700"
                        title="View"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      @if (proposal.is_editable) {
                        <a 
                          [routerLink]="['/proposals', proposal.id, 'edit']" 
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
export class ProposalListComponent implements OnInit {
  proposalState = inject(ProposalState);
  
  statuses = PROPOSAL_STATUSES;
  searchQuery = '';
  filters = signal<ProposalFilters>({});
  
  private searchTimeout: any;
  
  ngOnInit(): void {
    this.proposalState.loadProposals();
    this.proposalState.loadStatistics();
  }
  
  getStatCount(status: string): number {
    const stats = this.proposalState.statistics();
    if (!stats) return 0;
    return (stats as any)[status] ?? 0;
  }
  
  getStatusBadgeClass(status: string): string {
    const config = getProposalStatusConfig(status as any);
    return `${config.bgLight} ${config.textColor}`;
  }
  
  filterByStatus(status: string): void {
    const current = this.filters().status;
    this.filters.update(f => ({ 
      ...f, 
      status: current === status ? undefined : status,
      page: 1 
    }));
    this.loadWithFilters();
  }
  
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.update(f => ({ ...f, search: this.searchQuery || undefined, page: 1 }));
      this.loadWithFilters();
    }, 300);
  }
  
  onFilterChange(key: keyof ProposalFilters, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value || undefined, page: 1 }));
    this.loadWithFilters();
  }
  
  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.status || f.search);
  }
  
  clearFilters(): void {
    this.searchQuery = '';
    this.filters.set({});
    this.proposalState.loadProposals();
  }
  
  loadWithFilters(): void {
    this.proposalState.loadProposals(this.filters());
  }
}



