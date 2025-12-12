import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ProposalState } from '../../../core/state/proposal.state';
import { getProposalStatusConfig, Proposal } from '../../../core/models/proposal.model';

@Component({
  selector: 'app-proposal-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, TitleCasePipe, DecimalPipe],
  template: `
    <div class="page-enter space-y-6">
      @if (proposalState.isLoading()) {
        <div class="space-y-4">
          <div class="skeleton h-8 w-64"></div>
          <div class="skeleton h-4 w-48"></div>
          <div class="card p-6">
            <div class="skeleton h-32"></div>
          </div>
        </div>
      } @else if (proposalState.selectedProposal(); as proposal) {
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <a routerLink="/proposals" class="text-midnight-400 hover:text-midnight-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <span class="font-mono text-sm text-midnight-500">{{ proposal.reference_number }}</span>
              <span 
                class="badge"
                [class]="getStatusBadgeClass(proposal.status)"
              >
                {{ proposal.status | titlecase }}
              </span>
              @if (proposal.is_expired) {
                <span class="badge badge-error">Expired</span>
              }
            </div>
            <h1 class="text-2xl font-display font-bold text-midnight-900">{{ proposal.title }}</h1>
            @if (proposal.project) {
              <p class="text-midnight-500 mt-1">
                For project: 
                <a [routerLink]="['/projects', proposal.project.id]" class="text-nexus-600 hover:underline">
                  {{ proposal.project.name }}
                </a>
              </p>
            }
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            @if (proposal.is_editable) {
              <a [routerLink]="['/proposals', proposal.id, 'edit']" class="btn-ghost">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </a>
            }
            @if (proposal.status === 'draft') {
              <button (click)="sendProposal()" class="btn-primary" [disabled]="proposalState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Proposal
              </button>
            }
            @if (proposal.status === 'sent' || proposal.status === 'viewed') {
              <button (click)="acceptProposal()" class="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm" [disabled]="proposalState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </button>
              <button (click)="rejectProposal()" class="btn bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 focus:ring-red-500" [disabled]="proposalState.isSaving()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            }
            <button (click)="duplicateProposal()" class="btn-outline" [disabled]="proposalState.isSaving()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Description -->
            @if (proposal.description) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap">{{ proposal.description }}</p>
                </div>
              </div>
            }
            
            <!-- Line Items -->
            <div class="card overflow-hidden">
              <div class="card-header">
                <h3 class="card-title">Line Items</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th class="w-10 text-center">#</th>
                      <th class="min-w-[200px]">Description</th>
                      <th class="w-20 text-right">Qty</th>
                      <th class="w-28 text-right">Unit Price</th>
                      <th class="w-24 text-right">Discount</th>
                      <th class="w-28 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of proposal.items; track item.id; let i = $index) {
                      <tr>
                        <td class="text-midnight-400 text-center">{{ i + 1 }}</td>
                        <td class="font-medium text-midnight-800">{{ item.description }}</td>
                        <td class="text-right font-mono text-sm">{{ item.quantity | number:'1.0-2' }}</td>
                        <td class="text-right font-mono text-sm">{{ item.unit_price | currency:proposal.currency }}</td>
                        <td class="text-right font-mono text-sm">
                          @if (item.discount_percent > 0) {
                            <span class="text-red-600">{{ item.discount_percent }}%</span>
                          } @else {
                            <span class="text-midnight-300">—</span>
                          }
                        </td>
                        <td class="text-right font-mono font-medium">{{ item.total_line | currency:proposal.currency }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class="bg-midnight-50">
                    <tr class="border-t-2 border-midnight-200">
                      <td colspan="4"></td>
                      <td class="text-right font-medium text-midnight-600 py-3">Subtotal</td>
                      <td class="text-right font-mono py-3">{{ proposal.subtotal | currency:proposal.currency }}</td>
                    </tr>
                    @if (proposal.discount_amount > 0) {
                      <tr>
                        <td colspan="4"></td>
                        <td class="text-right font-medium text-red-600 py-2">Discount</td>
                        <td class="text-right font-mono text-red-600 py-2">-{{ proposal.discount_amount | currency:proposal.currency }}</td>
                      </tr>
                    }
                    @if (proposal.tax_amount > 0) {
                      <tr>
                        <td colspan="4"></td>
                        <td class="text-right font-medium text-midnight-600 py-2">Tax</td>
                        <td class="text-right font-mono py-2">{{ proposal.tax_amount | currency:proposal.currency }}</td>
                      </tr>
                    }
                    <tr class="border-t border-midnight-200">
                      <td colspan="4"></td>
                      <td class="text-right font-bold text-midnight-900 py-3 text-lg">Total</td>
                      <td class="text-right font-mono font-bold text-nexus-600 py-3 text-lg">{{ proposal.total_amount | currency:proposal.currency }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <!-- Terms & Conditions -->
            @if (proposal.terms_conditions) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Terms & Conditions</h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap text-sm">{{ proposal.terms_conditions }}</p>
                </div>
              </div>
            }
          </div>
          
          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Details -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Details</h3>
              </div>
              <div class="card-body space-y-4">
                <div class="flex justify-between">
                  <span class="text-midnight-500">Created</span>
                  <span class="text-midnight-900">{{ proposal.created_at | date:'mediumDate' }}</span>
                </div>
                @if (proposal.valid_until) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Valid Until</span>
                    <span class="text-midnight-900" [class.text-red-600]="proposal.is_expired">
                      {{ proposal.valid_until | date:'mediumDate' }}
                    </span>
                  </div>
                }
                @if (proposal.sent_at) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Sent</span>
                    <span class="text-midnight-900">{{ proposal.sent_at | date:'mediumDate' }}</span>
                  </div>
                }
                @if (proposal.viewed_at) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Viewed</span>
                    <span class="text-midnight-900">{{ proposal.viewed_at | date:'mediumDate' }}</span>
                  </div>
                }
                @if (proposal.responded_at) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Responded</span>
                    <span class="text-midnight-900">{{ proposal.responded_at | date:'mediumDate' }}</span>
                  </div>
                }
                @if (proposal.creator) {
                  <div class="flex justify-between">
                    <span class="text-midnight-500">Created By</span>
                    <span class="text-midnight-900">{{ proposal.creator.name }}</span>
                  </div>
                }
              </div>
            </div>
            
            <!-- Project Info -->
            @if (proposal.project) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Project</h3>
                </div>
                <div class="card-body">
                  <a 
                    [routerLink]="['/projects', proposal.project.id]" 
                    class="block p-3 rounded-lg bg-midnight-50 hover:bg-midnight-100 transition-colors"
                  >
                    <div class="font-medium text-midnight-900">{{ proposal.project.name }}</div>
                    @if (proposal.project.organization) {
                      <div class="text-sm text-midnight-500 mt-1">{{ proposal.project.organization.name }}</div>
                    }
                  </a>
                </div>
              </div>
            }
            
            <!-- Notes -->
            @if (proposal.notes) {
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Notes</h3>
                </div>
                <div class="card-body">
                  <p class="text-midnight-700 whitespace-pre-wrap text-sm">{{ proposal.notes }}</p>
                </div>
              </div>
            }
            
            <!-- Danger Zone -->
            @if (proposal.is_editable) {
              <div class="card border-red-200">
                <div class="card-header">
                  <h3 class="card-title text-red-600">Danger Zone</h3>
                </div>
                <div class="card-body">
                  <button 
                    (click)="deleteProposal()" 
                    class="btn-outline text-red-600 border-red-200 hover:bg-red-50 w-full"
                    [disabled]="proposalState.isSaving()"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Proposal
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="empty-state py-16">
          <div class="empty-title">Proposal not found</div>
          <a routerLink="/proposals" class="btn-primary mt-4">Back to Proposals</a>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ProposalDetailComponent implements OnInit {
  proposalState = inject(ProposalState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proposalState.loadProposal(id);
    }
  }
  
  getStatusBadgeClass(status: string): string {
    const config = getProposalStatusConfig(status as any);
    return `${config.bgLight} ${config.textColor}`;
  }
  
  async sendProposal(): Promise<void> {
    const proposal = this.proposalState.selectedProposal();
    if (!proposal) return;
    
    if (confirm('Are you sure you want to send this proposal?')) {
      await this.proposalState.sendProposal(proposal.id);
    }
  }
  
  async acceptProposal(): Promise<void> {
    const proposal = this.proposalState.selectedProposal();
    if (!proposal) return;
    
    if (confirm('Mark this proposal as accepted?')) {
      await this.proposalState.acceptProposal(proposal.id);
    }
  }
  
  async rejectProposal(): Promise<void> {
    const proposal = this.proposalState.selectedProposal();
    if (!proposal) return;
    
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) {
      await this.proposalState.rejectProposal(proposal.id, reason || undefined);
    }
  }
  
  async duplicateProposal(): Promise<void> {
    const proposal = this.proposalState.selectedProposal();
    if (!proposal) return;
    
    const newProposal = await this.proposalState.duplicateProposal(proposal.id);
    this.router.navigate(['/proposals', newProposal.id, 'edit']);
  }
  
  async deleteProposal(): Promise<void> {
    const proposal = this.proposalState.selectedProposal();
    if (!proposal) return;
    
    if (confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      await this.proposalState.deleteProposal(proposal.id);
      this.router.navigate(['/proposals']);
    }
  }
}

