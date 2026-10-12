import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { type Type } from '@angular/core';
import { environment } from '../../environments/environmet';
import { type User, type Vehicle } from '../core/services/diagauto.service';

export const api = environment.apiBaseUrl;
export const user: User = {
  id: 1,
  name: 'Ana',
  lastName: 'García',
  email: 'ana@example.com',
  accountStatus: 'FREE',
};
export const vehicle: Vehicle = {
  id: 7,
  userId: 1,
  brand: 'Toyota',
  model: 'Corolla',
  plate: '1234 ABC',
  vehicleType: 'CAR',
  kilometres: 12000,
  hasFault: true,
  faultDescription: 'Ruido al frenar',
  technicalInspectionDate: '2027-05-20',
};
export const httpProviders = [provideHttpClient(), provideHttpClientTesting(), provideRouter([])];

export function setup<T>(component: Type<T>): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component], providers: httpProviders });
  return TestBed.createComponent(component);
}
export function http(): HttpTestingController {
  return TestBed.inject(HttpTestingController);
}
export async function fill<T>(
  fixture: ComponentFixture<T>,
  values: Record<string, string>,
): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  for (const [name, value] of Object.entries(values)) {
    const input = fixture.nativeElement.querySelector(`[name="${name}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  fixture.detectChanges();
  await fixture.whenStable();
}
export function submit<T>(fixture: ComponentFixture<T>): void {
  fixture.nativeElement
    .querySelector('form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}
