import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

interface FoodItem {
  id: number;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealEntry {
  id: number;
  name: string;
  time: string;
  icon: string;
  items: FoodItem[];
  expanded: boolean;
}

@Component({
  selector: 'app-food-diary',
  imports: [],
  templateUrl: './food-diary.html',
  styleUrl: './food-diary.scss',
})
export class FoodDiary {
  selectedDate = signal(new Date());
  showAddModal = signal(false);
  activeMealId = signal<number | null>(null);

  kcalGoal = 2000;
  proteinGoal = 150;
  carbsGoal = 220;
  fatGoal = 65;

  meals = signal<MealEntry[]>([
    {
      id: 1, name: 'Café da manhã', time: '07:30', icon: 'wb_sunny', expanded: true,
      items: [
        { id: 1, name: 'Ovos mexidos', amount: '3 unid.', kcal: 210, protein: 18, carbs: 2, fat: 14 },
        { id: 2, name: 'Pão integral', amount: '2 fatias', kcal: 140, protein: 5, carbs: 26, fat: 2 },
        { id: 3, name: 'Café com leite', amount: '200ml', kcal: 60, protein: 3, carbs: 8, fat: 2 },
      ],
    },
    {
      id: 2, name: 'Lanche da manhã', time: '10:00', icon: 'nutrition', expanded: false,
      items: [
        { id: 4, name: 'Iogurte grego', amount: '170g', kcal: 100, protein: 17, carbs: 6, fat: 0 },
        { id: 5, name: 'Granola', amount: '30g', kcal: 130, protein: 3, carbs: 22, fat: 4 },
      ],
    },
    {
      id: 3, name: 'Almoço', time: '12:30', icon: 'restaurant', expanded: true,
      items: [
        { id: 6, name: 'Frango grelhado', amount: '200g', kcal: 330, protein: 62, carbs: 0, fat: 7 },
        { id: 7, name: 'Arroz integral', amount: '150g', kcal: 165, protein: 3, carbs: 35, fat: 1 },
        { id: 8, name: 'Feijão', amount: '80g', kcal: 90, protein: 5, carbs: 16, fat: 1 },
        { id: 9, name: 'Salada', amount: 'À vontade', kcal: 20, protein: 1, carbs: 3, fat: 0 },
      ],
    },
    {
      id: 4, name: 'Lanche da tarde', time: '15:30', icon: 'local_cafe', expanded: false,
      items: [],
    },
    {
      id: 5, name: 'Jantar', time: '19:30', icon: 'dinner_dining', expanded: false,
      items: [],
    },
  ]);

  totals = computed(() => {
    const all = this.meals().flatMap(m => m.items);
    return {
      kcal:    all.reduce((s, f) => s + f.kcal,    0),
      protein: all.reduce((s, f) => s + f.protein, 0),
      carbs:   all.reduce((s, f) => s + f.carbs,   0),
      fat:     all.reduce((s, f) => s + f.fat,     0),
    };
  });

  mealKcal(meal: MealEntry): number {
    return meal.items.reduce((s, f) => s + f.kcal, 0);
  }

  pct(value: number, goal: number): number {
    return Math.min(Math.round((value / goal) * 100), 100);
  }

  toggleMeal(id: number): void {
    this.meals.update(list =>
      list.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m)
    );
  }

  openAdd(mealId: number): void {
    this.activeMealId.set(mealId);
    this.showAddModal.set(true);
  }

  closeAdd(): void {
    this.showAddModal.set(false);
    this.activeMealId.set(null);
  }

  addQuickFood(mealId: number): void {
    const newItem: FoodItem = {
      id: Date.now(),
      name: 'Alimento adicionado',
      amount: '100g',
      kcal: 150, protein: 10, carbs: 15, fat: 5,
    };
    this.meals.update(list =>
      list.map(m => m.id === mealId ? { ...m, items: [...m.items, newItem], expanded: true } : m)
    );
    this.closeAdd();
  }

  mealMacro(meal: MealEntry, key: 'protein' | 'carbs' | 'fat'): number {
    return meal.items.reduce((s, f) => s + f[key], 0);
  }

  removeFood(mealId: number, foodId: number): void {
    this.meals.update(list =>
      list.map(m => m.id === mealId
        ? { ...m, items: m.items.filter(f => f.id !== foodId) }
        : m
      )
    );
  }

  changeDate(offset: number): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + offset);
    this.selectedDate.set(d);
  }

  get dateLabel(): string {
    const d = this.selectedDate();
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  get isToday(): boolean {
    return this.selectedDate().toDateString() === new Date().toDateString();
  }

  goBack():          void { this.router.navigate(['/home']); }
  goDietPlan():      void { this.router.navigate(['/diet-plan']); }
  goImageAnalysis(): void { this.router.navigate(['/image-analysis']); }
  goManualMeal():    void { this.router.navigate(['/manual-meal']); }

  constructor(private router: Router) {}
}
