import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface DietMeal {
  name: string;
  time: string;
  foods: { item: string; amount: string; kcal: number; p: number; c: number; f: number }[];
}

interface DietPlan {
  totalKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: DietMeal[];
}

@Component({
  selector: 'app-diet-plan-generator',
  imports: [ReactiveFormsModule],
  templateUrl: './diet-plan-generator.html',
  styleUrl: './diet-plan-generator.scss',
})
export class DietPlanGenerator {
  form: FormGroup;
  loading = signal(false);
  generated = signal(false);
  plan = signal<DietPlan | null>(null);

  goals = [
    { value: 'emagrecer',   label: 'Emagrecer',   icon: 'local_fire_department' },
    { value: 'hipertrofia', label: 'Hipertrofia', icon: 'fitness_center' },
    { value: 'manutencao',  label: 'Manutenção',  icon: 'balance' },
    { value: 'saude',       label: 'Saúde Geral', icon: 'favorite' },
  ];

  restrictions = [
    'Lactose', 'Glúten', 'Vegano', 'Vegetariano',
    'Sem amendoim', 'Sem frutos do mar', 'Nenhuma',
  ];

  preferences = [
    'Frango', 'Carne vermelha', 'Peixe', 'Ovos',
    'Arroz/Massa', 'Saladas', 'Frutas', 'Proteína em pó',
  ];

  budgets = [
    { value: 'low',    label: 'Econômico',  sub: 'até R$300/mês',  icon: 'payments' },
    { value: 'medium', label: 'Moderado',   sub: 'R$300–600/mês',  icon: 'credit_card' },
    { value: 'high',   label: 'Sem limite', sub: 'acima de R$600', icon: 'diamond' },
  ];

  selectedRestrictions = signal<string[]>(['Nenhuma']);
  selectedPreferences = signal<string[]>([]);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      goal: ['emagrecer', Validators.required],
      budget: ['medium', Validators.required],
      mealsPerDay: [5, Validators.required],
    });
  }

  toggleRestriction(r: string): void {
    if (r === 'Nenhuma') { this.selectedRestrictions.set(['Nenhuma']); return; }
    const cur = this.selectedRestrictions().filter(x => x !== 'Nenhuma');
    const next = cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r];
    this.selectedRestrictions.set(next.length ? next : ['Nenhuma']);
  }

  togglePreference(p: string): void {
    const cur = this.selectedPreferences();
    this.selectedPreferences.set(
      cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]
    );
  }

  async generate(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    await new Promise(r => setTimeout(r, 2000));
    this.plan.set(this.mockPlan());
    this.loading.set(false);
    this.generated.set(true);
  }

  mealKcal(meal: DietMeal): number {
    return meal.foods.reduce((s, f) => s + f.kcal, 0);
  }

  regenerate(): void {
    this.generated.set(false);
    this.plan.set(null);
  }

  savePlan(): void {
    this.router.navigate(['/food-diary']);
  }

  goBack(): void {
    this.router.navigate(['/food-diary']);
  }

  private mockPlan(): DietPlan {
    const goal = this.form.value.goal;
    const kcal = goal === 'emagrecer' ? 1750 : goal === 'hipertrofia' ? 2800 : 2200;
    const protein = goal === 'hipertrofia' ? 180 : 130;
    const fat = Math.round(kcal * 0.25 / 9);
    const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);

    return {
      totalKcal: kcal, protein, carbs, fat,
      meals: [
        {
          name: 'Café da manhã', time: '07:00',
          foods: [
            { item: 'Ovos mexidos', amount: '3 unid.', kcal: 210, p: 18, c: 2, f: 14 },
            { item: 'Pão integral', amount: '2 fatias', kcal: 140, p: 5, c: 26, f: 2 },
            { item: 'Banana', amount: '1 média', kcal: 90, p: 1, c: 23, f: 0 },
          ],
        },
        {
          name: 'Lanche manhã', time: '10:00',
          foods: [
            { item: 'Iogurte grego', amount: '170g', kcal: 100, p: 17, c: 6, f: 0 },
            { item: 'Mix de nuts', amount: '30g', kcal: 180, p: 5, c: 6, f: 16 },
          ],
        },
        {
          name: 'Almoço', time: '12:30',
          foods: [
            { item: 'Frango grelhado', amount: '200g', kcal: 330, p: 62, c: 0, f: 7 },
            { item: 'Arroz integral', amount: '150g', kcal: 165, p: 3, c: 35, f: 1 },
            { item: 'Feijão carioca', amount: '80g', kcal: 90, p: 5, c: 16, f: 1 },
            { item: 'Salada verde', amount: 'À vontade', kcal: 20, p: 1, c: 3, f: 0 },
          ],
        },
        {
          name: 'Pré-treino', time: '16:00',
          foods: [
            { item: 'Whey protein', amount: '30g', kcal: 120, p: 25, c: 3, f: 1 },
            { item: 'Banana', amount: '1 média', kcal: 90, p: 1, c: 23, f: 0 },
          ],
        },
        {
          name: 'Jantar', time: '20:00',
          foods: [
            { item: 'Salmão', amount: '150g', kcal: 280, p: 39, c: 0, f: 13 },
            { item: 'Batata-doce', amount: '150g', kcal: 130, p: 2, c: 30, f: 0 },
            { item: 'Brócolis no vapor', amount: '100g', kcal: 35, p: 3, c: 7, f: 0 },
          ],
        },
      ],
    };
  }
}
