import { Routes } from '@angular/router';

export const MEETING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./meeting-list/meeting-list.component').then(m => m.MeetingListComponent),
    title: 'Meetings | Entheo Nexus'
  },
  {
    path: 'new',
    loadComponent: () => import('./meeting-form/meeting-form.component').then(m => m.MeetingFormComponent),
    title: 'New Meeting | Entheo Nexus'
  },
  {
    path: ':id',
    loadComponent: () => import('./meeting-detail/meeting-detail.component').then(m => m.MeetingDetailComponent),
    title: 'Meeting | Entheo Nexus'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./meeting-form/meeting-form.component').then(m => m.MeetingFormComponent),
    title: 'Edit Meeting | Entheo Nexus'
  }
];

