import { api, http, setup } from './testing/test-helpers';
import { App } from './app';

describe('App', () => {
  afterEach(() => http().verify());
  it('recupera la sesión al arrancar y muestra la estructura de navegación', () => {
    const fixture = setup(App);
    fixture.detectChanges();
    http().expectOne(`${api}/auth/me`).flush({}, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-footer')).toBeTruthy();
  });
});
