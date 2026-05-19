import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WaterIntakeDto, SetWaterCupsRequest } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class WaterService {
  private readonly api = `${environment.apiUrl}/water`;

  constructor(private http: HttpClient) {}

  getToday(): Observable<WaterIntakeDto> {
    return this.http.get<WaterIntakeDto>(`${this.api}/today`);
  }

  setCups(body: SetWaterCupsRequest): Observable<WaterIntakeDto> {
    return this.http.post<WaterIntakeDto>(`${this.api}/today`, body);
  }

  getHistory(days = 30): Observable<WaterIntakeDto[]> {
    return this.http.get<WaterIntakeDto[]>(`${this.api}/history`, { params: { days } });
  }
}
