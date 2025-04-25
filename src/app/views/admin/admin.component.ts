import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCamerasComponent } from './admin-cameras.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  imports: [CommonModule, AdminCamerasComponent]
})
export class AdminComponent {
  selectedTab = 'cameras';
}
