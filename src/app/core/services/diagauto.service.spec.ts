import { TestBed } from '@angular/core/testing';
import { DiagautoService } from './diagauto.service';
import { api, user, vehicle, http, httpProviders } from '../../testing/test-helpers';

describe('DiagautoService', () => {
  let service: DiagautoService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: httpProviders });
    service = TestBed.inject(DiagautoService);
  });
  afterEach(() => http().verify());

  it('autentica enviando credenciales y guarda el usuario de la sesión', () => {
    service.login({ email: user.email, password: 'password123' }).subscribe();
    const request = http().expectOne(`${api}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({ email: user.email, password: 'password123' });
    request.flush(user);
    expect(service.currentUser()).toEqual(user);
    expect(service.sessionReady()).toBe(true);
  });
  it('no autentica tras un login rechazado', () => {
    service.login({ email: user.email, password: 'incorrecta' }).subscribe({ error: () => {} });
    http().expectOne(`${api}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.currentUser()).toBeNull();
  });
  it('recupera la sesión desde el backend', () => {
    service.restoreSession();
    const request = http().expectOne(`${api}/auth/me`);
    expect(request.request.withCredentials).toBe(true);
    request.flush(user);
    expect(service.currentUser()).toEqual(user);
  });
  it('marca como anónima una sesión inexistente', () => {
    service.restoreSession();
    http().expectOne(`${api}/auth/me`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(service.currentUser()).toBeNull();
    expect(service.sessionReady()).toBe(true);
  });
  it('comprueba la sesión y reutiliza el resultado', () => {
    const result = vi.fn();
    service.checkSession().subscribe(result);
    http().expectOne(`${api}/auth/me`).flush(user);
    expect(result).toHaveBeenCalledWith(true);
    service.checkSession().subscribe(result);
    http().expectNone(`${api}/auth/me`);
  });
  it('devuelve false si la comprobación de sesión es rechazada', () => {
    const result = vi.fn();
    service.checkSession().subscribe(result);
    http().expectOne(`${api}/auth/me`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(result).toHaveBeenCalledWith(false);
  });
  it('cierra la sesión y elimina el usuario local', () => {
    service.restoreSession();
    http().expectOne(`${api}/auth/me`).flush(user);
    service.logout().subscribe();
    const request = http().expectOne(`${api}/auth/logout`);
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);
    expect(service.currentUser()).toBeNull();
  });
  it('registra un usuario con los datos del formulario', () => {
    const registration = {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      password: 'password123',
    };
    service.registerUser(registration).subscribe();
    const request = http().expectOne(`${api}/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registration);
    request.flush(user);
  });
  it('consulta vehículos y un vehículo concreto con la cookie de sesión', () => {
    service.getVehicles().subscribe();
    const list = http().expectOne(`${api}/vehicles`);
    expect(list.request.withCredentials).toBe(true);
    list.flush([vehicle]);
    service.getVehicle(7).subscribe();
    http().expectOne(`${api}/vehicles/7`).flush(vehicle);
  });
  it('crea, actualiza y elimina usando los métodos HTTP correctos', () => {
    service.createVehicle(vehicle).subscribe();
    const create = http().expectOne(`${api}/vehicles`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(vehicle);
    create.flush(vehicle);
    service.updateVehicle(7, { ...vehicle, hasFault: false }).subscribe();
    const update = http().expectOne(`${api}/vehicles/7`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.hasFault).toBe(false);
    update.flush(vehicle);
    service.deleteVehicle(7).subscribe();
    const remove = http().expectOne(`${api}/vehicles/7`);
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.withCredentials).toBe(true);
    remove.flush(null);
  });
});
