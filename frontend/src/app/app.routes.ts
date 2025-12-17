import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  // Authentication routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Access Denied | Entheo Nexus'
  },
  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard | Entheo Nexus'
  },
  {
    path: 'organizations',
    loadChildren: () => import('./features/organizations/organizations.routes').then(m => m.ORGANIZATION_ROUTES),
    canActivate: [authGuard],
    title: 'Organizations | Entheo Nexus'
  },
  {
    path: 'contacts',
    loadChildren: () => import('./features/contacts/contacts.routes').then(m => m.CONTACT_ROUTES),
    canActivate: [authGuard],
    title: 'Contacts | Entheo Nexus'
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECT_ROUTES),
    canActivate: [authGuard],
    title: 'Projects | Entheo Nexus'
  },
  {
    path: 'meetings',
    loadChildren: () => import('./features/meetings/meetings.routes').then(m => m.MEETING_ROUTES),
    canActivate: [authGuard],
    title: 'Meetings | Entheo Nexus'
  },
  {
    path: 'proposals',
    loadChildren: () => import('./features/proposals/proposals.routes').then(m => m.PROPOSAL_ROUTES),
    canActivate: [authGuard],
    title: 'Proposals | Entheo Nexus'
  },
  // Admin routes (admin only)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard],
    title: 'Admin | Entheo Nexus'
  },
  // Wildcard route
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
