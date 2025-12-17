import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Permission matrix type definition.
 * Maps module -> action -> boolean (can/cannot)
 */
export interface PermissionMatrix {
  organizations: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  contacts: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  projects: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    update_stage: boolean;
    update_interest: boolean;
  };
  meetings: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    complete: boolean;
    reschedule: boolean;
  };
  proposals: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    send: boolean;
    duplicate: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  dashboard: {
    view: boolean;
    view_all_stats: boolean;
  };
  reports: {
    view: boolean;
    export: boolean;
  };
}

type ModuleName = keyof PermissionMatrix;
type ActionName<M extends ModuleName> = keyof PermissionMatrix[M];

// Use base API URL (not /dev) for permissions
const API_URL = environment.apiUrl.replace('/api/dev', '/api');

/**
 * Signal-based state service for managing user permissions.
 * 
 * Follows the Signal-based State Management pattern from README.md
 */
@Injectable({ providedIn: 'root' })
export class PermissionState {
  private http = inject(HttpClient);

  // State signals
  private _permissions = signal<PermissionMatrix | null>(null);
  private _role = signal<string | null>(null);
  private _isLoaded = signal(false);
  private _isLoading = signal(false);

  // Public read-only signals
  readonly permissions = this._permissions.asReadonly();
  readonly role = this._role.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed signals for common checks
  readonly isAdmin = computed(() => this._role() === 'admin');
  readonly isManager = computed(() => this._role() === 'manager');
  readonly isSalesRep = computed(() => this._role() === 'sales_rep');
  readonly isAdminOrManager = computed(() => this.isAdmin() || this.isManager());

  /**
   * Load permissions from the API.
   */
  loadPermissions(): void {
    if (this._isLoading()) return;
    
    this._isLoading.set(true);

    this.http.get<{ data: { role: string; permissions: PermissionMatrix } }>(`${API_URL}/permissions`).subscribe({
      next: (response) => {
        this._role.set(response.data.role);
        this._permissions.set(response.data.permissions);
        this._isLoaded.set(true);
        this._isLoading.set(false);
      },
      error: () => {
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Check if user can perform an action on a module.
   */
  can<M extends ModuleName>(module: M, action: ActionName<M>): boolean {
    const perms = this._permissions();
    if (!perms) return false;
    
    const modulePerms = perms[module];
    if (!modulePerms) return false;
    
    return (modulePerms as Record<string, boolean>)[action as string] ?? false;
  }

  /**
   * Check if user cannot perform an action on a module.
   */
  cannot<M extends ModuleName>(module: M, action: ActionName<M>): boolean {
    return !this.can(module, action);
  }

  /**
   * Create a computed signal for a specific permission.
   * Useful for template bindings.
   */
  canSignal<M extends ModuleName>(module: M, action: ActionName<M>) {
    return computed(() => this.can(module, action));
  }

  // Convenience methods for common permission checks
  
  // Organizations
  readonly canViewOrganizations = computed(() => this.can('organizations', 'view'));
  readonly canCreateOrganizations = computed(() => this.can('organizations', 'create'));
  readonly canUpdateOrganizations = computed(() => this.can('organizations', 'update'));
  readonly canDeleteOrganizations = computed(() => this.can('organizations', 'delete'));

  // Contacts
  readonly canViewContacts = computed(() => this.can('contacts', 'view'));
  readonly canCreateContacts = computed(() => this.can('contacts', 'create'));
  readonly canUpdateContacts = computed(() => this.can('contacts', 'update'));
  readonly canDeleteContacts = computed(() => this.can('contacts', 'delete'));

  // Projects
  readonly canViewProjects = computed(() => this.can('projects', 'view'));
  readonly canCreateProjects = computed(() => this.can('projects', 'create'));
  readonly canUpdateProjects = computed(() => this.can('projects', 'update'));
  readonly canDeleteProjects = computed(() => this.can('projects', 'delete'));

  // Meetings
  readonly canViewMeetings = computed(() => this.can('meetings', 'view'));
  readonly canCreateMeetings = computed(() => this.can('meetings', 'create'));
  readonly canUpdateMeetings = computed(() => this.can('meetings', 'update'));
  readonly canDeleteMeetings = computed(() => this.can('meetings', 'delete'));

  // Proposals
  readonly canViewProposals = computed(() => this.can('proposals', 'view'));
  readonly canCreateProposals = computed(() => this.can('proposals', 'create'));
  readonly canUpdateProposals = computed(() => this.can('proposals', 'update'));
  readonly canDeleteProposals = computed(() => this.can('proposals', 'delete'));
  readonly canSendProposals = computed(() => this.can('proposals', 'send'));

  // Users
  readonly canManageUsers = computed(() => this.can('users', 'view'));

  /**
   * Clear permissions (on logout).
   */
  clear(): void {
    this._permissions.set(null);
    this._role.set(null);
    this._isLoaded.set(false);
  }
}

