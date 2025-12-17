import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserState } from '../../../../core/state/user.state';
import { User, UserRole, ROLE_OPTIONS, getRoleLabel, getRoleColor } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">User Management</h1>
          <p class="text-midnight-500 mt-1">Manage system users and their roles</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
                placeholder="Search users..."
                class="input pl-10 w-full"
              />
            </div>
          </div>
          <!-- Role Filter -->
          <div class="w-full sm:w-48">
            <select 
              [(ngModel)]="roleFilter"
              (ngModelChange)="onRoleFilter()"
              class="input w-full"
            >
              <option value="">All Roles</option>
              @for (role of roleOptions; track role.value) {
                <option [value]="role.value">{{ role.label }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card overflow-hidden">
        @if (userState.isLoading()) {
          <div class="p-8 text-center">
            <div class="animate-spin w-8 h-8 border-2 border-nexus-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-midnight-500 mt-2">Loading users...</p>
          </div>
        } @else if (userState.users().length === 0) {
          <div class="p-8 text-center">
            <svg class="w-12 h-12 text-midnight-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="text-midnight-500 mt-2">No users found</p>
          </div>
        } @else {
          <table class="w-full">
            <thead class="bg-midnight-50 border-b border-midnight-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-midnight-600 uppercase tracking-wider">User</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-midnight-600 uppercase tracking-wider">Role</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-midnight-600 uppercase tracking-wider">Created</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-midnight-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-midnight-100">
              @for (user of userState.users(); track user.id) {
                <tr class="hover:bg-midnight-50 transition-colors">
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="avatar avatar-md bg-nexus-100 text-nexus-700 font-semibold">
                        {{ getInitials(user.name) }}
                      </div>
                      <div>
                        <div class="font-medium text-midnight-900">{{ user.name }}</div>
                        <div class="text-sm text-midnight-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span [class]="'px-2.5 py-1 rounded-full text-xs font-medium ' + getRoleColor(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm text-midnight-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        (click)="openRoleModal(user)"
                        class="btn-ghost btn-icon text-midnight-500 hover:text-nexus-600"
                        title="Change Role"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button 
                        (click)="openEditModal(user)"
                        class="btn-ghost btn-icon text-midnight-500 hover:text-blue-600"
                        title="Edit User"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        (click)="confirmDelete(user)"
                        class="btn-ghost btn-icon text-midnight-500 hover:text-red-600"
                        title="Delete User"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (userState.pagination().lastPage > 1) {
            <div class="px-4 py-3 border-t border-midnight-100 flex items-center justify-between">
              <p class="text-sm text-midnight-500">
                Showing {{ (userState.pagination().currentPage - 1) * userState.pagination().perPage + 1 }} 
                to {{ Math.min(userState.pagination().currentPage * userState.pagination().perPage, userState.pagination().total) }} 
                of {{ userState.pagination().total }} users
              </p>
              <div class="flex gap-2">
                <button 
                  (click)="goToPage(userState.pagination().currentPage - 1)"
                  [disabled]="userState.pagination().currentPage === 1"
                  class="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <button 
                  (click)="goToPage(userState.pagination().currentPage + 1)"
                  [disabled]="userState.pagination().currentPage === userState.pagination().lastPage"
                  class="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Role Change Modal -->
      @if (showRoleModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div class="p-6 border-b border-midnight-100">
              <h2 class="text-xl font-semibold text-midnight-900">Change User Role</h2>
              <p class="text-midnight-500 mt-1">Update role for {{ selectedUser()?.name }}</p>
            </div>
            <div class="p-6">
              <label class="block text-sm font-medium text-midnight-700 mb-2">Select Role</label>
              <select [(ngModel)]="newRole" class="input w-full">
                @for (role of roleOptions; track role.value) {
                  <option [value]="role.value">{{ role.label }}</option>
                }
              </select>
            </div>
            <div class="p-6 border-t border-midnight-100 flex justify-end gap-3">
              <button (click)="closeModals()" class="btn btn-outline">Cancel</button>
              <button (click)="saveRole()" class="btn btn-primary" [disabled]="userState.isLoading()">
                @if (userState.isLoading()) {
                  <span class="animate-spin mr-2">⏳</span>
                }
                Save Role
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create/Edit User Modal -->
      @if (showUserModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div class="p-6 border-b border-midnight-100">
              <h2 class="text-xl font-semibold text-midnight-900">
                {{ isEditing() ? 'Edit User' : 'Create User' }}
              </h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-midnight-700 mb-2">Name</label>
                <input type="text" [(ngModel)]="formData.name" class="input w-full" placeholder="Full name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-midnight-700 mb-2">Email</label>
                <input type="email" [(ngModel)]="formData.email" class="input w-full" placeholder="email@example.com" />
              </div>
              <div>
                <label class="block text-sm font-medium text-midnight-700 mb-2">
                  Password {{ isEditing() ? '(leave blank to keep current)' : '' }}
                </label>
                <input type="password" [(ngModel)]="formData.password" class="input w-full" placeholder="••••••••" />
              </div>
              <div>
                <label class="block text-sm font-medium text-midnight-700 mb-2">Role</label>
                <select [(ngModel)]="formData.role" class="input w-full">
                  @for (role of roleOptions; track role.value) {
                    <option [value]="role.value">{{ role.label }}</option>
                  }
                </select>
              </div>
              @if (userState.error()) {
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {{ userState.error() }}
                </div>
              }
            </div>
            <div class="p-6 border-t border-midnight-100 flex justify-end gap-3">
              <button (click)="closeModals()" class="btn btn-outline">Cancel</button>
              <button (click)="saveUser()" class="btn btn-primary" [disabled]="userState.isLoading()">
                @if (userState.isLoading()) {
                  <span class="animate-spin mr-2">⏳</span>
                }
                {{ isEditing() ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div class="p-6">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-midnight-900 text-center">Delete User</h2>
              <p class="text-midnight-500 text-center mt-2">
                Are you sure you want to delete <strong>{{ selectedUser()?.name }}</strong>? This action cannot be undone.
              </p>
            </div>
            <div class="p-6 border-t border-midnight-100 flex justify-end gap-3">
              <button (click)="closeModals()" class="btn btn-outline">Cancel</button>
              <button (click)="deleteUser()" class="btn bg-red-600 text-white hover:bg-red-700" [disabled]="userState.isLoading()">
                @if (userState.isLoading()) {
                  <span class="animate-spin mr-2">⏳</span>
                }
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  userState = inject(UserState);
  Math = Math;

  roleOptions = ROLE_OPTIONS;
  getRoleLabel = getRoleLabel;
  getRoleColor = getRoleColor;

  searchQuery = '';
  roleFilter: UserRole | '' = '';
  
  showRoleModal = signal(false);
  showUserModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  selectedUser = signal<User | null>(null);
  newRole: UserRole = 'sales_rep';

  formData = {
    name: '',
    email: '',
    password: '',
    role: 'sales_rep' as UserRole
  };

  private searchTimeout: any;

  ngOnInit(): void {
    this.userState.loadUsers();
    this.userState.loadRoles();
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.userState.setFilters({ search: this.searchQuery });
    }, 300);
  }

  onRoleFilter(): void {
    this.userState.setFilters({ role: this.roleFilter });
  }

  goToPage(page: number): void {
    this.userState.loadUsers(page);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openRoleModal(user: User): void {
    this.selectedUser.set(user);
    this.newRole = user.role;
    this.showRoleModal.set(true);
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formData = { name: '', email: '', password: '', role: 'sales_rep' };
    this.userState.clearError();
    this.showUserModal.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.selectedUser.set(user);
    this.formData = { 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role 
    };
    this.userState.clearError();
    this.showUserModal.set(true);
  }

  confirmDelete(user: User): void {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeModals(): void {
    this.showRoleModal.set(false);
    this.showUserModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
    this.userState.clearError();
  }

  async saveRole(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    try {
      await this.userState.updateUserRole(user.id, this.newRole);
      this.closeModals();
    } catch (e) {
      // Error is handled in state
    }
  }

  async saveUser(): Promise<void> {
    try {
      if (this.isEditing()) {
        const user = this.selectedUser();
        if (!user) return;
        
        const updateData: any = {
          name: this.formData.name,
          email: this.formData.email,
          role: this.formData.role
        };
        if (this.formData.password) {
          updateData.password = this.formData.password;
        }
        
        await this.userState.updateUser(user.id, updateData);
      } else {
        await this.userState.createUser({
          name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password,
          role: this.formData.role
        });
      }
      this.closeModals();
    } catch (e) {
      // Error is handled in state
    }
  }

  async deleteUser(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    try {
      await this.userState.deleteUser(user.id);
      this.closeModals();
    } catch (e) {
      // Error is handled in state
    }
  }
}

