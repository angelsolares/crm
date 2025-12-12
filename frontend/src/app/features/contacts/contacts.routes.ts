import { Routes } from '@angular/router';

export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./contact-list/contact-list.component').then(m => m.ContactListComponent),
    title: 'Contacts | Entheo Nexus'
  },
  {
    path: 'new',
    loadComponent: () => import('./contact-form/contact-form.component').then(m => m.ContactFormComponent),
    title: 'New Contact | Entheo Nexus'
  },
  {
    path: ':id',
    loadComponent: () => import('./contact-detail/contact-detail.component').then(m => m.ContactDetailComponent),
    title: 'Contact | Entheo Nexus'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./contact-form/contact-form.component').then(m => m.ContactFormComponent),
    title: 'Edit Contact | Entheo Nexus'
  }
];

