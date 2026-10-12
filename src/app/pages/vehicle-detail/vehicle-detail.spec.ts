import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { VehicleDetail } from './vehicle-detail';
import { api, http, httpProviders, vehicle } from '../../testing/test-helpers';

describe('VehicleDetail', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        ...httpProviders,
        provideRouter([{ path: 'vehicles/:id', component: VehicleDetail }]),
      ],
    }),
  );
  afterEach(() => http().verify());
  async function open() {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/vehicles/7', VehicleDetail);
    return harness;
  }
  it('consulta los datos del identificador de la ruta', async () => {
    const harness = await open();
    http().expectOne(`${api}/vehicles/7`).flush(vehicle);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      (harness.routeNativeElement!.querySelector('[name="brand"]') as HTMLInputElement).value,
    ).toBe('Toyota');
    expect(harness.routeNativeElement!.textContent).toContain('Con avería');
  });
  it('muestra un error si el vehículo no existe', async () => {
    const harness = await open();
    http().expectOne(`${api}/vehicles/7`).flush({}, { status: 404, statusText: 'Not found' });
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('No se encontró');
    expect(harness.routeNativeElement!.querySelector('form')).toBeNull();
  });
  it('guarda la avería resuelta sin conservar su descripción', async () => {
    const harness = await open();
    http().expectOne(`${api}/vehicles/7`).flush(vehicle);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const checkbox = harness.routeNativeElement!.querySelector(
      '[name="hasFault"]',
    ) as HTMLInputElement;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http().expectOne(`${api}/vehicles/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.hasFault).toBe(false);
    expect(request.request.body.faultDescription).toBeNull();
    request.flush({ ...vehicle, hasFault: false, faultDescription: null });
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.success')).toBeTruthy();
    expect(harness.routeNativeElement!.querySelector('.saved-status')!.textContent).toContain(
      'Sin averías',
    );
  });
});
