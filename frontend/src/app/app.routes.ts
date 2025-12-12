import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | Entheo Nexus'
  },
  {
    path: 'organizations',
    loadChildren: () => import('./features/organizations/organizations.routes').then(m => m.ORGANIZATION_ROUTES),
    title: 'Organizations | Entheo Nexus'
  },
  {
    path: 'contacts',
    loadChildren: () => import('./features/contacts/contacts.routes').then(m => m.CONTACT_ROUTES),
    title: 'Contacts | Entheo Nexus'
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECT_ROUTES),
    title: 'Projects | Entheo Nexus'
  },
  {
    path: 'meetings',
    loadChildren: () => import('./features/meetings/meetings.routes').then(m => m.MEETING_ROUTES),
    title: 'Meetings | Entheo Nexus'
  },
  {
    path: 'proposals',
    loadChildren: () => import('./features/proposals/proposals.routes').then(m => m.PROPOSAL_ROUTES),
    title: 'Proposals | Entheo Nexus'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

