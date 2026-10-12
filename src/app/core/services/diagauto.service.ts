import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environmet';

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN';

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

export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
  accountStatus: string;
}

@Injectable({ providedIn: 'root' })
export class DiagautoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly requestOptions = { withCredentials: true };

  registerUser(user: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
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