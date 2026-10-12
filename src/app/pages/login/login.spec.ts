import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Login } from './login';
import { api, fill, http, setup, submit, user } from '../../testing/test-helpers';

describe('Login', () => {
  afterEach(() => http().verify());
  it('impide enviar un formulario vacío', async () => {
    const fixture = setup(Login);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    submit(fixture);
    http().expectNone(`${api}/auth/login`);
  });
  it('envía las credenciales y navega a la tabla tras autenticar', async () => {
    const fixture = setup(Login);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await fill(fixture, { email: user.email, password: 'password123' });
    submit(fixture);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    submit(fixture);
    http().expectOne(`${api}/auth/login`).flush(user);
    expect(navigate).toHaveBeenCalledWith('/vehicles');
  });
  it('permite reintentar tras credenciales incorrectas', async () => {
    const fixture = setup(Login);
    await fill(fixture, { email: user.email, password: 'incorrecta' });
    submit(fixture);
    http().expectOne(`${api}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Comprueba tu correo');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
