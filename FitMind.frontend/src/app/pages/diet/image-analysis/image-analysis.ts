import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DetectedFood {
  name: string;
  confidence: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  editing: boolean;
}

@Component({
  selector: 'app-image-analysis',
  imports: [FormsModule],
  templateUrl: './image-analysis.html',
  styleUrl: './image-analysis.scss',
})
export class ImageAnalysis {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  step = signal<'upload' | 'analyzing' | 'result'>('upload');
  previewUrl = signal<string | null>(null);
  analyzing = signal(false);
  detectedFoods = signal<DetectedFood[]>([]);
  savedToCart = signal(false);
  dragOver = signal(false);

  mockResults: DetectedFood[][] = [
    [
      { name: 'Frango grelhado', confidence: 94, grams: 180, kcal: 297, protein: 56, carbs: 0, fat: 7, editing: false },
      { name: 'Arroz branco', confidence: 88, grams: 150, kcal: 195, protein: 4, carbs: 42, fat: 0, editing: false },
      { name: 'Salada verde', confidence: 76, grams: 80, kcal: 18, protein: 1, carbs: 3, fat: 0, editing: false },
    ],
    [
      { name: 'Omelete', confidence: 91, grams: 120, kcal: 196, protein: 15, carbs: 2, fat: 14, editing: false },
      { name: 'Pão integral', confidence: 82, grams: 50, kcal: 121, protein: 5, carbs: 21, fat: 2, editing: false },
    ],
    [
      { name: 'Whey shake', confidence: 89, grams: 300, kcal: 180, protein: 30, carbs: 8, fat: 3, editing: false },
      { name: 'Banana', confidence: 97, grams: 110, kcal: 98, protein: 1, carbs: 25, fat: 0, editing: false },
    ],
  ];

  get totals() {
    return this.detectedFoods().reduce(
      (acc, f) => ({
        kcal:    acc.kcal    + f.kcal,
        protein: acc.protein + f.protein,
        carbs:   acc.carbs   + f.carbs,
        fat:     acc.fat     + f.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  private loadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
      this.runAnalysis();
    };
    reader.readAsDataURL(file);
  }

  runAnalysis(): void {
    this.step.set('analyzing');
    this.analyzing.set(true);
    setTimeout(() => {
      const pick = this.mockResults[Math.floor(Math.random() * this.mockResults.length)];
      this.detectedFoods.set(pick.map(f => ({ ...f })));
      this.analyzing.set(false);
      this.step.set('result');
    }, 2800);
  }

  toggleEdit(index: number): void {
    this.detectedFoods.update(list =>
      list.map((f, i) => i === index ? { ...f, editing: !f.editing } : f)
    );
  }

  updateFood(index: number, field: keyof DetectedFood, value: string): void {
    this.detectedFoods.update(list =>
      list.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, [field]: field === 'name' ? value : Number(value) };
        if (field === 'grams') {
          const ratio = Number(value) / (f.grams || 1);
          updated.kcal    = Math.round(f.kcal    * ratio);
          updated.protein = Math.round(f.protein * ratio * 10) / 10;
          updated.carbs   = Math.round(f.carbs   * ratio * 10) / 10;
          updated.fat     = Math.round(f.fat     * ratio * 10) / 10;
        }
        return updated;
      })
    );
  }

  decreaseGrams(index: number, current: number): void {
    this.updateFood(index, 'grams', String(current > 10 ? current - 10 : current));
  }

  increaseGrams(index: number, current: number): void {
    this.updateFood(index, 'grams', String(current + 10));
  }

  removeFood(index: number): void {
    this.detectedFoods.update(list => list.filter((_, i) => i !== index));
  }

  saveToMeal(): void {
    this.savedToCart.set(true);
    setTimeout(() => this.router.navigate(['/food-diary']), 1500);
  }

  retake(): void {
    this.step.set('upload');
    this.previewUrl.set(null);
    this.detectedFoods.set([]);
    this.savedToCart.set(false);
  }

  triggerUpload(): void {
    this.fileInput.nativeElement.click();
  }

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/food-diary']);
  }
}
