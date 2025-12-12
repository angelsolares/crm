import { Component, signal } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-midnight-50">
      <!-- Sidebar -->
      <app-sidebar 
        [isCollapsed]="sidebarCollapsed()" 
        (toggleCollapse)="toggleSidebar()"
      />
      
      <!-- Main content -->
      <div 
        class="transition-all duration-300"
        [class.ml-64]="!sidebarCollapsed()"
        [class.ml-20]="sidebarCollapsed()"
      >
        <!-- Header -->
        <app-header (toggleSidebar)="toggleSidebar()" />
        
        <!-- Page content -->
        <main class="p-6">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  styles: ``
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
  
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }
}

