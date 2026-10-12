import { TestBed } from '@angular/core/testing';
import { DiagautoService } from '../../core/services/diagauto.service';
import { api, http, setup, user } from '../../testing/test-helpers';

import { Header } from './header';

describe('Header', () => {
  afterEach(() => http().verify());
  it('muestra login y registro cuando no hay sesión', () => {
    const fixture = setup(Header);
    TestBed.inject(DiagautoService).restoreSession();
    http().expectOne(`${api}/auth/me`).flush({}, { status: 403, statusText: 'Forbidden' }); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/register"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile-button')).toBeNull();
  });
  it('reemplaza login y registro con el perfil de la cuenta autenticada', () => {
    const fixture = setup(Header);
    TestBed.inject(DiagautoService).restoreSession();
    http().expectOne(`${api}/auth/me`).flush(user); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeNull();
    fixture.nativeElement.querySelector('.profile-button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-menu').textContent).toContain(user.email);
    expect(fixture.nativeElement.querySelector('a[href="/vehicles"]')).toBeTruthy();
  });
});
