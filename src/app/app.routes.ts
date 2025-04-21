import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { CameraComponent } from './views/camera/camera.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'camera', component: CameraComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'camera', pathMatch: 'full' },
  { path: '**', redirectTo: 'camera' }
];
