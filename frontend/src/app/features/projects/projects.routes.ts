import { Routes } from '@angular/router';
import { managerGuard } from '../../core/guards/role.guard';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list/project-list.component').then(m => m.ProjectListComponent),
    title: 'Projects | Entheo Nexus'
  },
  {
    path: 'new',
    loadComponent: () => import('./project-form/project-form.component').then(m => m.ProjectFormComponent),
    canActivate: [managerGuard], // Only admin and manager can create projects
    title: 'New Project | Entheo Nexus'
  },
  {
    path: ':id',
    loadComponent: () => import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project | Entheo Nexus'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./project-form/project-form.component').then(m => m.ProjectFormComponent),
    title: 'Edit Project | Entheo Nexus'
  }
];
