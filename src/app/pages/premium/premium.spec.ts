import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Premium, STRIPE_REDIRECT } from './premium';
import { DiagautoService } from '../../core/services/diagauto.service';
import { api, user, http, httpProviders } from '../../testing/test-helpers';

describe('Premium con Stripe', () => {
  const redirect = vi.fn();
  function page(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({ imports: [Premium], providers: [
      ...httpProviders,
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      { provide: STRIPE_REDIRECT, useValue: redirect }
    ] });
    const service = TestBed.inject(DiagautoService);
    service.restoreSession(); http().expectOne(`${api}/auth/me`).flush(user);
    const fixture = TestBed.createComponent(Premium); fixture.detectChanges(); return fixture;
  }
  beforeEach(() => redirect.mockClear());
  afterEach(() => http().verify());
  it('abre Stripe sin activar Premium al crear el checkout', () => {
    const fixture = page(); fixture.nativeElement.querySelector('button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    const request = http().expectOne(`${api}/billing/checkout`);
    expect(request.request.withCredentials).toBe(true);
    request.flush({ url: 'https://checkout.stripe.com/c/pay/cs_test_123' });
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_123');
    expect(TestBed.inject(DiagautoService).currentUser()?.accountStatus).toBe('FREE');
  });
  it('permite reintentar si Stripe no se abre', () => {
    const fixture = page(); fixture.nativeElement.querySelector('button').click();
    http().expectOne(`${api}/billing/checkout`).flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges(); expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
    expect(redirect).not.toHaveBeenCalled();
  });
  it('activa Premium solamente tras la confirmación del backend', () => {
    const fixture = page({ checkout: 'success', session_id: 'cs_test_paid' });
    expect(TestBed.inject(DiagautoService).currentUser()?.accountStatus).toBe('FREE');
    const request = http().expectOne(`${api}/billing/checkout/cs_test_paid/confirm`);
    expect(request.request.withCredentials).toBe(true);
    request.flush({ paid: true, user: { ...user, accountStatus: 'PREMIUM' } }); fixture.detectChanges();
    expect(TestBed.inject(DiagautoService).currentUser()?.accountStatus).toBe('PREMIUM');
    expect(fixture.nativeElement.textContent).toContain('Añadir vehículo');
  });
  it('no activa Premium con un pago pendiente y permite comprobarlo otra vez', () => {
    const fixture = page({ checkout: 'success', session_id: 'cs_test_pending' });
    http().expectOne(`${api}/billing/checkout/cs_test_pending/confirm`).flush({ paid: false, user: null });
    fixture.detectChanges();
    expect(TestBed.inject(DiagautoService).currentUser()?.accountStatus).toBe('FREE');
    fixture.nativeElement.querySelector('button').click();
    http().expectOne(`${api}/billing/checkout/cs_test_pending/confirm`).flush({ paid: false, user: null });
  });
  it('cancelar el checkout no modifica el plan', () => {
    const fixture = page({ checkout: 'cancelled' });
    expect(fixture.nativeElement.textContent).toContain('Pago cancelado');
    expect(TestBed.inject(DiagautoService).currentUser()?.accountStatus).toBe('FREE');
  });
});
