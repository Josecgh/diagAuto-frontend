import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { DiagautoService } from '../services/diagauto.service';

export const vehicleLimitGuard: CanActivateFn = () => {
  const service = inject(DiagautoService);
  const router = inject(Router);
  return service.checkSession().pipe(
    switchMap((authenticated) => {
      if (!authenticated) return of(router.createUrlTree(['/login']));
      if (service.currentUser()?.accountStatus === 'PREMIUM') return of(true);
      return service.getVehicles().pipe(
        map((vehicles) => vehicles.length < 4 || router.createUrlTree(['/premium'])),
        catchError(() => of(router.createUrlTree(['/vehicles'])))
      );
    })
  );
};
