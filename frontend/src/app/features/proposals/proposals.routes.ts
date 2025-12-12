import { Routes } from '@angular/router';

export const PROPOSAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proposal-list/proposal-list.component').then(m => m.ProposalListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./proposal-form/proposal-form.component').then(m => m.ProposalFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./proposal-detail/proposal-detail.component').then(m => m.ProposalDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./proposal-form/proposal-form.component').then(m => m.ProposalFormComponent),
  },
];

