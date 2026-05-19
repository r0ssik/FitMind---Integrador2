import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FullHistoryDto, WorkoutHistoryDto, DietHistoryDto } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly api = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getFull(): Observable<FullHistoryDto> {
    return this.http.get<FullHistoryDto>(this.api);
  }

  getWorkouts(filter = ''): Observable<WorkoutHistoryDto[]> {
    return this.http.get<WorkoutHistoryDto[]>(`${this.api}/workouts`, { params: { filter } });
  }

  getDiet(days = 30): Observable<DietHistoryDto[]> {
    return this.http.get<DietHistoryDto[]>(`${this.api}/diet`, { params: { days } });
  }
}
