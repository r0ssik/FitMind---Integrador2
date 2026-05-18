import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

type EffortLevel = 'easy' | 'moderate' | 'hard' | 'max' | null;

interface ExerciseSet {
  index: number;
  reps: number;
  weight: number | null;
  done: boolean;
}

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  sets: ExerciseSet[];
  restSeconds: number;
  tip: string;
  videoThumb: string;
  videoUrl: string;
  effortLevel: EffortLevel;
  expanded: boolean;
}

@Component({
  selector: 'app-workout-detail',
  imports: [],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.scss',
})
export class WorkoutDetail {
  workoutName = 'Quinta — Perna';
  startTime = new Date();
  elapsed = signal(0);
  restCountdown = signal<number | null>(null);
  restInterval: ReturnType<typeof setInterval> | null = null;
  finished = signal(false);

  effortLabels: Record<string, { label: string; icon: string; color: string }> = {
    easy:     { label: 'Fácil',    icon: 'sentiment_satisfied',         color: '#4caf50' },
    moderate: { label: 'Moderado', icon: 'sentiment_dissatisfied',      color: '#ff9800' },
    hard:     { label: 'Difícil',  icon: 'sentiment_very_dissatisfied', color: '#f44336' },
    max:      { label: 'Máximo',   icon: 'local_fire_department',       color: '#9c27b0' },
  };

  exercises = signal<Exercise[]>([
    {
      id: 1, name: 'Agachamento Livre', muscle: 'Quadríceps · Glúteos',
      sets: [
        { index: 1, reps: 12, weight: 60, done: true },
        { index: 2, reps: 12, weight: 60, done: true },
        { index: 3, reps: 10, weight: 65, done: false },
        { index: 4, reps: 10, weight: 65, done: false },
      ],
      restSeconds: 120, tip: 'Mantenha os joelhos alinhados com os pés e desça até 90°.',
      videoThumb: '', videoUrl: 'https://www.youtube.com/results?search_query=agachamento+livre+tutorial',
      effortLevel: 'moderate', expanded: true,
    },
    {
      id: 2, name: 'Leg Press 45°', muscle: 'Quadríceps · Isquiotibiais',
      sets: [
        { index: 1, reps: 15, weight: 120, done: false },
        { index: 2, reps: 15, weight: 120, done: false },
        { index: 3, reps: 12, weight: 130, done: false },
        { index: 4, reps: 12, weight: 130, done: false },
      ],
      restSeconds: 90, tip: 'Não trave os joelhos no topo. Amplitude completa.',
      videoThumb: '', videoUrl: 'https://www.youtube.com/results?search_query=leg+press+tutorial',
      effortLevel: null, expanded: false,
    },
    {
      id: 3, name: 'Cadeira Extensora', muscle: 'Quadríceps',
      sets: [
        { index: 1, reps: 15, weight: 40, done: false },
        { index: 2, reps: 15, weight: 40, done: false },
        { index: 3, reps: 15, weight: 40, done: false },
      ],
      restSeconds: 60, tip: 'Isometria de 1 segundo no topo de cada repetição.',
      videoThumb: '', videoUrl: 'https://www.youtube.com/results?search_query=cadeira+extensora+tutorial',
      effortLevel: null, expanded: false,
    },
    {
      id: 4, name: 'Mesa Flexora', muscle: 'Isquiotibiais',
      sets: [
        { index: 1, reps: 12, weight: 35, done: false },
        { index: 2, reps: 12, weight: 35, done: false },
        { index: 3, reps: 12, weight: 35, done: false },
      ],
      restSeconds: 60, tip: 'Quadril fixo no banco. Movimento controlado na descida.',
      videoThumb: '', videoUrl: 'https://www.youtube.com/results?search_query=mesa+flexora+tutorial',
      effortLevel: null, expanded: false,
    },
    {
      id: 5, name: 'Panturrilha em Pé', muscle: 'Gastrocnêmio · Sóleo',
      sets: [
        { index: 1, reps: 20, weight: 50, done: false },
        { index: 2, reps: 20, weight: 50, done: false },
        { index: 3, reps: 20, weight: 50, done: false },
        { index: 4, reps: 20, weight: 50, done: false },
      ],
      restSeconds: 45, tip: 'Amplitude máxima: calcanhar bem abaixo e ponta bem acima.',
      videoThumb: '', videoUrl: 'https://www.youtube.com/results?search_query=panturrilha+tutorial',
      effortLevel: null, expanded: false,
    },
  ]);

  completedSets = computed(() =>
    this.exercises().reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0)
  );
  totalSets = computed(() =>
    this.exercises().reduce((sum, ex) => sum + ex.sets.length, 0)
  );
  progress = computed(() => Math.round((this.completedSets() / this.totalSets()) * 100));

  constructor(private router: Router) {
    const timer = setInterval(() => {
      if (!this.finished()) this.elapsed.update(v => v + 1);
      else clearInterval(timer);
    }, 1000);
  }

  get elapsedFormatted(): string {
    const m = Math.floor(this.elapsed() / 60);
    const s = this.elapsed() % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  toggleExpand(id: number): void {
    this.exercises.update(list =>
      list.map(ex => ex.id === id ? { ...ex, expanded: !ex.expanded } : ex)
    );
  }

  toggleSet(exId: number, setIdx: number): void {
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

  setEffort(exId: number, level: EffortLevel): void {
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
  }

  goBack(): void {
    this.router.navigate(['/workout-plans']);
  }
}
