import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  activatePlan(planId: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${planId}/activate`, {});
  }

  generateWithAi(body: AiGenerateDietRequest): Observable<DietPlanDto> {
    return this.http.post<any>(`${this.aiApi}/diet`, body).pipe(
      map(plan => this.normalizeAiDiet(plan, body))
    );
  }

  private normalizeAiDiet(plan: any, req: AiGenerateDietRequest): DietPlanDto {
    // Already normalized (backend returned full field names)
    if (plan.meals) return plan as DietPlanDto;

    return {
      id: crypto.randomUUID(),
      name: plan.n ?? 'Plano alimentar',
      goal: plan.g ?? req.goal,
      budget: req.budget,
      restrictions: req.restrictions?.filter((r: string) => r !== 'Nenhuma').join(', '),
      dailyCalories: plan.cal ?? 2000,
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
      meals: (plan.m ?? []).map((meal: any) => ({
        id: crypto.randomUUID(),
        name: meal.n ?? 'Refeição',
        time: meal.t ?? '',
        calories: meal.cal ?? 0,
        proteins: meal.p ?? 0,
        carbs: meal.c ?? 0,
        fats: meal.f ?? 0,
        // 'i' is the array of food items — join them as a readable description
        description: Array.isArray(meal.i) ? meal.i.join(', ') : (meal.i ?? ''),
      })),
    };
  }
}
