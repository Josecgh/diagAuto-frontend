import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, type NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DiagautoService, type VehicleRequest } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-vehicle-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail {
  private readonly diagauto = inject(DiagautoService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly loading = signal(true);
  protected readonly loaded = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly savedHasFault = signal(false);
  protected vehicle: VehicleRequest = {
    vehicleType: 'CAR',
    brand: '',
    model: '',
    plate: '',
    kilometres: 0,
    hasFault: false,
    technicalInspectionDate: '',
    faultDescription: '',
  };

  constructor() {
    this.loadVehicle();
  }

  protected loadVehicle(): void {
    this.error.set('');
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.loading.set(false);
      this.error.set('El identificador del vehículo no es válido.');
      return;
    }
    this.loading.set(true);
    this.diagauto.getVehicle(this.id).subscribe({
      next: (vehicle) => {
        this.vehicle = {
          vehicleType: vehicle.vehicleType,
          brand: vehicle.brand,
          model: vehicle.model,
          plate: vehicle.plate,
          kilometres: vehicle.kilometres,
          hasFault: vehicle.hasFault,
          technicalInspectionDate: vehicle.technicalInspectionDate || '',
          faultDescription: vehicle.faultDescription || '',
        };
        this.savedHasFault.set(vehicle.hasFault);
        this.loaded.set(true);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          error.status === 404
            ? 'No se encontró este vehículo.'
            : 'No se pudo consultar el vehículo. Comprueba tu sesión y vuelve a intentarlo.',
        );
      },
    });
  }

  protected submit(form: NgForm): void {
    if (form.invalid || this.submitting()) return;
    this.success.set('');
    this.error.set('');
    const request: VehicleRequest = {
      ...this.vehicle,
      brand: this.vehicle.brand.trim(),
      model: this.vehicle.model.trim(),
      plate: this.vehicle.plate.trim(),
      technicalInspectionDate: this.vehicle.technicalInspectionDate || null,
      faultDescription: this.vehicle.hasFault
        ? this.vehicle.faultDescription?.trim() || null
        : null,
    };
    if (
      !request.brand ||
      !request.model ||
      !request.plate ||
      !Number.isInteger(request.kilometres) ||
      request.kilometres < 0
    ) {
      this.error.set(
        'Completa los datos y escribe los kilómetros como un número entero positivo o cero.',
      );
      return;
    }
    this.submitting.set(true);
    this.diagauto.updateVehicle(this.id, request).subscribe({
      next: (vehicle) => {
        this.vehicle = { ...request, faultDescription: vehicle.faultDescription || '' };
        this.savedHasFault.set(vehicle.hasFault);
        this.submitting.set(false);
        this.success.set('Los datos y el estado del vehículo se han actualizado.');
        form.form.markAsPristine();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(
          error.status === 401 || error.status === 403
            ? 'No tienes acceso. Vuelve a iniciar sesión.'
            : 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
        );
      },
    });
  }
}
