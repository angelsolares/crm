import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardState } from './core/state/dashboard.state';
import { OrganizationState } from './core/state/organization.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `
    <app-layout>
      <router-outlet />
    </app-layout>
  `,
  styles: ``
})
export class App implements OnInit {
  private dashboardState = inject(DashboardState);
  private orgState = inject(OrganizationState);
  
  ngOnInit(): void {
    // Preload industries for forms
    this.orgState.loadIndustries();
  }
}

