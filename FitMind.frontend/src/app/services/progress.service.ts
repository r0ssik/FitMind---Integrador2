import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardProgressDto, ChartDataDto, ProgressStatsDto, AddWeightRequest } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardProgressDto> {
    return this.http.get<DashboardProgressDto>(`${this.api}/dashboard`);
  }

  getStats(): Observable<ProgressStatsDto> {
    return this.http.get<ProgressStatsDto>(`${this.api}/stats`);
  }

  getChartData(period: '7d' | '30d' | '3m' = '30d'): Observable<ChartDataDto> {
    return this.http.get<ChartDataDto>(`${this.api}/chart`, { params: { period } });
  }

  addWeight(body: AddWeightRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/weight`, body);
  }
}
