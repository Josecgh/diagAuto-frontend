import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiagautoService, type Vehicle, type VehicleType } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-vehicle-list',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss'
})
export class VehicleList {
  private readonly diagauto = inject(DiagautoService);
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  constructor() {
    this.loadVehicles();
  }

  protected loadVehicles(): void {
    this.loading.set(true);
    this.error.set('');
    this.diagauto.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los vehículos. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  protected vehicleTypeLabel(type: VehicleType): string {
    const labels: Record<VehicleType, string> = {
      CAR: 'Coche',
      MOTORCYCLE: 'Motocicleta',
      TRUCK: 'Cami\u00f3n',
      VAN: 'Furgoneta',
      BICYCLE: 'Bicicleta',
      BUS: 'Autob\u00fas'
    };
    return labels[type];
  }
}
