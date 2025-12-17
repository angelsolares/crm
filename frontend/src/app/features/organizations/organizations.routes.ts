import { Routes } from '@angular/router';
import { managerGuard } from '../../core/guards/role.guard';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./organization-list/organization-list.component').then(m => m.OrganizationListComponent),
    title: 'Organizations | Entheo Nexus'
  },
  {
    path: 'new',
    loadComponent: () => import('./organization-form/organization-form.component').then(m => m.OrganizationFormComponent),
    canActivate: [managerGuard], // Only admin and manager can create
    title: 'New Organization | Entheo Nexus'
  },
  {
    path: ':id',
    loadComponent: () => import('./organization-detail/organization-detail.component').then(m => m.OrganizationDetailComponent),
    title: 'Organization | Entheo Nexus'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./organization-form/organization-form.component').then(m => m.OrganizationFormComponent),
    canActivate: [managerGuard], // Only admin and manager can edit
    title: 'Edit Organization | Entheo Nexus'
  }
];
