import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  WorkoutPlanDto, CreateWorkoutPlanRequest,
  LogWorkoutSessionRequest, AiGenerateWorkoutRequest,
  CreateWorkoutDayRequest, CreateExerciseRequest,
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
  return this.http.post<any>(`${this.aiApi}/workout`, body).pipe(
    map(plan => this.normalizeAiPlan(plan, body.daysPerWeek))
  );
}

private normalizeAiPlan(plan: any, daysPerWeek: number): WorkoutPlanDto {
  if (plan.days) {
    return plan as WorkoutPlanDto;
  }

  return {
    id: crypto.randomUUID(),
    name: plan.n ?? 'Treino gerado',
    goal: plan.g ?? 'Saude geral',
    daysPerWeek,
    weeks: plan.w ?? 8,
    isAiGenerated: true,
    createdAt: new Date().toISOString(),
    days: (plan.d ?? []).map((day: any, dayIndex: number) => ({
      id: crypto.randomUUID(),
      dayName: day.n ?? `Dia ${dayIndex + 1}`,
      focus: day.f ?? 'Treino',
      orderIndex: day.i ?? dayIndex,
      exercises: (day.e ?? []).map((ex: any) => ({
        id: crypto.randomUUID(),
        name: ex.n,
        sets: ex.s,
        reps: ex.r,
        restTime: ex.p,
        effortLevel: 2,
        tips: ex.o
      }))
    }))
  };
}
}