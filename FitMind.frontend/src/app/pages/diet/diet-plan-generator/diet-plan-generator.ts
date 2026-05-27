import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { DietPlanDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-diet-plan-generator',
  imports: [ReactiveFormsModule],
  templateUrl: './diet-plan-generator.html',
  styleUrl: './diet-plan-generator.scss',
})
export class DietPlanGenerator {
  form: FormGroup;
  loading   = signal(false);
  generated = signal(false);
  error     = signal('');
  plan      = signal<DietPlanDto | null>(null);

  goals = [
    { value: 'emagrecer',   label: 'Emagrecer',   icon: 'local_fire_department' },
    { value: 'hipertrofia', label: 'Hipertrofia', icon: 'fitness_center' },
    { value: 'manutencao',  label: 'Manutenção',  icon: 'balance' },
    { value: 'saude',       label: 'Saúde Geral', icon: 'favorite' },
  ];

  restrictions = ['Lactose', 'Glúten', 'Vegano', 'Vegetariano', 'Sem amendoim', 'Sem frutos do mar', 'Nenhuma'];
  preferences  = ['Frango', 'Carne vermelha', 'Peixe', 'Ovos', 'Arroz/Massa', 'Saladas', 'Frutas', 'Proteína em pó'];
  budgets = [
    { value: 'low',    label: 'Econômico',  sub: 'até R$300/mês',  icon: 'payments' },
    { value: 'medium', label: 'Moderado',   sub: 'R$300–600/mês',  icon: 'credit_card' },
    { value: 'high',   label: 'Sem limite', sub: 'acima de R$600', icon: 'diamond' },
  ];

  selectedRestrictions = signal<string[]>(['Nenhuma']);
  selectedPreferences  = signal<string[]>([]);

  constructor(private fb: FormBuilder, private router: Router, private dietService: DietService) {
    this.form = this.fb.group({
      goal:        ['emagrecer', Validators.required],
      budget:      ['medium',    Validators.required],
      mealsPerDay: [5,           Validators.required],
    });
  }

  toggleRestriction(r: string): void {
    if (r === 'Nenhuma') { this.selectedRestrictions.set(['Nenhuma']); return; }
    const cur  = this.selectedRestrictions().filter(x => x !== 'Nenhuma');
    const next = cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r];
    this.selectedRestrictions.set(next.length ? next : ['Nenhuma']);
  }

  togglePreference(p: string): void {
    const cur = this.selectedPreferences();
    this.selectedPreferences.set(cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]);
  }

  generate(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.dietService.generateWithAi({
      goal:             this.form.value.goal,
      budget:           this.form.value.budget,
      mealsPerDay:      this.form.value.mealsPerDay,
      restrictions:     this.selectedRestrictions().filter(r => r !== 'Nenhuma'),
      foodPreferences:  this.selectedPreferences(),
    }).subscribe({
      next: p => {
        this.plan.set(p);
        this.loading.set(false);
        this.generated.set(true);
      },
      error: () => {
        this.error.set('Erro ao gerar plano alimentar. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  mealKcal(meal: { calories: number }): number { return meal.calories; }

  get planProtein(): number { return (this.plan()?.meals ?? []).reduce((s, m) => s + m.proteins, 0); }
  get planCarbs():   number { return (this.plan()?.meals ?? []).reduce((s, m) => s + m.carbs,    0); }
  get planFat():     number { return (this.plan()?.meals ?? []).reduce((s, m) => s + m.fats,     0); }

  regenerate(): void { this.generated.set(false); this.plan.set(null); }

  savePlan(): void {
    const plan = this.plan();
    if (!plan) { this.router.navigate(['/food-diary']); return; }

    this.loading.set(true);
    this.dietService.createPlan({
      name:           plan.name,
      goal:           this.mapGoal(this.form.value.goal ?? plan.goal),
      budget:         this.form.value.budget ?? '',
      restrictions:   this.selectedRestrictions().filter(r => r !== 'Nenhuma').join(', '),
      dailyCalories:  plan.dailyCalories ?? 0,
      isAiGenerated:  true,
      meals: (plan.meals ?? []).map(m => ({
        name:        m.name,
        time:        m.time,
        calories:    m.calories,
        proteins:    m.proteins,
        carbs:       m.carbs,
        fats:        m.fats,
        description: m.description,
      })),
    }).subscribe({
      next: () => this.router.navigate(['/food-diary']),
      error: () => {
        this.loading.set(false);
        this.error.set('Erro ao salvar plano. Tente novamente.');
      },
    });
  }

  /** Maps form goal value or AI free-text to a valid DietGoal enum name. */
  private mapGoal(raw: string): string {
    const lower = (raw ?? '').toLowerCase();
    if (/emagrec|perda|weight.?loss/.test(lower))           return 'WeightLoss';
    if (/hipertrofia|musculo|massa|muscle|gain/.test(lower)) return 'MuscleGain';
    if (/manutenc|maintenance/.test(lower))                  return 'WeightMaintenance';
    if (/saude|health|melhora/.test(lower))                  return 'HealthImprovement';
    // Enum names pass through untouched
    if (['WeightLoss','MuscleGain','WeightMaintenance','HealthImprovement'].includes(raw)) return raw;
    return 'HealthImprovement';
  }

  goBack(): void { this.router.navigate(['/food-diary']); }
}
