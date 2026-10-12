import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environmet';

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN' | 'BICYCLE' | 'BUS';

export interface VehicleRequest {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  plate: string;
  kilometres: number;
  hasFault: boolean;
  technicalInspectionDate?: string | null;
  faultDescription?: string | null;
}

export interface Vehicle extends VehicleRequest {
  id: number;
  userId: number;
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
  lastName: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export type AccountStatus = 'FREE' | 'PREMIUM';
export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
  accountStatus: AccountStatus;
}

@Injectable({ providedIn: 'root' })
export class DiagautoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly requestOptions = { withCredentials: true };
  private readonly userState = signal<User | null>(null);
  private readonly sessionReadyState = signal(false);
  readonly currentUser = this.userState.asReadonly();
  readonly sessionReady = this.sessionReadyState.asReadonly();

  login(credentials: Credentials): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, credentials, this.requestOptions).pipe(
      tap((user) => {
        this.userState.set(user);
        this.sessionReadyState.set(true);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, this.requestOptions).pipe(
      tap(() => this.clearSession()),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  restoreSession(): void {
    this.http.get<User>(`${this.apiUrl}/auth/me`, this.requestOptions).subscribe({
      next: (user) => {
        this.userState.set(user);
        this.sessionReadyState.set(true);
      },
      error: () => {
        this.userState.set(null);
        this.sessionReadyState.set(true);
      }
    });
  }

  checkSession(): Observable<boolean> {
    if (this.sessionReadyState()) {
      return of(this.userState() !== null);
    }

    return this.http.get<User>(`${this.apiUrl}/auth/me`, this.requestOptions).pipe(
      tap((user) => {
        this.userState.set(user);
        this.sessionReadyState.set(true);
      }),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  private clearSession(): void {
    this.userState.set(null);
    this.sessionReadyState.set(true);
  }

  registerUser(user: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  createPremiumCheckout(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}/billing/checkout`, {}, this.requestOptions);
  }

  confirmPremiumPayment(sessionId: string): Observable<{ paid: boolean; user: User | null }> {
    return this.http.post<{ paid: boolean; user: User | null }>(
      `${this.apiUrl}/billing/checkout/${encodeURIComponent(sessionId)}/confirm`, {}, this.requestOptions
    ).pipe(
      tap((result) => { if (result.paid && result.user) this.userState.set(result.user); })
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, this.requestOptions);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`, this.requestOptions);
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${id}`, this.requestOptions);
  }

  createVehicle(vehicle: VehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, vehicle, this.requestOptions);
  }

  updateVehicle(id: number, vehicle: VehicleRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/vehicles/${id}`, vehicle, this.requestOptions);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vehicles/${id}`, this.requestOptions);
  }
}
