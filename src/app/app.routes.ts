import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { HomeComponent } from './views/home/home.component';
import { CameraComponent } from './views/camera/camera.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminComponent } from './views/admin/admin.component';
import { AdminCamerasComponent } from './views/admin/admin-cameras.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'camera', component: CameraComponent, canActivate: [AuthGuard] },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminComponent,
    children: [
      { path: '', component: AdminCamerasComponent },
    ]
  },
  { path: '**', redirectTo: '' },
];