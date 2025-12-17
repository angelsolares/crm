import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [adminGuard],
    title: 'User Management | Entheo Nexus'
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions/permission-config.component').then(m => m.PermissionConfigComponent),
    canActivate: [adminGuard],
    title: 'Permission Settings | Entheo Nexus'
  }
];
