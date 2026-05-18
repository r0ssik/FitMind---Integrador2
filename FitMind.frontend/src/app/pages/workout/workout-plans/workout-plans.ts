import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: number;
  name: string;
  goal: string;
  daysPerWeek: number;
  generatedBy: 'ai' | 'manual';
  createdAt: Date;
  active: boolean;
  weeks: number;
  days: WorkoutDay[];
}

@Component({
  selector: 'app-workout-plans',
  imports: [],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.scss',
})
export class WorkoutPlans {
  activeTab = signal<'current' | 'history'>('current');
  expandedDay = signal<string | null>(null);

  currentPlan: WorkoutPlan = {
    id: 1,
    name: 'Plano Hipertrofia — Intermediário',
    goal: 'Hipertrofia',
    daysPerWeek: 4,
    generatedBy: 'ai',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    active: true,
    weeks: 8,
    days: [
      {
        day: 'Segunda',
        focus: 'Peito + Tríceps',
        exercises: [
          { name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s' },
          { name: 'Supino Inclinado (Halteres)', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Crossover', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Tríceps Testa', sets: 3, reps: '10-12', rest: '60s' },
        ],
      },
      {
        day: 'Terça',
        focus: 'Costas + Bíceps',
        exercises: [
          { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s' },
          { name: 'Remada Curvada', sets: 4, reps: '8-12', rest: '90s' },
          { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Rosca Direta', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Rosca Martelo', sets: 3, reps: '12', rest: '60s' },
        ],
      },
      {
        day: 'Quinta',
        focus: 'Perna',
        exercises: [
          { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest: '120s' },
          { name: 'Leg Press 45°', sets: 4, reps: '12-15', rest: '90s' },
          { name: 'Cadeira Extensora', sets: 3, reps: '15', rest: '60s' },
          { name: 'Mesa Flexora', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Panturrilha em Pé', sets: 4, reps: '20', rest: '45s' },
        ],
      },
      {
        day: 'Sexta',
        focus: 'Ombro + Core',
        exercises: [
          { name: 'Desenvolvimento com Halteres', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Face Pull', sets: 3, reps: '15', rest: '60s' },
          { name: 'Prancha', sets: 3, reps: '45s', rest: '45s' },
          { name: 'Abdominal Crunch', sets: 3, reps: '20', rest: '45s' },
        ],
      },
    ],
  };

  history: WorkoutPlan[] = [
    {
      id: 2,
      name: 'Plano Iniciante — Full Body',
      goal: 'Saúde Geral',
      daysPerWeek: 3,
      generatedBy: 'ai',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      active: false,
      weeks: 6,
      days: [],
    },
    {
      id: 3,
      name: 'Plano Emagrecimento',
      goal: 'Emagrecer',
      daysPerWeek: 5,
      generatedBy: 'ai',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      active: false,
      weeks: 8,
      days: [],
    },
  ];

  constructor(private router: Router) {}

  toggleDay(day: string): void {
    this.expandedDay.set(this.expandedDay() === day ? null : day);
  }

  goGenerate():      void { this.router.navigate(['/workout-plans/generate']); }
  goDetail():        void { this.router.navigate(['/workout-plans/detail']); }
  goWorkoutHistory():void { this.router.navigate(['/workout-history']); }
  goBack():          void { this.router.navigate(['/home']); }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
