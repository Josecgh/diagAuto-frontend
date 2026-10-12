import { Component, InjectionToken, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DiagautoService } from '../../core/services/diagauto.service';

export const STRIPE_REDIRECT = new InjectionToken<(url: string) => void>('STRIPE_REDIRECT', {
  providedIn: 'root',
  factory: () => (url) => window.location.assign(url),
});

@Component({
  selector: 'app-premium',
  imports: [RouterLink],
  templateUrl: './premium.html',
  styleUrl: './premium.scss',
})
export class Premium {
  protected readonly service = inject(DiagautoService);
  private readonly redirect = inject(STRIPE_REDIRECT);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly sessionId =
    this.query.get('checkout') === 'success' ? this.query.get('session_id') : null;

  constructor() {
    if (this.sessionId) this.confirm();
    else if (this.query.get('checkout') === 'cancelled')
      this.message.set('Pago cancelado. Tu cuenta sigue con el plan actual.');
  }

  protected checkout(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');
    this.service.createPremiumCheckout().subscribe({
      next: ({ url }) => this.redirect(url),
      error: (response: HttpErrorResponse) => {
        this.submitting.set(false);
        const errors: Record<number, string> = {
          0: 'No se pudo contactar con el backend. Comprueba que está iniciado.',
          401: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
          403: 'No tienes acceso al pago. Vuelve a iniciar sesión.',
          409: 'Tu cuenta ya tiene Premium. Recarga la página.',
          503: 'El backend no ha cargado la clave de pruebas de Stripe. Reinícialo con la configuración local.'
        };
        this.error.set(errors[response.status] ?? `No se pudo abrir Stripe (HTTP ${response.status}). Revisa el error en la consola del backend.`);
      },
    });
  }

  protected confirm(): void {
    if (!this.sessionId || this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');
    this.service.confirmPremiumPayment(this.sessionId).subscribe({
      next: ({ paid }) => {
        this.submitting.set(false);
        this.message.set(
          paid
            ? 'Pago confirmado. Premium está activo.'
            : 'El pago todavía no está confirmado. Puedes comprobarlo de nuevo.',
        );
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('No se pudo comprobar el pago. Vuelve a intentarlo.');
      },
    });
  }
}
