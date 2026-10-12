import { Routes } from '@angular/router';
import { Body } from './components/body/body';

export const routes: Routes = [
  { path: '', component: Body, title: 'Inicio' },
  { path: '**', redirectTo: '' }
];
