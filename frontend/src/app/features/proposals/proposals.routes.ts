import { Routes } from '@angular/router';
import { managerGuard } from '../../core/guards/role.guard';

export const PROPOSAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proposal-list/proposal-list.component').then(m => m.ProposalListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./proposal-form/proposal-form.component').then(m => m.ProposalFormComponent),
    canActivate: [managerGuard], // Only admin and manager can create proposals
  },
  {
    path: ':id',
    loadComponent: () => import('./proposal-detail/proposal-detail.component').then(m => m.ProposalDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./proposal-form/proposal-form.component').then(m => m.ProposalFormComponent),
    canActivate: [managerGuard], // Only admin and manager can edit proposals
  },
];
