import { Routes } from '@angular/router';
import { Body } from './components/body/body';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { VehicleList } from './pages/vehicles/vehicle-list';
import { VehicleCreate } from './pages/vehicle-create/vehicle-create';
import { VehicleDetail } from './pages/vehicle-detail/vehicle-detail';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: Body, title: 'Inicio' },
  { path: 'vehicles/new', component: VehicleCreate, canActivate: [authGuard], title: 'Añadir vehículo | DiagAuto' },
  { path: 'vehicles/:id', component: VehicleDetail, canActivate: [authGuard], title: 'Estado del vehículo | DiagAuto' },
  { path: 'vehicles', component: VehicleList, canActivate: [authGuard], title: 'Mis vehículos | DiagAuto' },
  { path: 'login', component: Login, title: 'Iniciar sesión | DiagAuto' },
  { path: 'register', component: Register, title: 'Crear cuenta | DiagAuto' },
  { path: '**', redirectTo: 'home' }
];
