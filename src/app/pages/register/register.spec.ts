import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Register } from './register';
import { api, fill, http, setup, submit, user } from '../../testing/test-helpers';

describe('Register', () => {
  const values = {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    password: 'password123',
  };
  afterEach(() => http().verify());
  it('rechaza una contraseña demasiado corta', async () => {
    const fixture = setup(Register);
    await fill(fixture, { ...values, password: '123' });
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });
  it('registra la cuenta y lleva al login', async () => {
    const fixture = setup(Register);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fill(fixture, values);
    submit(fixture);
    const request = http().expectOne(`${api}/users`);
    expect(request.request.body).toEqual(values);
    request.flush(user);
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: '1' } });
  });
  it('muestra el conflicto de correo y permite reintentar', async () => {
    const fixture = setup(Register);
    await fill(fixture, values);
    submit(fixture);
    http().expectOne(`${api}/users`).flush({}, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ya existe una cuenta');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
