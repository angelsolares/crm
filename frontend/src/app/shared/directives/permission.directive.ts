import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect, DestroyRef } from '@angular/core';
import { PermissionState, PermissionMatrix } from '../../core/state/permission.state';

type ModuleName = keyof PermissionMatrix;

/**
 * Structural directive to show/hide elements based on user permissions.
 * 
 * Usage:
 *   <button *hasPermission="'organizations.create'">Create Organization</button>
 *   <button *hasPermission="'projects.delete'">Delete Project</button>
 * 
 * The permission string format is: "module.action"
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionState = inject(PermissionState);
  private destroyRef = inject(DestroyRef);
  
  private permission: string = '';
  private isVisible = false;

  @Input() set hasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  constructor() {
    // React to permission changes
    const effectRef = effect(() => {
      // Trigger re-evaluation when permissions load/change
      this.permissionState.permissions();
      this.updateView();
    });
    
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }

  private updateView(): void {
    const hasAccess = this.checkPermission();
    
    if (hasAccess && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasAccess && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }

  private checkPermission(): boolean {
    if (!this.permission) return true;
    
    const [module, action] = this.permission.split('.') as [ModuleName, string];
    if (!module || !action) return true;
    
    return this.permissionState.can(module, action as never);
  }
}

/**
 * Directive to check if user has any of the specified roles.
 * 
 * Usage:
 *   <button *hasRole="'admin'">Admin Only</button>
 *   <button *hasRole="['admin', 'manager']">Admin or Manager</button>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionState = inject(PermissionState);
  private destroyRef = inject(DestroyRef);
  
  private roles: string[] = [];
  private isVisible = false;

  @Input() set hasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  constructor() {
    const effectRef = effect(() => {
      this.permissionState.role();
      this.updateView();
    });
    
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }

  private updateView(): void {
    const hasRole = this.checkRole();
    
    if (hasRole && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasRole && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }

  private checkRole(): boolean {
    if (this.roles.length === 0) return true;
    
    const userRole = this.permissionState.role();
    return userRole ? this.roles.includes(userRole) : false;
  }
}

/**
 * Directive to check if user is admin or manager.
 * 
 * Usage:
 *   <button *isAdminOrManager>Manager Action</button>
 */
@Directive({
  selector: '[isAdminOrManager]',
  standalone: true
})
export class IsAdminOrManagerDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionState = inject(PermissionState);
  private destroyRef = inject(DestroyRef);
  
  private isVisible = false;

  constructor() {
    const effectRef = effect(() => {
      const isAdminOrManager = this.permissionState.isAdminOrManager();
      
      if (isAdminOrManager && !this.isVisible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isVisible = true;
      } else if (!isAdminOrManager && this.isVisible) {
        this.viewContainer.clear();
        this.isVisible = false;
      }
    });
    
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }
}

/**
 * Directive to check if user is admin only.
 * 
 * Usage:
 *   <button *isAdmin>Admin Only</button>
 */
@Directive({
  selector: '[isAdmin]',
  standalone: true
})
export class IsAdminDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionState = inject(PermissionState);
  private destroyRef = inject(DestroyRef);
  
  private isVisible = false;

  constructor() {
    const effectRef = effect(() => {
      const isAdmin = this.permissionState.isAdmin();
      
      if (isAdmin && !this.isVisible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isVisible = true;
      } else if (!isAdmin && this.isVisible) {
        this.viewContainer.clear();
        this.isVisible = false;
      }
    });
    
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }
}

