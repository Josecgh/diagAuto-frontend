import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, type NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DiagautoService, type VehicleRequest } from '../../core/services/diagauto.service';

@Component({
  selector: 'app-vehicle-create',
  imports: [FormsModule, RouterLink],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss'
})
export class VehicleCreate {
  private readonly diagauto = inject(DiagautoService);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected vehicle: VehicleRequest = {
    vehicleType: 'CAR', brand: '', model: '', plate: '', kilometres: 0,
    hasFault: false, technicalInspectionDate: '', faultDescription: ''
  };

  protected submit(form: NgForm): void {
    if (form.invalid || this.submitting()) return;
    const request: VehicleRequest = {
      ...this.vehicle,
      brand: this.vehicle.brand.trim(),
      model: this.vehicle.model.trim(),
      plate: this.vehicle.plate.trim(),
      technicalInspectionDate: this.vehicle.technicalInspectionDate || null,
      faultDescription: this.vehicle.hasFault ? this.vehicle.faultDescription?.trim() || null : null
    };
    if (!request.brand || !request.model || !request.plate || !Number.isInteger(request.kilometres)) {
      this.error.set('Completa los datos y escribe los kilómetros como un número entero.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    this.diagauto.createVehicle(request).subscribe({
      next: () => { void this.router.navigateByUrl('/vehicles'); },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        if (error.status === 409) {
          void this.router.navigateByUrl('/premium');
          return;
        }
        this.error.set(error.status === 401 || error.status === 403
          ? 'Tu sesión ha caducado. Vuelve a iniciar sesión para guardar el vehículo.'
          : error.status === 0
            ? 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
            : 'No se pudo guardar el vehículo. Revisa los datos e inténtalo de nuevo.');
      }
    });
  }
}
