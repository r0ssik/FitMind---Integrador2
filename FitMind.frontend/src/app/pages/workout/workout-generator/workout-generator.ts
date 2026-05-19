import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutPlanDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-workout-generator',
  imports: [ReactiveFormsModule],
  templateUrl: './workout-generator.html',
  styleUrl: './workout-generator.scss',
})
export class WorkoutGenerator {
  form: FormGroup;
  loading      = signal(false);
  generated    = signal(false);
  error        = signal('');
  generatedPlan = signal<WorkoutPlanDto | null>(null);

  locations = [
    { value: 'academia',  label: 'Academia',    icon: 'fitness_center' },
    { value: 'casa',      label: 'Em casa',     icon: 'home' },
    { value: 'ar_livre',  label: 'Ao ar livre', icon: 'park' },
    { value: 'funcional', label: 'Funcional',   icon: 'bolt' },
  ];

  preferences = ['Musculação', 'Cardio', 'HIIT', 'Funcional', 'Calistenia', 'Yoga', 'Pilates'];
  limitations = ['Joelho', 'Coluna', 'Ombro', 'Tornozelo', 'Punho', 'Nenhuma'];

  selectedPrefs       = signal<string[]>([]);
  selectedLimitations = signal<string[]>(['Nenhuma']);

  constructor(private fb: FormBuilder, private router: Router, private workoutService: WorkoutService) {
    this.form = this.fb.group({
      daysPerWeek:     [4, [Validators.required, Validators.min(1), Validators.max(6)]],
      timePerSession:  [60, Validators.required],
      location:        ['academia', Validators.required],
    });
  }

  togglePref(p: string): void {
    const cur = this.selectedPrefs();
    this.selectedPrefs.set(cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]);
  }

  toggleLimitation(l: string): void {
    if (l === 'Nenhuma') { this.selectedLimitations.set(['Nenhuma']); return; }
    const cur = this.selectedLimitations().filter(x => x !== 'Nenhuma');
    this.selectedLimitations.set(cur.includes(l) ? cur.filter(x => x !== l) : [...cur, l]);
    if (!this.selectedLimitations().length) this.selectedLimitations.set(['Nenhuma']);
  }

  async generate(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.workoutService.generateWithAi({
      daysPerWeek:     this.form.value.daysPerWeek,
      minutesPerSession: this.form.value.timePerSession,
      location:        this.form.value.location,
      preferences:     this.selectedPrefs(),
      limitations:     this.selectedLimitations().filter(l => l !== 'Nenhuma'),
    }).subscribe({
      next: plan => {
        this.generatedPlan.set(plan);
        this.loading.set(false);
        this.generated.set(true);
      },
      error: () => {
        this.error.set('Erro ao gerar treino. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  savePlan(): void {
    this.router.navigate(['/workout-plans']);
  }

  regenerate(): void {
    this.generated.set(false);
    this.generatedPlan.set(null);
  }

  goBack(): void { this.router.navigate(['/workout-plans']); }
}
