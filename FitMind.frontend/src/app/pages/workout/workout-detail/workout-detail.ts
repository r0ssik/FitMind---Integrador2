import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { ExerciseDto } from '../../../core/models/api.models';

type EffortLevel = 'easy' | 'moderate' | 'hard' | 'max' | null;

interface ExerciseSet {
  index: number;
  reps: string;
  done: boolean;
}

interface ExerciseRow {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restSeconds: number;
  tips?: string;
  effortLevel: EffortLevel;
  expanded: boolean;
}

@Component({
  selector: 'app-workout-detail',
  imports: [],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.scss',
})
export class WorkoutDetail implements OnInit, OnDestroy {
  workoutName   = signal('Carregando...');
  startTime     = new Date();
  elapsed       = signal(0);
  restCountdown = signal<number | null>(null);
  finished      = signal(false);
  loading       = signal(true);
  saving        = signal(false);

  private planId = '';
  private dayId  = '';
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private restInterval:  ReturnType<typeof setInterval> | null = null;

  effortLabels: Record<string, { label: string; icon: string; color: string }> = {
    easy:     { label: 'Fácil',    icon: 'sentiment_satisfied',         color: '#4caf50' },
    moderate: { label: 'Moderado', icon: 'sentiment_dissatisfied',      color: '#ff9800' },
    hard:     { label: 'Difícil',  icon: 'sentiment_very_dissatisfied', color: '#f44336' },
    max:      { label: 'Máximo',   icon: 'local_fire_department',       color: '#9c27b0' },
  };

  exercises = signal<ExerciseRow[]>([]);

  completedSets = computed(() =>
    this.exercises().reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0)
  );
  totalSets = computed(() =>
    this.exercises().reduce((sum, ex) => sum + ex.sets.length, 0)
  );
  progress = computed(() =>
    this.totalSets() === 0 ? 0 : Math.round((this.completedSets() / this.totalSets()) * 100)
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
  ) {}

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('planId') ?? '';
    this.dayId  = this.route.snapshot.paramMap.get('dayId')  ?? '';

    this.workoutService.getActivePlan().subscribe({
      next: plan => {
        const day = plan.days.find(d => d.id === this.dayId);
        if (!day) { this.loading.set(false); return; }

        this.workoutName.set(`${day.dayName} — ${day.focus}`);
        this.exercises.set(day.exercises.map(e => this.toRow(e)));
        this.loading.set(false);

        this.timerInterval = setInterval(() => {
          if (!this.finished()) this.elapsed.update(v => v + 1);
        }, 1000);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.restInterval)  clearInterval(this.restInterval);
  }

  private toRow(e: ExerciseDto): ExerciseRow {
    const restSec = this.parseRestSeconds(e.restTime);
    return {
      id: e.id,
      name: e.name,
      sets: Array.from({ length: e.sets }, (_, i) => ({
        index: i + 1,
        reps: e.reps,
        done: false,
      })),
      restSeconds: restSec,
      tips: e.tips,
      effortLevel: null,
      expanded: false,
    };
  }

  private parseRestSeconds(restTime: string): number {
    if (!restTime) return 60;
    const m = restTime.match(/(\d+)/);
    if (!m) return 60;
    const n = parseInt(m[1], 10);
    if (restTime.toLowerCase().includes('min')) return n * 60;
    return n;
  }

  get elapsedFormatted(): string {
    const m = Math.floor(this.elapsed() / 60);
    const s = this.elapsed() % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  toggleExpand(id: string): void {
    this.exercises.update(list =>
      list.map(ex => ex.id === id ? { ...ex, expanded: !ex.expanded } : ex)
    );
  }

  toggleSet(exId: string, setIdx: number): void {
    const list = this.exercises();
    const ex = list.find(e => e.id === exId)!;
    const wasUndone = !ex.sets[setIdx].done;
    this.exercises.update(l =>
      l.map(e => e.id === exId
        ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, done: !s.done } : s) }
        : e
      )
    );
    if (wasUndone) this.startRest(ex.restSeconds);
  }

  setEffort(exId: string, level: EffortLevel): void {
    this.exercises.update(l =>
      l.map(e => e.id === exId ? { ...e, effortLevel: e.effortLevel === level ? null : level } : e)
    );
  }

  startRest(seconds: number): void {
    if (this.restInterval) clearInterval(this.restInterval);
    this.restCountdown.set(seconds);
    this.restInterval = setInterval(() => {
      this.restCountdown.update(v => {
        if (v === null || v <= 1) { clearInterval(this.restInterval!); return null; }
        return v - 1;
      });
    }, 1000);
  }

  skipRest(): void {
    if (this.restInterval) clearInterval(this.restInterval);
    this.restCountdown.set(null);
  }

  finishWorkout(): void {
    this.finished.set(true);
    this.skipRest();
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }

    const durationMinutes = Math.max(1, Math.round(this.elapsed() / 60));
    const dominantEffort  = this.getDominantEffort();

    this.saving.set(true);
    this.workoutService.logSession({
      workoutPlanId:   this.planId,
      date:            new Date().toISOString(),
      durationMinutes,
      feeling:         dominantEffort ?? undefined,
    }).subscribe({ error: () => {}, complete: () => this.saving.set(false) });
  }

  private getDominantEffort(): string | null {
    const counts: Record<string, number> = {};
    for (const ex of this.exercises()) {
      if (ex.effortLevel) counts[ex.effortLevel] = (counts[ex.effortLevel] ?? 0) + 1;
    }
    const entries = Object.entries(counts);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  goBack(): void { this.router.navigate(['/workout-plans']); }
}
