import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProposalState } from '../../../core/state/proposal.state';
import { ProjectState } from '../../../core/state/project.state';
import { CreateProposalDto, CreateProposalItemDto, Proposal } from '../../../core/models/proposal.model';

@Component({
  selector: 'app-proposal-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="page-enter max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/proposals" class="btn-ghost btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">
            {{ isEditMode ? 'Edit Proposal' : 'New Proposal' }}
          </h1>
          <p class="text-midnight-500 mt-1">
            {{ isEditMode ? 'Update proposal details and line items.' : 'Create a new proposal for a project.' }}
          </p>
        </div>
      </div>
      
      @if (proposalState.error()) {
        <div class="alert alert-error mb-6">
          {{ proposalState.error() }}
        </div>
      }
      
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-6">
        <!-- Basic Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Basic Information</h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Project Selection -->
            <div class="form-group">
              <label for="project_id" class="label">Project <span class="text-red-500">*</span></label>
              <select
                id="project_id"
                name="project_id"
                [(ngModel)]="formData.project_id"
                required
                class="select"
                [disabled]="isEditMode"
              >
                <option value="">Select a project...</option>
                @for (project of projectState.projects(); track project.id) {
                  <option [value]="project.id">{{ project.name }} - {{ project.organization?.name }}</option>
                }
              </select>
            </div>
            
            <!-- Title -->
            <div class="form-group">
              <label for="title" class="label">Title <span class="text-red-500">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                [(ngModel)]="formData.title"
                required
                maxlength="255"
                class="input"
                placeholder="Proposal title"
              />
            </div>
            
            <!-- Description -->
            <div class="form-group">
              <label for="description" class="label">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="formData.description"
                rows="3"
                class="input"
                placeholder="Brief description of this proposal..."
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Currency -->
              <div class="form-group">
                <label for="currency" class="label">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  [(ngModel)]="formData.currency"
                  class="select"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="MXN">MXN - Mexican Peso</option>
                </select>
              </div>
              
              <!-- Valid Until -->
              <div class="form-group">
                <label for="valid_until" class="label">Valid Until</label>
                <input
                  type="date"
                  id="valid_until"
                  name="valid_until"
                  [(ngModel)]="formData.valid_until"
                  class="input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Line Items -->
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="card-title">Line Items</h3>
            <button type="button" (click)="addItem()" class="btn-outline btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
          <!-- Line Items as Cards -->
          <div class="space-y-4">
            @for (item of items(); track $index; let i = $index) {
              <div 
                class="border border-midnight-200 rounded-xl p-5 transition-all"
                [class.bg-red-50]="!item.description || !item.quantity || item.quantity <= 0"
                [class.border-red-300]="!item.description || !item.quantity || item.quantity <= 0"
                [class.bg-white]="item.description && item.quantity && item.quantity > 0"
              >
                <!-- Item Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-nexus-100 text-nexus-700 flex items-center justify-center font-bold text-sm">
                      {{ i + 1 }}
                    </span>
                    <span class="text-sm font-medium text-midnight-500">Item {{ i + 1 }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xl font-mono font-bold text-midnight-900">
                      {{ item.total_line | currency:formData.currency }}
                    </span>
                    @if (items().length > 1) {
                      <button 
                        type="button" 
                        (click)="removeItem(i)" 
                        class="p-2 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
                
                <!-- Description (Full Width) -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-midnight-600 mb-2">Description *</label>
                  <input
                    type="text"
                    [(ngModel)]="item.description"
                    [name]="'item_desc_' + i"
                    required
                    class="w-full px-4 py-3 text-base border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                    [class.border-red-300]="!item.description"
                    placeholder="Enter item or service description..."
                  />
                </div>
                
                <!-- Numeric Fields Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <!-- Quantity -->
                  <div>
                    <label class="block text-sm font-medium text-midnight-600 mb-2">Quantity *</label>
                    <input
                      type="number"
                      [(ngModel)]="item.quantity"
                      [name]="'item_qty_' + i"
                      (ngModelChange)="calculateLineTotal(item)"
                      required
                      min="0.01"
                      step="0.01"
                      class="w-full px-4 py-3 text-center text-lg font-mono border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                      [class.border-red-300]="!item.quantity || item.quantity <= 0"
                      placeholder="1"
                    />
                  </div>
                  
                  <!-- Unit Price -->
                  <div>
                    <label class="block text-sm font-medium text-midnight-600 mb-2">Unit Price</label>
                    <input
                      type="number"
                      [(ngModel)]="item.unit_price"
                      [name]="'item_price_' + i"
                      (ngModelChange)="calculateLineTotal(item)"
                      required
                      min="0"
                      step="0.01"
                      class="w-full px-4 py-3 text-right text-lg font-mono border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <!-- Discount % -->
                  <div>
                    <label class="block text-sm font-medium text-midnight-600 mb-2">Discount %</label>
                    <input
                      type="number"
                      [(ngModel)]="item.discount_percent"
                      [name]="'item_discount_' + i"
                      (ngModelChange)="calculateLineTotal(item)"
                      min="0"
                      max="100"
                      step="0.1"
                      class="w-full px-4 py-3 text-center text-lg font-mono border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  
                  <!-- Tax % -->
                  <div>
                    <label class="block text-sm font-medium text-midnight-600 mb-2">Tax %</label>
                    <input
                      type="number"
                      [(ngModel)]="item.tax_rate"
                      [name]="'item_tax_' + i"
                      min="0"
                      max="100"
                      step="0.1"
                      class="w-full px-4 py-3 text-center text-lg font-mono border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            }
          </div>
          
          <!-- Totals Section -->
          <div class="mt-6 bg-midnight-50 rounded-xl p-5 space-y-3">
            <div class="flex justify-between items-center py-2">
              <span class="font-medium text-midnight-700">Subtotal</span>
              <span class="text-lg font-mono font-semibold">{{ subtotal() | currency:formData.currency }}</span>
            </div>
            
            <div class="flex justify-between items-center py-2">
              <span class="font-medium text-midnight-700">Discount Amount</span>
              <div class="flex items-center gap-3">
                <input
                  type="number"
                  [(ngModel)]="formData.discount_amount"
                  name="discount_amount"
                  min="0"
                  step="0.01"
                  class="w-32 px-3 py-2 text-right text-base font-mono bg-white border border-midnight-200 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-nexus-500 transition-colors"
                  placeholder="0.00"
                />
                @if (formData.discount_amount && formData.discount_amount > 0) {
                  <span class="text-red-600 font-mono font-medium">-{{ formData.discount_amount | currency:formData.currency }}</span>
                }
              </div>
            </div>
            
            <div class="flex justify-between items-center py-2">
              <span class="font-medium text-midnight-700">Tax</span>
              <span class="text-lg font-mono">{{ taxAmount() | currency:formData.currency }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-4 border-t-2 border-midnight-300">
              <span class="text-xl font-bold text-midnight-900">Total</span>
              <span class="text-2xl font-mono font-bold text-nexus-600">{{ total() | currency:formData.currency }}</span>
            </div>
          </div>
        </div>
        
        <!-- Additional Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Additional Information</h3>
          </div>
          <div class="card-body space-y-4">
            <!-- Terms & Conditions -->
            <div class="form-group">
              <label for="terms_conditions" class="label">Terms & Conditions</label>
              <textarea
                id="terms_conditions"
                name="terms_conditions"
                [(ngModel)]="formData.terms_conditions"
                rows="4"
                class="input"
                placeholder="Payment terms, delivery conditions, etc."
              ></textarea>
            </div>
            
            <!-- Notes -->
            <div class="form-group">
              <label for="notes" class="label">Internal Notes</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="formData.notes"
                rows="2"
                class="input"
                placeholder="Notes visible only to your team..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex flex-col items-end gap-2">
          @if (form.invalid && !proposalState.isSaving()) {
            <p class="text-sm text-red-500">
              @if (!formData.project_id) {
                Please select a project.
              } @else if (!formData.title) {
                Please enter a title.
              } @else if (hasInvalidItems()) {
                Please fill in all required fields for each line item (description and quantity &gt; 0).
              } @else {
                Please complete all required fields.
              }
            </p>
          }
          <div class="flex items-center gap-4">
            <a routerLink="/proposals" class="btn-ghost">Cancel</a>
            <button 
              type="submit" 
              class="btn-primary" 
              [disabled]="form.invalid || proposalState.isSaving() || items().length === 0"
            >
              @if (proposalState.isSaving()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              } @else {
                {{ isEditMode ? 'Update Proposal' : 'Create Proposal' }}
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: ``
})
export class ProposalFormComponent implements OnInit {
  proposalState = inject(ProposalState);
  projectState = inject(ProjectState);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  isEditMode = false;
  proposalId: string | null = null;
  
  formData: {
    project_id: string;
    title: string;
    description: string | null;
    discount_amount: number;
    currency: string;
    valid_until: string | null;
    terms_conditions: string | null;
    notes: string | null;
  } = {
    project_id: '',
    title: '',
    description: null,
    discount_amount: 0,
    currency: 'USD',
    valid_until: this.getDefaultValidUntil(),
    terms_conditions: null,
    notes: null,
  };
  
  items = signal<(CreateProposalItemDto & { total_line: number })[]>([
    this.createEmptyItem()
  ]);
  
  ngOnInit(): void {
    // Load projects for selection
    this.projectState.loadProjects({ status: 'active', per_page: 100 });
    
    // Check if editing
    this.proposalId = this.route.snapshot.paramMap.get('id');
    if (this.proposalId) {
      this.isEditMode = true;
      this.loadProposal(this.proposalId);
    }
    
    // Check for pre-selected project
    const projectId = this.route.snapshot.queryParamMap.get('project_id');
    if (projectId) {
      this.formData.project_id = projectId;
    }
  }
  
  private loadProposal(id: string): void {
    this.proposalState.loadProposal(id);
    
    // Wait for proposal to load
    const checkLoaded = setInterval(() => {
      const proposal = this.proposalState.selectedProposal();
      if (proposal && proposal.id === id) {
        clearInterval(checkLoaded);
        this.populateForm(proposal);
      }
    }, 100);
  }
  
  private populateForm(proposal: Proposal): void {
    this.formData = {
      project_id: proposal.project_id,
      title: proposal.title,
      description: proposal.description,
      discount_amount: proposal.discount_amount,
      currency: proposal.currency,
      valid_until: proposal.valid_until,
      terms_conditions: proposal.terms_conditions,
      notes: proposal.notes,
    };
    
    if (proposal.items && proposal.items.length > 0) {
      this.items.set(proposal.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        tax_rate: item.tax_rate || 0,
        sort_order: item.sort_order,
        total_line: item.total_line,
      })));
    }
  }
  
  private createEmptyItem(): CreateProposalItemDto & { total_line: number } {
    return {
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      tax_rate: 0,
      sort_order: 0,
      total_line: 0,
    };
  }
  
  private getDefaultValidUntil(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }
  
  addItem(): void {
    const newItem = this.createEmptyItem();
    newItem.sort_order = this.items().length;
    this.items.update(items => [...items, newItem]);
  }
  
  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }
  
  calculateLineTotal(item: CreateProposalItemDto & { total_line: number }): void {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * ((item.discount_percent || 0) / 100);
    item.total_line = subtotal - discount;
  }
  
  hasInvalidItems(): boolean {
    return this.items().some(item => !item.description || !item.quantity || item.quantity <= 0);
  }
  
  subtotal(): number {
    return this.items().reduce((sum, item) => sum + item.total_line, 0);
  }
  
  taxAmount(): number {
    return this.items().reduce((sum, item) => {
      return sum + (item.total_line * ((item.tax_rate || 0) / 100));
    }, 0);
  }
  
  total(): number {
    return this.subtotal() - (this.formData.discount_amount || 0) + this.taxAmount();
  }
  
  async onSubmit(): Promise<void> {
    const itemsData: CreateProposalItemDto[] = this.items().map((item, index) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      tax_rate: item.tax_rate || 0,
      sort_order: index,
    }));
    
    try {
      if (this.isEditMode && this.proposalId) {
        await this.proposalState.updateProposal(this.proposalId, {
          title: this.formData.title,
          description: this.formData.description,
          discount_amount: this.formData.discount_amount,
          currency: this.formData.currency,
          valid_until: this.formData.valid_until,
          terms_conditions: this.formData.terms_conditions,
          notes: this.formData.notes,
          items: itemsData,
        });
        this.router.navigate(['/proposals', this.proposalId]);
      } else {
        const data: CreateProposalDto = {
          project_id: this.formData.project_id,
          title: this.formData.title,
          description: this.formData.description,
          discount_amount: this.formData.discount_amount,
          currency: this.formData.currency,
          valid_until: this.formData.valid_until,
          terms_conditions: this.formData.terms_conditions,
          notes: this.formData.notes,
          items: itemsData,
        };
        const proposal = await this.proposalState.createProposal(data);
        this.router.navigate(['/proposals', proposal.id]);
      }
    } catch (error) {
      // Error is handled by state
    }
  }
}

