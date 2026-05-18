import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FoodResult {
  id: number;
  name: string;
  brand?: string;
  per100g: { kcal: number; protein: number; carbs: number; fat: number };
  commonPortions: { label: string; grams: number }[];
}

interface CartItem {
  food: FoodResult;
  grams: number;
  portionLabel: string;
}

const FOOD_DATABASE: FoodResult[] = [
  {
    id: 1, name: 'Frango grelhado', brand: 'Genérico',
    per100g: { kcal: 165, protein: 31, carbs: 0, fat: 4 },
    commonPortions: [{ label: 'Filé médio (120g)', grams: 120 }, { label: 'Filé grande (200g)', grams: 200 }],
  },
  {
    id: 2, name: 'Arroz branco cozido', brand: 'Genérico',
    per100g: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    commonPortions: [{ label: 'Colher (45g)', grams: 45 }, { label: 'Porção (150g)', grams: 150 }],
  },
  {
    id: 3, name: 'Arroz integral cozido', brand: 'Genérico',
    per100g: { kcal: 111, protein: 2.6, carbs: 23, fat: 0.9 },
    commonPortions: [{ label: 'Colher (45g)', grams: 45 }, { label: 'Porção (150g)', grams: 150 }],
  },
  {
    id: 4, name: 'Feijão carioca cozido', brand: 'Genérico',
    per100g: { kcal: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
    commonPortions: [{ label: 'Concha (80g)', grams: 80 }, { label: 'Porção (160g)', grams: 160 }],
  },
  {
    id: 5, name: 'Ovo inteiro', brand: 'Genérico',
    per100g: { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
    commonPortions: [{ label: 'Unidade pequena (50g)', grams: 50 }, { label: 'Unidade grande (60g)', grams: 60 }],
  },
  {
    id: 6, name: 'Banana', brand: 'Genérico',
    per100g: { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    commonPortions: [{ label: 'Unidade pequena (80g)', grams: 80 }, { label: 'Unidade média (110g)', grams: 110 }],
  },
  {
    id: 7, name: 'Batata-doce cozida', brand: 'Genérico',
    per100g: { kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    commonPortions: [{ label: 'Porção (100g)', grams: 100 }, { label: 'Porção (200g)', grams: 200 }],
  },
  {
    id: 8, name: 'Whey Protein', brand: 'Growth',
    per100g: { kcal: 400, protein: 80, carbs: 10, fat: 5 },
    commonPortions: [{ label: 'Scoop (30g)', grams: 30 }],
  },
  {
    id: 9, name: 'Iogurte grego integral', brand: 'Fage',
    per100g: { kcal: 97, protein: 9, carbs: 3.6, fat: 5 },
    commonPortions: [{ label: 'Pote 100g', grams: 100 }, { label: 'Pote 170g', grams: 170 }],
  },
  {
    id: 10, name: 'Pão integral', brand: 'Wickbold',
    per100g: { kcal: 243, protein: 9, carbs: 42, fat: 4 },
    commonPortions: [{ label: 'Fatia (25g)', grams: 25 }, { label: '2 fatias (50g)', grams: 50 }],
  },
  {
    id: 11, name: 'Salmão grelhado', brand: 'Genérico',
    per100g: { kcal: 208, protein: 20, carbs: 0, fat: 13 },
    commonPortions: [{ label: 'Filé médio (130g)', grams: 130 }, { label: 'Filé grande (180g)', grams: 180 }],
  },
  {
    id: 12, name: 'Aveia em flocos', brand: 'Quaker',
    per100g: { kcal: 389, protein: 17, carbs: 66, fat: 7 },
    commonPortions: [{ label: 'Colher (30g)', grams: 30 }, { label: 'Porção (50g)', grams: 50 }],
  },
  {
    id: 13, name: 'Maçã', brand: 'Genérico',
    per100g: { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    commonPortions: [{ label: 'Unidade (150g)', grams: 150 }],
  },
  {
    id: 14, name: 'Amendoim torrado', brand: 'Genérico',
    per100g: { kcal: 567, protein: 26, carbs: 16, fat: 49 },
    commonPortions: [{ label: 'Punhado (30g)', grams: 30 }],
  },
  {
    id: 15, name: 'Leite desnatado', brand: 'Genérico',
    per100g: { kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
    commonPortions: [{ label: 'Copo (200ml)', grams: 200 }],
  },
];

@Component({
  selector: 'app-manual-meal',
  imports: [FormsModule],
  templateUrl: './manual-meal.html',
  styleUrl: './manual-meal.scss',
})
export class ManualMeal {
  query = signal('');
  selectedFood = signal<FoodResult | null>(null);
  grams = signal(100);
  portionLabel = signal('100g');
  cart = signal<CartItem[]>([]);
  mealName = signal('Almoço');

  mealOptions = ['Café da manhã', 'Lanche manhã', 'Almoço', 'Lanche tarde', 'Jantar', 'Ceia'];

  searchResults = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (q.length < 2) return [];
    return FOOD_DATABASE.filter(f =>
      f.name.toLowerCase().includes(q) || (f.brand?.toLowerCase().includes(q) ?? false)
    ).slice(0, 8);
  });

  macros = computed(() => {
    const f = this.selectedFood();
    if (!f) return null;
    const ratio = this.grams() / 100;
    return {
      kcal:    Math.round(f.per100g.kcal    * ratio),
      protein: Math.round(f.per100g.protein * ratio * 10) / 10,
      carbs:   Math.round(f.per100g.carbs   * ratio * 10) / 10,
      fat:     Math.round(f.per100g.fat     * ratio * 10) / 10,
    };
  });

  cartTotals = computed(() => {
    const items = this.cart();
    const ratio = (item: CartItem) => item.grams / 100;
    return {
      kcal:    Math.round(items.reduce((s, i) => s + i.food.per100g.kcal    * ratio(i), 0)),
      protein: Math.round(items.reduce((s, i) => s + i.food.per100g.protein * ratio(i), 0) * 10) / 10,
      carbs:   Math.round(items.reduce((s, i) => s + i.food.per100g.carbs   * ratio(i), 0) * 10) / 10,
      fat:     Math.round(items.reduce((s, i) => s + i.food.per100g.fat     * ratio(i), 0) * 10) / 10,
    };
  });

  selectFood(food: FoodResult): void {
    this.selectedFood.set(food);
    this.query.set(food.name);
    if (food.commonPortions.length > 0) {
      this.applyPortion(food.commonPortions[0]);
    } else {
      this.grams.set(100);
      this.portionLabel.set('100g');
    }
  }

  applyPortion(p: { label: string; grams: number }): void {
    this.grams.set(p.grams);
    this.portionLabel.set(p.label);
  }

  addToCart(): void {
    const food = this.selectedFood();
    if (!food) return;
    this.cart.update(c => [
      ...c,
      { food, grams: this.grams(), portionLabel: this.portionLabel() },
    ]);
    this.query.set('');
    this.selectedFood.set(null);
    this.grams.set(100);
  }

  removeFromCart(index: number): void {
    this.cart.update(c => c.filter((_, i) => i !== index));
  }

  itemMacros(item: CartItem) {
    const r = item.grams / 100;
    return {
      kcal:    Math.round(item.food.per100g.kcal    * r),
      protein: Math.round(item.food.per100g.protein * r * 10) / 10,
      carbs:   Math.round(item.food.per100g.carbs   * r * 10) / 10,
      fat:     Math.round(item.food.per100g.fat     * r * 10) / 10,
    };
  }

  save(): void {
    this.router.navigate(['/food-diary']);
  }

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/food-diary']);
  }
}
