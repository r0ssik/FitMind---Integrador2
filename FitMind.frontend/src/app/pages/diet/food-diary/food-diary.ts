import { Component, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { SettingsService } from '../../../services/settings.service';
import { DietPlanDto, LogFoodEntryRequest } from '../../../core/models/api.models';

interface FoodItem {
  id: number; name: string; amount: string;
  kcal: number; protein: number; carbs: number; fat: number;
}

interface MealEntry {
  id: number; name: string; time: string; icon: string;
  mealType: string; items: FoodItem[]; expanded: boolean;
}

@Component({
  selector: 'app-food-diary',
  imports: [DatePipe],
  templateUrl: './food-diary.html',
  styleUrl: './food-diary.scss',
})
export class FoodDiary implements OnInit {
  activeTab    = signal<'diary' | 'plan'>('diary');
  selectedDate = signal(new Date());
  showAddModal = signal(false);
  activeMealId = signal<number | null>(null);
  saving       = signal(false);
  activePlan    = signal<DietPlanDto | null>(null);
  planHistory   = signal<DietPlanDto[]>([]);
  planLoading   = signal(false);
  showHistory   = signal(false);
  restoringId   = signal<string | null>(null);

  kcalGoal    = 2000;
  proteinGoal = 150;
  carbsGoal   = 220;
  fatGoal     = 65;

  meals = signal<MealEntry[]>([
    { id: 1, name: 'Café da manhã',   time: '07:30', icon: 'wb_sunny',      mealType: 'Breakfast', items: [], expanded: true  },
    { id: 2, name: 'Lanche da manhã', time: '10:00', icon: 'nutrition',      mealType: 'MorningSnack', items: [], expanded: false },
    { id: 3, name: 'Almoço',          time: '12:30', icon: 'restaurant',     mealType: 'Lunch',     items: [], expanded: true  },
    { id: 4, name: 'Lanche da tarde', time: '15:30', icon: 'local_cafe',     mealType: 'AfternoonSnack', items: [], expanded: false },
    { id: 5, name: 'Jantar',          time: '19:30', icon: 'dinner_dining',  mealType: 'Dinner',    items: [], expanded: false },
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

  constructor(
    private router: Router,
    private dietService: DietService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: s => {
        if (s.calorieGoal) this.kcalGoal = s.calorieGoal;
      },
      error: () => {},
    });
    this.loadDiary();
    this.loadActivePlan();
  }

  private loadActivePlan(): void {
    this.planLoading.set(true);
    this.dietService.getActivePlan().subscribe({
      next: plan => { this.activePlan.set(plan); this.planLoading.set(false); },
      error: ()   => { this.activePlan.set(null); this.planLoading.set(false); },
    });
    this.dietService.getHistory().subscribe({
      next: plans => this.planHistory.set(plans),
      error: ()   => {},
    });
  }

  restorePlan(planId: string): void {
    this.restoringId.set(planId);
    this.dietService.activatePlan(planId).subscribe({
      next: () => {
        this.restoringId.set(null);
        this.showHistory.set(false);
        this.loadActivePlan();
      },
      error: () => this.restoringId.set(null),
    });
  }

  get inactivePlans(): DietPlanDto[] {
    const active = this.activePlan();
    return this.planHistory().filter(p => !active || p.id !== active.id);
  }

  get planTotalCalories(): number {
    return this.activePlan()?.dailyCalories ?? 0;
  }

  get planTotalProtein(): number {
    return Math.round((this.activePlan()?.meals ?? []).reduce((s, m) => s + m.proteins, 0));
  }

  get planTotalCarbs(): number {
    return Math.round((this.activePlan()?.meals ?? []).reduce((s, m) => s + m.carbs, 0));
  }

  get planTotalFat(): number {
    return Math.round((this.activePlan()?.meals ?? []).reduce((s, m) => s + m.fats, 0));
  }

  private loadDiary(): void {
    const dateStr = this.formatDateParam(this.selectedDate());
    this.dietService.getDiary(dateStr).subscribe({
      next: entries => {
        // Group entries by mealType
        this.meals.update(list => list.map(m => ({
          ...m,
          items: entries
            .filter(e => e.mealType === m.mealType)
            .map((e, i) => ({
              id: i + 1,
              name: e.foodName, amount: `${e.quantity}${e.unit}`,
              kcal: e.calories, protein: e.proteins, carbs: e.carbs, fat: e.fats,
            })),
        })));
      },
      error: () => {},
    });
  }

  mealKcal(meal: MealEntry): number { return meal.items.reduce((s, f) => s + f.kcal, 0); }
  mealMacro(meal: MealEntry, key: 'protein' | 'carbs' | 'fat'): number {
    return meal.items.reduce((s, f) => s + f[key], 0);
  }
  pct(value: number, goal: number): number { return Math.min(Math.round((value / goal) * 100), 100); }

  toggleMeal(id: number): void {
    this.meals.update(list => list.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  }

  openAdd(mealId: number): void {
    this.activeMealId.set(mealId);
    this.showAddModal.set(true);
  }

  closeAdd(): void { this.showAddModal.set(false); this.activeMealId.set(null); }

  addQuickFood(mealId: number): void {
    const meal = this.meals().find(m => m.id === mealId);
    if (!meal) return;
    this.saving.set(true);
    const body: LogFoodEntryRequest = {
      date: this.formatDateParam(this.selectedDate()),
      mealType: meal.mealType,
      foodName: 'Alimento adicionado', quantity: 100, unit: 'g',
      calories: 150, proteins: 10, carbs: 15, fats: 5,
    };
    this.dietService.logFood(body).subscribe({
      next: () => {
        const newItem: FoodItem = {
          id: Date.now(), name: body.foodName, amount: '100g',
          kcal: 150, protein: 10, carbs: 15, fat: 5,
        };
        this.meals.update(list => list.map(m =>
          m.id === mealId ? { ...m, items: [...m.items, newItem], expanded: true } : m
        ));
        this.saving.set(false);
        this.closeAdd();
      },
      error: () => { this.saving.set(false); this.closeAdd(); },
    });
  }

  removeFood(mealId: number, foodId: number): void {
    this.meals.update(list => list.map(m =>
      m.id === mealId ? { ...m, items: m.items.filter(f => f.id !== foodId) } : m
    ));
  }

  changeDate(offset: number): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + offset);
    this.selectedDate.set(d);
    this.loadDiary();
  }

  get dateLabel(): string {
    const d = this.selectedDate();
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  get isToday(): boolean { return this.selectedDate().toDateString() === new Date().toDateString(); }

  private formatDateParam(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  goBack():          void { this.router.navigate(['/home']); }
  goDietPlan():      void { this.router.navigate(['/diet-plan']); }
  goImageAnalysis(): void { this.router.navigate(['/image-analysis']); }
  goManualMeal():    void { this.router.navigate(['/manual-meal']); }
}
