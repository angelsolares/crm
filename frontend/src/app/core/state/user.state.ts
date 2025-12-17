import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, UserCreateData, UserUpdateData, UserRole, RoleOption } from '../models/user.model';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Use base API URL (not /dev) for admin routes
const API_URL = environment.apiUrl.replace('/api/dev', '/api');

@Injectable({ providedIn: 'root' })
export class UserState {
  private http = inject(HttpClient);

  // State signals
  private _users = signal<User[]>([]);
  private _selectedUser = signal<User | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });
  private _filters = signal({
    search: '',
    role: '' as UserRole | ''
  });
  private _roles = signal<RoleOption[]>([]);

  // Public read-only signals
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly roles = this._roles.asReadonly();

  // Computed
  readonly hasUsers = computed(() => this._users().length > 0);
  readonly totalUsers = computed(() => this._pagination().total);

  /**
   * Load users with filters and pagination
   */
  loadUsers(page: number = 1): void {
    this._isLoading.set(true);
    this._error.set(null);

    const filters = this._filters();
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: '15'
    };

    if (filters.search) params['search'] = filters.search;
    if (filters.role) params['role'] = filters.role;

    const queryString = new URLSearchParams(params).toString();

    this.http.get<PaginatedResponse<User>>(`${API_URL}/users?${queryString}`).subscribe({
      next: (response) => {
        this._users.set(response.data);
        this._pagination.set({
          currentPage: response.meta.current_page,
          lastPage: response.meta.last_page,
          perPage: response.meta.per_page,
          total: response.meta.total
        });
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to load users');
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Load available roles
   */
  loadRoles(): void {
    this.http.get<{ data: RoleOption[] }>(`${API_URL}/users/roles`).subscribe({
      next: (response) => {
        this._roles.set(response.data);
      }
    });
  }

  /**
   * Get single user
   */
  loadUser(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<{ data: User }>(`${API_URL}/users/${id}`).subscribe({
      next: (response) => {
        this._selectedUser.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to load user');
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Create new user
   */
  createUser(data: UserCreateData): Promise<User> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.http.post<{ data: User }>(`${API_URL}/users`, data).subscribe({
        next: (response) => {
          this._isLoading.set(false);
          this.loadUsers(this._pagination().currentPage);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to create user');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }

  /**
   * Update user
   */
  updateUser(id: string, data: UserUpdateData): Promise<User> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.http.put<{ data: User }>(`${API_URL}/users/${id}`, data).subscribe({
        next: (response) => {
          this._isLoading.set(false);
          this.loadUsers(this._pagination().currentPage);
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update user');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }

  /**
   * Update user role only
   */
  updateUserRole(id: string, role: UserRole): Promise<User> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.http.patch<{ data: User }>(`${API_URL}/users/${id}/role`, { role }).subscribe({
        next: (response) => {
          this._isLoading.set(false);
          // Update user in list
          this._users.update(users => 
            users.map(u => u.id === id ? { ...u, role } : u)
          );
          resolve(response.data);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to update role');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Promise((resolve, reject) => {
      this.http.delete(`${API_URL}/users/${id}`).subscribe({
        next: () => {
          this._isLoading.set(false);
          this.loadUsers(this._pagination().currentPage);
          resolve();
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Failed to delete user');
          this._isLoading.set(false);
          reject(err);
        }
      });
    });
  }

  /**
   * Update filters
   */
  setFilters(filters: Partial<{ search: string; role: UserRole | '' }>): void {
    this._filters.update(f => ({ ...f, ...filters }));
    this.loadUsers(1);
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this._filters.set({ search: '', role: '' });
    this.loadUsers(1);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Clear selected user
   */
  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }
}

