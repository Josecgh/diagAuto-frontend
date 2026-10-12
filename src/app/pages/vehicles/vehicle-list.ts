import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
  protected readonly deletingId = signal<number | null>(null);
  protected readonly deleteError = signal('');
  protected readonly deleteSuccess = signal('');

  constructor() {
    this.loadVehicles();
  }

  protected loadVehicles(): void {
    if (this.deletingId() !== null) return;
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

  protected deleteVehicle(vehicle: Vehicle): void {
    if (this.deletingId() !== null || this.loading()) return;
    if (!window.confirm(`¿Quieres eliminar ${vehicle.brand} ${vehicle.model} (${vehicle.plate})? Esta acción no se puede deshacer.`)) return;

    this.deleteError.set('');
    this.deleteSuccess.set('');
    this.deletingId.set(vehicle.id);
    this.diagauto.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.vehicles.update((vehicles) => vehicles.filter((item) => item.id !== vehicle.id));
        this.deletingId.set(null);
        this.deleteSuccess.set(`El vehículo ${vehicle.plate} se ha eliminado.`);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.deleteError.set(error.status === 401 || error.status === 403
          ? 'No tienes acceso para eliminar este vehículo. Comprueba tu sesión.'
          : 'No se pudo eliminar el vehículo. Inténtalo de nuevo.');
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
