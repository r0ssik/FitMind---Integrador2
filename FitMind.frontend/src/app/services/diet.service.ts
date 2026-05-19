import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DietPlanDto, CreateDietPlanRequest,
  LogFoodEntryRequest, AiGenerateDietRequest,
} from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class DietService {
  private readonly api   = `${environment.apiUrl}/diet`;
  private readonly aiApi = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  getActivePlan(): Observable<DietPlanDto> {
    return this.http.get<DietPlanDto>(`${this.api}/active`);
  }

  getHistory(): Observable<DietPlanDto[]> {
    return this.http.get<DietPlanDto[]>(`${this.api}/history`);
  }

  createPlan(body: CreateDietPlanRequest): Observable<DietPlanDto> {
    return this.http.post<DietPlanDto>(this.api, body);
  }

  logFood(body: LogFoodEntryRequest): Observable<unknown> {
    return this.http.post(`${this.api}/diary`, body);
  }

  getDiary(date: string): Observable<LogFoodEntryRequest[]> {
    return this.http.get<LogFoodEntryRequest[]>(`${this.api}/diary`, { params: { date } });
  }

  generateWithAi(body: AiGenerateDietRequest): Observable<DietPlanDto> {
    return this.http.post<DietPlanDto>(`${this.aiApi}/diet`, body);
  }
}
