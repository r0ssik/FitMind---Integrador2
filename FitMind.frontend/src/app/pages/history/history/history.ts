import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../../../services/history.service';
import { WorkoutHistoryDto, DietHistoryDto, AchievementHistoryDto } from '../../../core/models/api.models';

type HistoryTab = 'workouts' | 'diet' | 'achievements';

@Component({
  selector: 'app-history',
  imports: [DecimalPipe],
  templateUrl: './history.html',
  styleUrl:    './history.scss',
})
export class History implements OnInit {
  constructor(private router: Router, private historyService: HistoryService) {}

  tab      = signal<HistoryTab>('workouts');
  loading  = signal(true);

  workouts     = signal<WorkoutHistoryDto[]>([]);
  diet         = signal<DietHistoryDto[]>([]);
  achievements = signal<AchievementHistoryDto[]>([]);

  ngOnInit(): void {
    this.historyService.getFull().subscribe({
      next: h => {
        this.workouts.set(h.workouts);
        this.diet.set(h.diet);
        this.achievements.set(h.achievements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get totalDuration(): number { return this.workouts().reduce((s, w) => s + w.durationMinutes, 0); }
  get avgKcal():       number {
    const d = this.diet();
    return d.length ? Math.round(d.reduce((s, x) => s + x.totalCalories, 0) / d.length) : 0;
  }
  get totalPoints(): number { return this.achievements().reduce((s, a) => s + a.points, 0); }
  get onTargetDays():  number {
    return this.diet().filter(d => d.totalCalories >= d.calorieGoal * 0.85 && d.totalCalories <= d.calorieGoal * 1.1).length;
  }

  goalPct(d: DietHistoryDto): number { return Math.min((d.totalCalories / d.calorieGoal) * 100, 110); }
  goalColor(d: DietHistoryDto): string {
    const p = this.goalPct(d);
    if (p >= 85 && p <= 110) return 'var(--primary)';
    return p > 110 ? 'var(--danger)' : 'var(--warning)';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  goBack(): void { this.router.navigate(['/home']); }
}
