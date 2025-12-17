import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Use base API URL (not /dev) for role permissions
const API_URL = environment.apiUrl.replace('/api/dev', '/api');

export interface RolePermissionConfig {
  roles: Record<string, string>; // { admin: 'Administrator', ... }
  modules: Record<string, string>; // { organizations: 'Organizations', ... }
  moduleActions: Record<string, Record<string, string>>; // { organizations: { view: 'View', ... } }
  permissions: Record<string, Record<string, Record<string, boolean>>>; // { admin: { organizations: { view: true } } }
}

/**
 * Signal-based state service for managing role permissions configuration.
 */
@Injectable({ providedIn: 'root' })
export class RolePermissionState {
  private http = inject(HttpClient);

  // State signals
  private _config = signal<RolePermissionConfig | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _isSaving = signal(false);

  // Public read-only signals
  readonly config = this._config.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();

  // Computed signals
  readonly roles = computed(() => this._config()?.roles ?? {});
  readonly modules = computed(() => this._config()?.modules ?? {});
  readonly moduleActions = computed(() => this._config()?.moduleActions ?? {});
  readonly permissions = computed(() => this._config()?.permissions ?? {});

  readonly roleList = computed(() => {
    const roles = this.roles();
    return Object.entries(roles).map(([key, label]) => ({ key, label }));
  });

  readonly moduleList = computed(() => {
    const modules = this.modules();
    return Object.entries(modules).map(([key, label]) => ({ key, label }));
  });

  /**
   * Load all permissions configuration.
   */
  loadConfig(): void {
    if (this._isLoading()) return;
    
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<{ data: RolePermissionConfig }>(`${API_URL}/role-permissions`).subscribe({
      next: (response) => {
        this._config.set(response.data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to load permissions');
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Get actions for a specific module.
   */
  getActionsForModule(module: string): { key: string; label: string }[] {
    const moduleActions = this.moduleActions();
    const actions = moduleActions[module] ?? {};
    return Object.entries(actions).map(([key, label]) => ({ key, label }));
  }

  /**
   * Check if a role has permission for a module action.
   */
  hasPermission(role: string, module: string, action: string): boolean {
    const permissions = this.permissions();
    return permissions[role]?.[module]?.[action] ?? false;
  }

  /**
   * Update a single permission.
   */
  updatePermission(role: string, module: string, action: string, allowed: boolean): void {
    this._isSaving.set(true);
    this._error.set(null);

    this.http.patch<{ data: any }>(`${API_URL}/role-permissions/single`, {
      role,
      module,
      action,
      allowed
    }).subscribe({
      next: () => {
        // Update local state
        const config = this._config();
        if (config) {
          const newConfig = { ...config };
          if (!newConfig.permissions[role]) newConfig.permissions[role] = {};
          if (!newConfig.permissions[role][module]) newConfig.permissions[role][module] = {};
          newConfig.permissions[role][module][action] = allowed;
          this._config.set(newConfig);
        }
        this._isSaving.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to update permission');
        this._isSaving.set(false);
      }
    });
  }

  /**
   * Update all permissions for a role.
   */
  updateRolePermissions(role: string, permissions: Record<string, Record<string, boolean>>): void {
    this._isSaving.set(true);
    this._error.set(null);

    this.http.put<{ data: any }>(`${API_URL}/role-permissions/${role}`, {
      permissions
    }).subscribe({
      next: (response) => {
        // Update local state
        const config = this._config();
        if (config) {
          const newConfig = { ...config };
          newConfig.permissions[role] = response.data.permissions;
          this._config.set(newConfig);
        }
        this._isSaving.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to update permissions');
        this._isSaving.set(false);
      }
    });
  }

  /**
   * Reset all permissions to defaults.
   */
  resetToDefaults(): void {
    this._isSaving.set(true);
    this._error.set(null);

    this.http.post<{ data: RolePermissionConfig }>(`${API_URL}/role-permissions/reset`, {}).subscribe({
      next: (response) => {
        this._config.set(response.data);
        this._isSaving.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Failed to reset permissions');
        this._isSaving.set(false);
      }
    });
  }
}

