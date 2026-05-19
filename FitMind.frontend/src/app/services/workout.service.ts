import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  WorkoutPlanDto, CreateWorkoutPlanRequest,
  LogWorkoutSessionRequest, AiGenerateWorkoutRequest,
} from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly api   = `${environment.apiUrl}/workout`;
  private readonly aiApi = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  getActivePlan(): Observable<WorkoutPlanDto> {
    return this.http.get<WorkoutPlanDto>(`${this.api}/active`);
  }

  getHistory(): Observable<WorkoutPlanDto[]> {
    return this.http.get<WorkoutPlanDto[]>(`${this.api}/history`);
  }

  createPlan(body: CreateWorkoutPlanRequest): Observable<WorkoutPlanDto> {
    return this.http.post<WorkoutPlanDto>(this.api, body);
  }

  activatePlan(planId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${planId}/activate`, {});
  }

  logSession(body: LogWorkoutSessionRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/sessions`, body);
  }

  generateWithAi(body: AiGenerateWorkoutRequest): Observable<WorkoutPlanDto> {
    return this.http.post<WorkoutPlanDto>(`${this.aiApi}/workout`, body);
  }
}
