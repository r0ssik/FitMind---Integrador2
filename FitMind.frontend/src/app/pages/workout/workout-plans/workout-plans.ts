import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutPlanDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-workout-plans',
  imports: [],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.scss',
})
export class WorkoutPlans implements OnInit {
  activeTab    = signal<'current' | 'history'>('current');
  expandedDay  = signal<string | null>(null);
  loading      = signal(true);
  error        = signal('');

  currentPlan  = signal<WorkoutPlanDto | null>(null);
  history      = signal<WorkoutPlanDto[]>([]);

  constructor(private router: Router, private workoutService: WorkoutService) {}

  ngOnInit(): void {
    this.workoutService.getActivePlan().subscribe({
      next:  p => { this.currentPlan.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
    this.workoutService.getHistory().subscribe({
      next:  h => this.history.set(h),
      error: () => {},
    });
  }

  toggleDay(dayId: string): void {
    this.expandedDay.set(this.expandedDay() === dayId ? null : dayId);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  goGenerate():                          void { this.router.navigate(['/workout-plans/generate']); }
  startDay(planId: string, dayId: string): void { this.router.navigate(['/workout-plans/detail', planId, dayId]); }
  goWorkoutHistory():                    void { this.router.navigate(['/workout-history']); }
  goBack():                              void { this.router.navigate(['/home']); }
}
