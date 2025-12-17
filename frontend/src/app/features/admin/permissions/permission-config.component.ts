import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LowerCasePipe } from '@angular/common';
import { RolePermissionState } from '../../../core/state/role-permission.state';

@Component({
  selector: 'app-permission-config',
  standalone: true,
  imports: [FormsModule, LowerCasePipe],
  template: `
    <div class="page-enter space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-midnight-900">Permission Settings</h1>
          <p class="text-midnight-500 mt-1">Configure what each role can see and do in the system.</p>
        </div>
        <div class="flex items-center gap-2">
          @if (permState.isSaving()) {
            <span class="text-sm text-midnight-500 flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          }
          <button 
            (click)="confirmReset()"
            class="btn-ghost text-amber-600 hover:bg-amber-50"
            [disabled]="permState.isSaving()"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Defaults
          </button>
        </div>
      </div>

      @if (permState.error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ permState.error() }}
        </div>
      }

      <!-- Role Tabs -->
      <div class="card">
        <div class="border-b border-midnight-100">
          <nav class="flex gap-1 p-2">
            @for (role of permState.roleList(); track role.key) {
              <button
                (click)="selectedRole.set(role.key)"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                [class.bg-nexus-100]="selectedRole() === role.key"
                [class.text-nexus-700]="selectedRole() === role.key"
                [class.text-midnight-600]="selectedRole() !== role.key"
                [class.hover:bg-midnight-50]="selectedRole() !== role.key"
              >
                {{ role.label }}
              </button>
            }
          </nav>
        </div>

        @if (permState.isLoading()) {
          <div class="p-6 space-y-4">
            @for (_ of [1,2,3,4]; track $index) {
              <div class="skeleton h-20 rounded-xl"></div>
            }
          </div>
        } @else {
          <div class="p-6 space-y-6">
            <!-- Permission Matrix -->
            @for (module of permState.moduleList(); track module.key) {
              <div class="border border-midnight-100 rounded-xl overflow-hidden">
                <div class="bg-midnight-50 px-4 py-3 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-nexus-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-nexus-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-midnight-900">{{ module.label }}</h3>
                    <p class="text-xs text-midnight-500">Configure access for {{ module.label | lowercase }} module</p>
                  </div>
                  
                  <!-- Quick toggle all -->
                  <div class="ml-auto flex items-center gap-2">
                    <button
                      (click)="toggleAllForModule(module.key, true)"
                      class="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                      [disabled]="permState.isSaving()"
                    >
                      Allow All
                    </button>
                    <button
                      (click)="toggleAllForModule(module.key, false)"
                      class="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      [disabled]="permState.isSaving() || isProtectedModule(module.key)"
                    >
                      Deny All
                    </button>
                  </div>
                </div>
                
                <div class="p-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    @for (action of permState.getActionsForModule(module.key); track action.key) {
                      <label 
                        class="flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer"
                        [class.border-nexus-200]="hasPermission(module.key, action.key)"
                        [class.bg-nexus-50]="hasPermission(module.key, action.key)"
                        [class.border-midnight-100]="!hasPermission(module.key, action.key)"
                        [class.hover:border-nexus-200]="!hasPermission(module.key, action.key)"
                        [class.opacity-50]="isProtectedPermission(module.key, action.key)"
                      >
                        <input
                          type="checkbox"
                          [checked]="hasPermission(module.key, action.key)"
                          (change)="togglePermission(module.key, action.key, $event)"
                          [disabled]="permState.isSaving() || isProtectedPermission(module.key, action.key)"
                          class="w-4 h-4 rounded border-midnight-300 text-nexus-600 focus:ring-nexus-500"
                        />
                        <span class="text-sm" [class.text-midnight-900]="hasPermission(module.key, action.key)" [class.text-midnight-500]="!hasPermission(module.key, action.key)">
                          {{ action.label }}
                        </span>
                      </label>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Legend -->
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-midnight-900 mb-3">Permission Legend</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-nexus-500"></span>
            <span class="text-midnight-600">Allowed</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-midnight-200"></span>
            <span class="text-midnight-600">Denied</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-400"></span>
            <span class="text-midnight-600">Protected (cannot change)</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-midnight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-midnight-600">"View" controls menu visibility</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class PermissionConfigComponent implements OnInit {
  permState = inject(RolePermissionState);
  
  selectedRole = signal<string>('admin');

  ngOnInit(): void {
    this.permState.loadConfig();
  }

  hasPermission(module: string, action: string): boolean {
    return this.permState.hasPermission(this.selectedRole(), module, action);
  }

  togglePermission(module: string, action: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.permState.updatePermission(this.selectedRole(), module, action, checkbox.checked);
  }

  toggleAllForModule(module: string, allowed: boolean): void {
    const role = this.selectedRole();
    const actions = this.permState.getActionsForModule(module);
    
    // Don't allow denying all for admin's users module
    if (!allowed && role === 'admin' && module === 'users') {
      return;
    }

    const permissions: Record<string, Record<string, boolean>> = {
      [module]: {}
    };

    for (const action of actions) {
      // Skip protected permissions
      if (!this.isProtectedPermission(module, action.key)) {
        permissions[module][action.key] = allowed;
      }
    }

    this.permState.updateRolePermissions(role, permissions);
  }

  isProtectedPermission(module: string, action: string): boolean {
    // Admin must always have users.view permission
    return this.selectedRole() === 'admin' && module === 'users' && action === 'view';
  }

  isProtectedModule(module: string): boolean {
    return this.selectedRole() === 'admin' && module === 'users';
  }

  confirmReset(): void {
    if (confirm('Are you sure you want to reset all permissions to their default values? This cannot be undone.')) {
      this.permState.resetToDefaults();
    }
  }
}

