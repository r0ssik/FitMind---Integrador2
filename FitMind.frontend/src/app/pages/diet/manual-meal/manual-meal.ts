import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService } from '../../../services/food.service';
import { DietService } from '../../../services/diet.service';
import { FoodItemDto } from '../../../core/models/api.models';

interface CartItem { food: FoodItemDto; grams: number; portionLabel: string; }

@Component({
  selector: 'app-manual-meal',
  imports: [FormsModule],
  templateUrl: './manual-meal.html',
  styleUrl: './manual-meal.scss',
})
export class ManualMeal implements OnInit {
  query         = signal('');
  selectedFood  = signal<FoodItemDto | null>(null);
  grams         = signal(100);
  portionLabel  = signal('100g');
  cart          = signal<CartItem[]>([]);
  mealName      = signal('Almoço');
  saving        = signal(false);
  searchResults = signal<FoodItemDto[]>([]);
  searching     = signal(false);

  mealOptions = ['Café da manhã', 'Lanche manhã', 'Almoço', 'Lanche tarde', 'Jantar', 'Ceia'];

  mealTypeMap: Record<string, string> = {
    'Café da manhã': 'Breakfast', 'Lanche manhã': 'MorningSnack',
    'Almoço': 'Lunch', 'Lanche tarde': 'AfternoonSnack',
    'Jantar': 'Dinner', 'Ceia': 'Supper',
  };

  macros = computed(() => {
    const f = this.selectedFood();
    if (!f) return null;
    const ratio = this.grams() / 100;
    return {
      kcal:    Math.round(f.caloriesPer100g  * ratio),
      protein: Math.round(f.proteinPer100g   * ratio * 10) / 10,
      carbs:   Math.round(f.carbsPer100g     * ratio * 10) / 10,
      fat:     Math.round(f.fatsPer100g      * ratio * 10) / 10,
    };
  });

  cartTotals = computed(() => {
    const items = this.cart();
    const r = (i: CartItem) => i.grams / 100;
    return {
      kcal:    Math.round(items.reduce((s, i) => s + i.food.caloriesPer100g  * r(i), 0)),
      protein: Math.round(items.reduce((s, i) => s + i.food.proteinPer100g   * r(i), 0) * 10) / 10,
      carbs:   Math.round(items.reduce((s, i) => s + i.food.carbsPer100g     * r(i), 0) * 10) / 10,
      fat:     Math.round(items.reduce((s, i) => s + i.food.fatsPer100g      * r(i), 0) * 10) / 10,
    };
  });

  constructor(
    private router: Router,
    private foodService: FoodService,
    private dietService: DietService,
  ) {}

  ngOnInit(): void {}

  onQueryChange(q: string): void {
    this.query.set(q);
    if (q.length < 2) { this.searchResults.set([]); return; }
    this.searching.set(true);
    this.foodService.search(q).subscribe({
      next:  results => { this.searchResults.set(results.slice(0, 8)); this.searching.set(false); },
      error: ()       => this.searching.set(false),
    });
  }

  selectFood(food: FoodItemDto): void {
    this.selectedFood.set(food);
    this.query.set(food.name);
    this.searchResults.set([]);
    if (food.commonPortions.length > 0) {
      this.applyPortion(food.commonPortions[0]);
    } else {
      this.grams.set(100); this.portionLabel.set('100g');
    }
  }

  applyPortion(p: { label: string; grams: number }): void {
    this.grams.set(p.grams); this.portionLabel.set(p.label);
  }

  addToCart(): void {
    const food = this.selectedFood();
    if (!food) return;
    this.cart.update(c => [...c, { food, grams: this.grams(), portionLabel: this.portionLabel() }]);
    this.query.set(''); this.selectedFood.set(null); this.grams.set(100);
  }

  removeFromCart(index: number): void {
    this.cart.update(c => c.filter((_, i) => i !== index));
  }

  itemMacros(item: CartItem) {
    const r = item.grams / 100;
    return {
      kcal:    Math.round(item.food.caloriesPer100g  * r),
      protein: Math.round(item.food.proteinPer100g   * r * 10) / 10,
      carbs:   Math.round(item.food.carbsPer100g     * r * 10) / 10,
      fat:     Math.round(item.food.fatsPer100g      * r * 10) / 10,
    };
  }

  save(): void {
    const items = this.cart();
    if (!items.length) { this.router.navigate(['/food-diary']); return; }
    this.saving.set(true);
    const mealType = this.mealTypeMap[this.mealName()] ?? 'Lunch';
    const dateStr  = new Date().toISOString().split('T')[0];
    let pending = items.length;

    items.forEach(item => {
      const m = this.itemMacros(item);
      this.dietService.logFood({
        date: dateStr, mealType, foodName: item.food.name,
        quantity: item.grams, unit: 'g',
        calories: m.kcal, proteins: m.protein, carbs: m.carbs, fats: m.fat,
      }).subscribe({
        next:  () => { pending--; if (!pending) { this.saving.set(false); this.router.navigate(['/food-diary']); } },
        error: () => { pending--; if (!pending) { this.saving.set(false); this.router.navigate(['/food-diary']); } },
      });
    });
  }

  goBack(): void { this.router.navigate(['/food-diary']); }
}
