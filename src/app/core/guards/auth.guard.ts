import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { DiagautoService } from '../services/diagauto.service';

export const authGuard: CanActivateFn = () => {
  const diagauto = inject(DiagautoService);
  const router = inject(Router);

  return diagauto.checkSession().pipe(
    map((authenticated) => authenticated || router.createUrlTree(['/login']))
  );
};
