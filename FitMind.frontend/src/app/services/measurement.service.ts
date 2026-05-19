import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MeasurementDto, CreateMeasurementRequest } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  private readonly api = `${environment.apiUrl}/measurement`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MeasurementDto[]> {
    return this.http.get<MeasurementDto[]>(this.api);
  }

  add(body: CreateMeasurementRequest): Observable<MeasurementDto> {
    return this.http.post<MeasurementDto>(this.api, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
