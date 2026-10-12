import { TestBed } from '@angular/core/testing';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { api, user, http, httpProviders } from '../../testing/test-helpers';

describe('authGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: httpProviders }));
  afterEach(() => http().verify());
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | import('@angular/router').UrlTree>;
  it('permite acceder con una sesión válida', async () => {
    const result = firstValueFrom(run());
    http().expectOne(`${api}/auth/me`).flush(user);
    expect(await result).toBe(true);
  });
  it('redirige al login cuando no hay sesión', async () => {
    const result = firstValueFrom(run());
    http().expectOne(`${api}/auth/me`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(
      TestBed.inject(Router).serializeUrl((await result) as import('@angular/router').UrlTree),
    ).toBe('/login');
  });
});
