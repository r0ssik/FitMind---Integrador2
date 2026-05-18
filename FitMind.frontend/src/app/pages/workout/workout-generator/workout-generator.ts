import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tip: string;
}

interface GeneratedDay {
  day: string;
  focus: string;
  exercises: GeneratedExercise[];
}

@Component({
  selector: 'app-workout-generator',
  imports: [ReactiveFormsModule],
  templateUrl: './workout-generator.html',
  styleUrl: './workout-generator.scss',
})
export class WorkoutGenerator {
  form: FormGroup;
  loading = signal(false);
  generated = signal(false);
  generatedPlan = signal<GeneratedDay[] | null>(null);

  locations = [
    { value: 'academia',  label: 'Academia',    icon: 'fitness_center' },
    { value: 'casa',      label: 'Em casa',     icon: 'home' },
    { value: 'ar_livre',  label: 'Ao ar livre', icon: 'park' },
    { value: 'funcional', label: 'Funcional',   icon: 'bolt' },
  ];

  preferences = [
    'Musculação', 'Cardio', 'HIIT', 'Funcional', 'Calistenia', 'Yoga', 'Pilates',
  ];

  limitations = [
    'Joelho', 'Coluna', 'Ombro', 'Tornozelo', 'Punho', 'Nenhuma',
  ];

  selectedPrefs = signal<string[]>([]);
  selectedLimitations = signal<string[]>(['Nenhuma']);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      daysPerWeek: [4, [Validators.required, Validators.min(1), Validators.max(6)]],
      timePerSession: [60, Validators.required],
      location: ['academia', Validators.required],
    });
  }

  togglePref(p: string): void {
    const current = this.selectedPrefs();
    this.selectedPrefs.set(
      current.includes(p) ? current.filter(x => x !== p) : [...current, p]
    );
  }

  toggleLimitation(l: string): void {
    if (l === 'Nenhuma') {
      this.selectedLimitations.set(['Nenhuma']);
      return;
    }
    const current = this.selectedLimitations().filter(x => x !== 'Nenhuma');
    this.selectedLimitations.set(
      current.includes(l) ? current.filter(x => x !== l) : [...current, l]
    );
    if (this.selectedLimitations().length === 0) this.selectedLimitations.set(['Nenhuma']);
  }

  async generate(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    await new Promise(r => setTimeout(r, 2200));

    const days = this.form.value.daysPerWeek;
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const focuses = ['Peito + Tríceps', 'Costas + Bíceps', 'Perna', 'Ombro + Core', 'Full Body', 'Cardio + Abdômen'];

    const plan: GeneratedDay[] = Array.from({ length: days }, (_, i) => ({
      day: dayNames[i],
      focus: focuses[i % focuses.length],
      exercises: this.mockExercises(focuses[i % focuses.length]),
    }));

    this.generatedPlan.set(plan);
    this.loading.set(false);
    this.generated.set(true);
  }

  private mockExercises(focus: string): GeneratedExercise[] {
    const map: Record<string, GeneratedExercise[]> = {
      'Peito + Tríceps': [
        { name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s', tip: 'Mantenha as escápulas retraídas' },
        { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '75s', tip: 'Ângulo de 30-45° no banco' },
        { name: 'Crossover', sets: 3, reps: '12-15', rest: '60s', tip: 'Foque na contração peitoral' },
        { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60s', tip: 'Cotovelos fixos ao corpo' },
        { name: 'Tríceps Testa', sets: 3, reps: '10-12', rest: '60s', tip: 'Movimento controlado' },
      ],
      'Costas + Bíceps': [
        { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s', tip: 'Puxe pela cotovela, não pela mão' },
        { name: 'Remada Curvada', sets: 4, reps: '8-12', rest: '90s', tip: 'Costas neutras, core ativado' },
        { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest: '75s', tip: 'Rotação do tronco no final' },
        { name: 'Rosca Direta', sets: 3, reps: '10-12', rest: '60s', tip: 'Sem balanço do tronco' },
        { name: 'Rosca Martelo', sets: 3, reps: '12', rest: '60s', tip: 'Ativa braquial e braquiorradial' },
      ],
      'Perna': [
        { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest: '120s', tip: 'Joelhos alinhados com os pés' },
        { name: 'Leg Press 45°', sets: 4, reps: '12-15', rest: '90s', tip: 'Não trave os joelhos no topo' },
        { name: 'Cadeira Extensora', sets: 3, reps: '15', rest: '60s', tip: 'Isometria no topo por 1s' },
        { name: 'Mesa Flexora', sets: 3, reps: '12-15', rest: '60s', tip: 'Quadril fixo no banco' },
        { name: 'Panturrilha em Pé', sets: 4, reps: '20', rest: '45s', tip: 'Amplitude máxima de movimento' },
      ],
      'Ombro + Core': [
        { name: 'Desenvolvimento com Halteres', sets: 4, reps: '10-12', rest: '90s', tip: 'Não bloqueie no topo' },
        { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest: '60s', tip: 'Cotovelo levemente flexionado' },
        { name: 'Face Pull', sets: 3, reps: '15', rest: '60s', tip: 'Excelente para saúde do ombro' },
        { name: 'Prancha', sets: 3, reps: '45s', rest: '45s', tip: 'Glúteos e core sempre ativados' },
        { name: 'Crunch', sets: 3, reps: '20', rest: '45s', tip: 'Expiração na contração' },
      ],
      'Full Body': [
        { name: 'Agachamento', sets: 3, reps: '12', rest: '75s', tip: 'Movimento completo' },
        { name: 'Flexão de Braço', sets: 3, reps: '10-15', rest: '60s', tip: 'Core ativado' },
        { name: 'Remada com Elástico', sets: 3, reps: '12', rest: '60s', tip: 'Cotovelos para trás' },
        { name: 'Afundo', sets: 3, reps: '10 cada', rest: '60s', tip: 'Joelho não ultrapassa o pé' },
        { name: 'Prancha', sets: 3, reps: '40s', rest: '45s', tip: 'Respire normalmente' },
      ],
      'Cardio + Abdômen': [
        { name: 'Corrida/Esteira', sets: 1, reps: '20min', rest: '-', tip: 'Pace moderado (zona 2)' },
        { name: 'Burpee', sets: 4, reps: '10', rest: '60s', tip: 'Explosão na subida' },
        { name: 'Mountain Climber', sets: 3, reps: '30s', rest: '45s', tip: 'Quadril estável' },
        { name: 'Abdominal Infra', sets: 3, reps: '15', rest: '45s', tip: 'Lombar no chão' },
        { name: 'Pulo de Corda', sets: 5, reps: '1min', rest: '30s', tip: 'Aterrissar na ponta dos pés' },
      ],
    };
    return map[focus] ?? map['Full Body'];
  }

  savePlan(): void {
    this.router.navigate(['/workout-plans']);
  }

  regenerate(): void {
    this.generated.set(false);
    this.generatedPlan.set(null);
  }

  goBack(): void {
    this.router.navigate(['/workout-plans']);
  }
}
