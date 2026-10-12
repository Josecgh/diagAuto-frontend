import { VehicleList } from './vehicle-list';
import { api, http, setup, vehicle } from '../../testing/test-helpers';

describe('VehicleList', () => {
  afterEach(() => {
    http().verify();
    vi.restoreAllMocks();
  });
  it('muestra datos y el enlace de detalle del vehículo', () => {
    const fixture = setup(VehicleList);
    http().expectOne(`${api}/vehicles`).flush([vehicle]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Toyota Corolla');
    expect(fixture.nativeElement.querySelector('.detail-link').getAttribute('href')).toBe(
      '/vehicles/7',
    );
  });
  it('muestra el estado vacío cuando no hay vehículos', () => {
    const fixture = setup(VehicleList);
    http().expectOne(`${api}/vehicles`).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });
  it('no borra si el usuario cancela la confirmación', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = setup(VehicleList);
    http().expectOne(`${api}/vehicles`).flush([vehicle]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();
    http().expectNone(`${api}/vehicles/7`);
  });
  it('mantiene la fila hasta que el backend confirma el borrado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = setup(VehicleList);
    http().expectOne(`${api}/vehicles`).flush([vehicle]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody tr')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.delete-button').disabled).toBe(true);
    http().expectOne(`${api}/vehicles/7`).flush(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody tr')).toBeNull();
    expect(fixture.nativeElement.querySelector('.delete-success')).toBeTruthy();
  });
  it('conserva el vehículo cuando falla el borrado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = setup(VehicleList);
    http().expectOne(`${api}/vehicles`).flush([vehicle]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-button').click();
    http().expectOne(`${api}/vehicles/7`).flush({}, { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody tr')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.delete-error')).toBeTruthy();
  });
});
