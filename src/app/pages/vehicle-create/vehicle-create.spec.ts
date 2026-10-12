import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VehicleCreate } from './vehicle-create';
import { api, fill, http, setup, submit, vehicle } from '../../testing/test-helpers';

describe('VehicleCreate', () => {
  afterEach(() => http().verify());
  it('envía datos limpios y vuelve a la tabla al guardar', async () => {
    const fixture = setup(VehicleCreate);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await fill(fixture, {
      brand: ' Toyota ',
      model: ' Corolla ',
      plate: ' 1234 ABC ',
      kilometres: '12000',
    });
    submit(fixture);
    const request = http().expectOne(`${api}/vehicles`);
    expect(request.request.body).toMatchObject({
      brand: 'Toyota',
      model: 'Corolla',
      plate: '1234 ABC',
      hasFault: false,
      technicalInspectionDate: null,
      faultDescription: null,
    });
    request.flush(vehicle);
    expect(navigate).toHaveBeenCalledWith('/vehicles');
  });
  it('rechaza kilómetros negativos en el formulario', async () => {
    const fixture = setup(VehicleCreate);
    await fill(fixture, { brand: 'Toyota', model: 'Corolla', plate: '1234 ABC', kilometres: '-1' });
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });
  it('permite reintentar si el backend no guarda', async () => {
    const fixture = setup(VehicleCreate);
    await fill(fixture, { brand: 'Toyota', model: 'Corolla', plate: '1234 ABC' });
    submit(fixture);
    http().expectOne(`${api}/vehicles`).flush({}, { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
