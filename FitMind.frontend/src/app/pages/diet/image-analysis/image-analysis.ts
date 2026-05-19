import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService } from '../../../services/food.service';
import { DietService } from '../../../services/diet.service';
import { DetectedFoodDto } from '../../../core/models/api.models';

interface DetectedFood extends DetectedFoodDto { editing: boolean; }

@Component({
  selector: 'app-image-analysis',
  imports: [FormsModule],
  templateUrl: './image-analysis.html',
  styleUrl: './image-analysis.scss',
})
export class ImageAnalysis {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  step          = signal<'upload' | 'analyzing' | 'result'>('upload');
  previewUrl    = signal<string | null>(null);
  analyzing     = signal(false);
  detectedFoods = signal<DetectedFood[]>([]);
  savedToCart   = signal(false);
  dragOver      = signal(false);
  error         = signal('');
  private selectedFile: File | null = null;

  get totals() {
    return this.detectedFoods().reduce(
      (acc, f) => ({ kcal: acc.kcal + f.calories, protein: acc.protein + f.protein, carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  constructor(private router: Router, private foodService: FoodService, private dietService: DietService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.loadFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.loadFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver.set(true); }

  private loadFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
      this.runAnalysis();
    };
    reader.readAsDataURL(file);
  }

  runAnalysis(): void {
    if (!this.selectedFile) return;
    this.step.set('analyzing');
    this.analyzing.set(true);
    this.error.set('');

    this.foodService.analyzeImage(this.selectedFile).subscribe({
      next: result => {
        this.detectedFoods.set(result.detectedFoods.map(f => ({ ...f, editing: false })));
        this.analyzing.set(false);
        this.step.set('result');
      },
      error: () => {
        this.error.set('Erro ao analisar imagem. Tente novamente.');
        this.analyzing.set(false);
        this.step.set('upload');
      },
    });
  }

  toggleEdit(index: number): void {
    this.detectedFoods.update(list => list.map((f, i) => i === index ? { ...f, editing: !f.editing } : f));
  }

  updateFood(index: number, field: keyof DetectedFood, value: string): void {
    this.detectedFoods.update(list =>
      list.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, [field]: field === 'name' ? value : Number(value) };
        if (field === 'grams') {
          const ratio = Number(value) / (f.grams || 1);
          updated.calories = Math.round(f.calories * ratio);
          updated.protein  = Math.round(f.protein  * ratio * 10) / 10;
          updated.carbs    = Math.round(f.carbs    * ratio * 10) / 10;
          updated.fat      = Math.round(f.fat      * ratio * 10) / 10;
        }
        return updated;
      })
    );
  }

  decreaseGrams(index: number, current: number): void { this.updateFood(index, 'grams', String(current > 10 ? current - 10 : current)); }
  increaseGrams(index: number, current: number): void { this.updateFood(index, 'grams', String(current + 10)); }
  removeFood(index: number): void { this.detectedFoods.update(list => list.filter((_, i) => i !== index)); }

  saveToMeal(): void {
    const dateStr = new Date().toISOString().split('T')[0];
    const items   = this.detectedFoods();
    let pending   = items.length;

    items.forEach(f => {
      this.dietService.logFood({
        date: dateStr, mealType: 'Lunch', foodName: f.name,
        quantity: f.grams, unit: 'g',
        calories: f.calories, proteins: f.protein, carbs: f.carbs, fats: f.fat,
      }).subscribe({
        next:  () => { pending--; if (!pending) { this.savedToCart.set(true); setTimeout(() => this.router.navigate(['/food-diary']), 1500); } },
        error: () => { pending--; if (!pending) { this.savedToCart.set(true); setTimeout(() => this.router.navigate(['/food-diary']), 1500); } },
      });
    });
  }

  retake(): void {
    this.step.set('upload'); this.previewUrl.set(null);
    this.detectedFoods.set([]); this.savedToCart.set(false); this.selectedFile = null;
  }

  triggerUpload(): void { this.fileInput.nativeElement.click(); }
  goBack():        void { this.router.navigate(['/food-diary']); }
}
