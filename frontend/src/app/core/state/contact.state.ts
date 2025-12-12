import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, PaginatedResponse, ApiResponse } from '../services/api.service';
import { Contact, ContactFilters, CreateContactDto } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactState {
  private api = inject(ApiService);
  
  // Private writable signals
  private _contacts = signal<Contact[]>([]);
  private _selectedContact = signal<Contact | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  
  // Public read-only signals
  readonly contacts = this._contacts.asReadonly();
  readonly selectedContact = this._selectedContact.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  
  // Computed signals
  readonly hasContacts = computed(() => this._contacts().length > 0);
  readonly totalCount = computed(() => this._pagination().total);
  
  // Actions
  loadContacts(filters: ContactFilters = {}): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<PaginatedResponse<Contact>>('contacts', filters).subscribe({
      next: (response) => {
        this._contacts.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load contacts');
        this._isLoading.set(false);
      }
    });
  }
  
  loadContact(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.api.get<ApiResponse<Contact>>(`contacts/${id}`).subscribe({
      next: (response) => {
        this._selectedContact.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load contact');
        this._isLoading.set(false);
      }
    });
  }
  
  createContact(data: CreateContactDto): Promise<Contact> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.post<ApiResponse<Contact>>('contacts', data).subscribe({
        next: (response) => {
          this._contacts.update(contacts => [response.data, ...contacts]);
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create contact');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  updateContact(id: string, data: Partial<CreateContactDto>): Promise<Contact> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.put<ApiResponse<Contact>>(`contacts/${id}`, data).subscribe({
        next: (response) => {
          this._contacts.update(contacts => 
            contacts.map(c => c.id === id ? response.data : c)
          );
          if (this._selectedContact()?.id === id) {
            this._selectedContact.set(response.data);
          }
          this._isLoading.set(false);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update contact');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  deleteContact(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    return new Promise((resolve, reject) => {
      this.api.delete(`contacts/${id}`).subscribe({
        next: () => {
          this._contacts.update(contacts => contacts.filter(c => c.id !== id));
          if (this._selectedContact()?.id === id) {
            this._selectedContact.set(null);
          }
          this._isLoading.set(false);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete contact');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }
  
  clearSelected(): void {
    this._selectedContact.set(null);
  }
  
  clearError(): void {
    this._error.set(null);
  }
}

