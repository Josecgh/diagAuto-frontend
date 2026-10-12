import { TestBed } from '@angular/core/testing';
import {
  Router,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { vehicleLimitGuard } from './vehicle-limit.guard';
import { DiagautoService } from '../services/diagauto.service';
import { api, user, vehicle, http, httpProviders } from '../../testing/test-helpers';

describe('Límite de vehículos', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: httpProviders }));
  afterEach(() => http().verify());
  function run() {
    return firstValueFrom(
      TestBed.runInInjectionContext(() =>
        vehicleLimitGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean | UrlTree>,
    );
  }
  function session(premium = false) {
    TestBed.inject(DiagautoService).restoreSession();
    http()
      .expectOne(`${api}/auth/me`)
      .flush({ ...user, accountStatus: premium ? 'PREMIUM' : 'FREE' });
  }
  it('permite añadir el cuarto vehículo gratuito', async () => {
    session();
    const result = run();
    http()
      .expectOne(`${api}/vehicles`)
      .flush(Array.from({ length: 3 }, (_, id) => ({ ...vehicle, id })));
    expect(await result).toBe(true);
  });
  it('solicita Premium al intentar añadir el quinto', async () => {
    session();
    const result = run();
    http()
      .expectOne(`${api}/vehicles`)
      .flush(Array.from({ length: 4 }, (_, id) => ({ ...vehicle, id })));
    expect(TestBed.inject(Router).serializeUrl((await result) as UrlTree)).toBe('/premium');
  });
  it('permite añadir vehículos Premium sin comprobar el límite gratuito', async () => {
    session(true);
    expect(await run()).toBe(true);
    http().expectNone(`${api}/vehicles`);
  });
  it('espera a recuperar la sesión antes de decidir el plan', async () => {
    const result = run();
    http()
      .expectOne(`${api}/auth/me`)
      .flush({ ...user, accountStatus: 'PREMIUM' });
    expect(await result).toBe(true);
    http().expectNone(`${api}/vehicles`);
  });
});
