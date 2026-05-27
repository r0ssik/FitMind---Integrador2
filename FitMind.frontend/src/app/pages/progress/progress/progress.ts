import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';
import { UserService } from '../../../services/user.service';
import { ChartDataDto, ProgressStatsDto } from '../../../core/models/api.models';

type Period = '7d' | '30d' | '3m';

interface HealthInsight {
  score: number;           // 0–100
  scoreLabel: string;      // Excelente / Bom / Regular / Atenção
  scoreColor: string;
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  highlights: { icon: string; text: string; type: 'good' | 'warn' | 'neutral' }[];
  recommendation: string;
  analysisDate: string;
}

@Component({
  selector: 'app-progress',
  imports: [FormsModule],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress implements OnInit {
  constructor(
    private router: Router,
    private progressService: ProgressService,
    private userService: UserService,
  ) {}

  period  = signal<Period>('30d');
  loading = signal(true);
  private chartData = signal<ChartDataDto | null>(null);

  // ── Stats e perfil ────────────────────────────────────────────────────────────
  stats          = signal<ProgressStatsDto | null>(null);
  userHeight     = signal<number>(0);
  userWeight     = signal<number>(0);

  // ── Edição de altura ──────────────────────────────────────────────────────────
  editingHeight  = signal(false);
  heightInput    = signal<number>(0);
  savingHeight   = signal(false);
  heightSaved    = signal(false);

  // ── Análise de saúde ──────────────────────────────────────────────────────────
  insight        = signal<HealthInsight | null>(null);
  insightLoading = signal(false);

  // ── Filtered data ─────────────────────────────────────────────────────────────
  weightData = computed(() => {
    const d = this.chartData();
    if (!d) return [];
    return this.sliceLast(d.weightHistory, this.pointsFor(this.period()));
  });

  measData = computed(() => {
    const d = this.chartData();
    if (!d) return [];
    return this.sliceLast(d.measurementHistory, this.pointsFor(this.period(), 6));
  });

  workoutData = computed(() => {
    const d = this.chartData();
    if (!d) return [];
    return this.sliceLast(d.workoutBars, this.pointsFor(this.period()));
  });

  // ── Summary stats ─────────────────────────────────────────────────────────────
  weightChange = computed(() => {
    const d = this.weightData();
    if (d.length < 2) return 0;
    return +(d[d.length - 1].value - d[0].value).toFixed(1);
  });

  totalWorkouts = computed(() => this.workoutData().length);

  avgDuration = computed(() => {
    const d = this.workoutData();
    if (!d.length) return 0;
    return Math.round(d.reduce((s, w) => s + w.durationMinutes, 0) / d.length);
  });

  waistChange = computed(() => {
    const d = this.measData();
    if (d.length < 2) return 0;
    return +((d[d.length - 1].waist ?? 0) - (d[0].waist ?? 0)).toFixed(1);
  });

  // ── SVG helpers ───────────────────────────────────────────────────────────────
  readonly W = 320;
  readonly H = 120;
  readonly PAD = { top: 10, right: 12, bottom: 28, left: 36 };

  linePoints(values: number[]): string {
    if (!values.length) return '';
    const min = Math.min(...values), max = Math.max(...values), rng = max - min || 1;
    const w = this.W - this.PAD.left - this.PAD.right;
    const h = this.H - this.PAD.top  - this.PAD.bottom;
    return values.map((v, i) => {
      const x = this.PAD.left + (i / (values.length - 1 || 1)) * w;
      const y = this.PAD.top  + h - ((v - min) / rng) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  areaPath(values: number[]): string {
    if (!values.length) return '';
    const pts  = this.linePoints(values).split(' ');
    const last = pts[pts.length - 1].split(',');
    const first = pts[0].split(',');
    const bottom = this.PAD.top + this.H - this.PAD.top - this.PAD.bottom;
    return `M${first[0]},${bottom} L${pts.join(' L')} L${last[0]},${bottom} Z`;
  }

  xLabels(labels: string[], step: number): { x: number; label: string }[] {
    const w = this.W - this.PAD.left - this.PAD.right;
    return labels.filter((_, i) => i % step === 0 || i === labels.length - 1)
      .map(label => ({ x: this.PAD.left + (labels.indexOf(label) / (labels.length - 1 || 1)) * w, label }));
  }

  yLabels(values: number[], count = 4): { y: number; label: string }[] {
    const min = Math.min(...values), max = Math.max(...values), rng = max - min || 1;
    const h = this.H - this.PAD.top - this.PAD.bottom;
    return Array.from({ length: count }, (_, i) => {
      const frac = i / (count - 1);
      return { y: +(this.PAD.top + h - frac * h).toFixed(1), label: (min + frac * rng).toFixed(rng < 5 ? 1 : 0) };
    });
  }

  barRects(values: number[]): { x: number; y: number; w: number; h: number; value: number }[] {
    const max = Math.max(...values, 1);
    const W = this.W - this.PAD.left - this.PAD.right;
    const H = this.H - this.PAD.top  - this.PAD.bottom;
    const barW = Math.max(4, W / values.length - 3);
    return values.map((v, i) => {
      const barH = (v / max) * H;
      return {
        x: +(this.PAD.left + (i / values.length) * W + (W / values.length - barW) / 2).toFixed(1),
        y: +(this.PAD.top  + H - barH).toFixed(1),
        w: +barW.toFixed(1), h: +barH.toFixed(1), value: v,
      };
    });
  }

  // ── Computed chart data ───────────────────────────────────────────────────────
  weightValues  = computed(() => this.weightData().map(d => d.value));
  weightLabels  = computed(() => this.weightData().map(d => this.shortDate(d.date)));

  waistValues   = computed(() => this.measData().map(d => d.waist ?? 0));
  hipValues     = computed(() => this.measData().map(d => d.hip   ?? 0));
  chestValues   = computed(() => this.measData().map(d => d.chest ?? 0));
  measLabels    = computed(() => this.measData().map(d => this.shortDate(d.date)));

  durationValues = computed(() => this.workoutData().map(d => d.durationMinutes));
  workoutLabels  = computed(() => this.workoutData().map(d => d.label));

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadChartData();
    this.loadStatsAndProfile();
  }

  onPeriodChange(p: Period): void { this.period.set(p); this.loadChartData(); }

  private loadChartData(): void {
    this.loading.set(true);
    this.progressService.getChartData(this.period()).subscribe({
      next:  d => { this.chartData.set(d as ChartDataDto); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private loadStatsAndProfile(): void {
    this.progressService.getStats().subscribe({
      next: s => {
        this.stats.set(s);
        if (s.currentWeight) this.userWeight.set(s.currentWeight);
      },
      error: () => {},
    });

    this.userService.getMe().subscribe({
      next: u => {
        this.userHeight.set(u.height ?? 0);
        this.heightInput.set(u.height ?? 0);
        if (u.weight) this.userWeight.set(u.weight);
      },
      error: () => {},
    });
  }

  // ── Altura ────────────────────────────────────────────────────────────────────
  startEditHeight(): void {
    this.heightInput.set(this.userHeight());
    this.editingHeight.set(true);
    this.heightSaved.set(false);
  }

  cancelEditHeight(): void { this.editingHeight.set(false); }

  saveHeight(): void {
    const h = this.heightInput();
    if (!h || h < 100 || h > 250) return;
    this.savingHeight.set(true);
    this.userService.updateMe({ height: h }).subscribe({
      next: () => {
        this.userHeight.set(h);
        this.savingHeight.set(false);
        this.editingHeight.set(false);
        this.heightSaved.set(true);
        // Regenerar análise com nova altura
        if (this.insight()) this.generateInsight();
        setTimeout(() => this.heightSaved.set(false), 3000);
      },
      error: () => this.savingHeight.set(false),
    });
  }

  // ── Análise de Saúde (mock inteligente) ──────────────────────────────────────
  generateInsight(): void {
    this.insightLoading.set(true);
    this.insight.set(null);

    // Simula delay da "IA"
    setTimeout(() => {
      const s     = this.stats();
      const h     = this.userHeight();   // cm
      const w     = this.userWeight();   // kg

      const bmi   = (h > 0 && w > 0) ? +(w / Math.pow(h / 100, 2)).toFixed(1) : 0;

      const { bmiCategory, bmiColor, bmiScore } = this.classifyBmi(bmi);

      // Treino: até 30 pts (meta: 16 treinos/mês = treino ideal ~4x/semana)
      const workoutScore  = Math.min(30, Math.round(((s?.workoutsThisMonth ?? 0) / 16) * 30));

      // Sequência: até 15 pts (meta: 7 dias seguidos)
      const streakScore   = Math.min(15, Math.round(((s?.currentStreak ?? 0) / 7) * 15));

      // Calorias: até 15 pts (dentro de ±10% da meta semanal = perfeito)
      const weekGoal      = (s?.calorieGoal ?? 2000) * 7;
      const weekCal       = s?.totalCaloriesThisWeek ?? 0;
      const calRatio      = weekGoal > 0 ? weekCal / weekGoal : 0;
      const calScore      = weekGoal === 0 ? 0 : calRatio >= 0.9 && calRatio <= 1.1 ? 15 : calRatio >= 0.7 ? 8 : 3;

      const score         = Math.min(100, bmiScore + workoutScore + streakScore + calScore);
      const { scoreLabel, scoreColor } = this.classifyScore(score);

      const highlights    = this.buildHighlights(s, bmi, bmiCategory, workoutScore, streakScore, calScore);
      const recommendation = this.buildRecommendation(s, bmi, bmiCategory, workoutScore, calRatio);

      this.insight.set({
        score, scoreLabel, scoreColor,
        bmi, bmiCategory, bmiColor,
        highlights, recommendation,
        analysisDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      });

      this.insightLoading.set(false);
    }, 1400);
  }

  private classifyBmi(bmi: number): { bmiCategory: string; bmiColor: string; bmiScore: number } {
    if (bmi === 0)       return { bmiCategory: 'Sem dados', bmiColor: '#9e9e9e', bmiScore: 20 };
    if (bmi < 18.5)      return { bmiCategory: 'Abaixo do peso', bmiColor: '#2196f3', bmiScore: 20 };
    if (bmi < 25)        return { bmiCategory: 'Peso normal',    bmiColor: '#4caf50', bmiScore: 40 };
    if (bmi < 30)        return { bmiCategory: 'Sobrepeso',      bmiColor: '#ff9800', bmiScore: 25 };
    return               { bmiCategory: 'Obesidade',         bmiColor: '#f44336', bmiScore: 10 };
  }

  private classifyScore(score: number): { scoreLabel: string; scoreColor: string } {
    if (score >= 85) return { scoreLabel: 'Excelente',  scoreColor: '#2e7d32' };
    if (score >= 65) return { scoreLabel: 'Bom',        scoreColor: '#4caf50' };
    if (score >= 45) return { scoreLabel: 'Regular',    scoreColor: '#ff9800' };
    return           { scoreLabel: 'Atenção',    scoreColor: '#f44336' };
  }

  private buildHighlights(
    s: ProgressStatsDto | null,
    bmi: number, bmiCategory: string,
    workoutScore: number, streakScore: number, calScore: number,
  ): HealthInsight['highlights'] {
    const items: HealthInsight['highlights'] = [];

    // IMC
    if (bmi > 0) {
      const good = bmi >= 18.5 && bmi < 25;
      items.push({
        icon: good ? 'check_circle' : 'warning',
        text: `IMC ${bmi} — ${bmiCategory}`,
        type: good ? 'good' : bmi < 30 ? 'warn' : 'warn',
      });
    }

    // Treinos este mês
    const monthWork = s?.workoutsThisMonth ?? 0;
    items.push({
      icon: monthWork >= 8 ? 'fitness_center' : 'directions_run',
      text: monthWork >= 16 ? `${monthWork} treinos este mês — frequência excelente!`
           : monthWork >= 8  ? `${monthWork} treinos este mês — continue assim`
           : `${monthWork} treinos este mês — tente aumentar a frequência`,
      type: monthWork >= 12 ? 'good' : monthWork >= 6 ? 'neutral' : 'warn',
    });

    // Sequência
    const streak = s?.currentStreak ?? 0;
    if (streak > 0) {
      items.push({
        icon: 'local_fire_department',
        text: streak >= 7 ? `${streak} dias seguidos — sequência incrível! 🔥`
             : streak >= 3 ? `${streak} dias seguidos — ótimo ritmo`
             : `${streak} dia(s) de sequência — mantenha o hábito`,
        type: streak >= 5 ? 'good' : 'neutral',
      });
    }

    // Variação de peso
    const delta = s?.weightDelta;
    if (delta !== undefined && delta !== null) {
      items.push({
        icon: delta < 0 ? 'trending_down' : delta > 0 ? 'trending_up' : 'trending_flat',
        text: delta < -0.5 ? `Perdeu ${Math.abs(delta).toFixed(1)} kg — no caminho certo`
             : delta > 0.5 ? `Ganhou ${delta.toFixed(1)} kg — revise a dieta`
             : 'Peso estável — ótimo controle',
        type: delta <= 0.5 ? 'good' : 'warn',
      });
    }

    // Calorias (se tiver dado)
    if ((s?.totalCaloriesThisWeek ?? 0) > 0) {
      const weekGoal = (s?.calorieGoal ?? 2000) * 7;
      const ratio = weekGoal > 0 ? (s!.totalCaloriesThisWeek / weekGoal) : 0;
      items.push({
        icon: 'restaurant',
        text: ratio >= 0.9 && ratio <= 1.1 ? 'Meta calórica bem atingida esta semana'
             : ratio < 0.7 ? 'Ingestão calórica muito baixa esta semana'
             : ratio > 1.2 ? 'Excesso calórico esta semana — atenção'
             : 'Calorias ligeiramente abaixo da meta',
        type: ratio >= 0.85 && ratio <= 1.15 ? 'good' : 'warn',
      });
    }

    return items.slice(0, 4);
  }

  private buildRecommendation(
    s: ProgressStatsDto | null,
    bmi: number, bmiCategory: string,
    workoutScore: number, calRatio: number,
  ): string {
    const recs: string[] = [];

    if (bmi >= 25)        recs.push('Foque em déficit calórico moderado (300–500 kcal/dia abaixo da meta) e priorize cardio.');
    if (bmi < 18.5 && bmi > 0) recs.push('Aumente a ingestão calórica e proteica para ganhar massa saudável.');
    if ((s?.workoutsThisMonth ?? 0) < 8) recs.push('Tente treinar ao menos 3x por semana para resultados consistentes.');
    if ((s?.currentStreak ?? 0) === 0)   recs.push('Retome a rotina de treinos — até 20 minutos por dia já fazem diferença.');
    if (calRatio < 0.8)   recs.push('Aumente a ingestão alimentar — comer muito pouco prejudica o desempenho e o metabolismo.');
    if (calRatio > 1.2)   recs.push('Reduza o consumo calórico e prefira alimentos integrais e proteínas magras.');

    if (!recs.length) {
      return 'Continue mantendo sua rotina atual — seus indicadores estão dentro do ideal. Lembre-se de hidratação adequada (8+ copos/dia) e sono de qualidade.';
    }

    return recs[0];
  }

  // ── Utils ─────────────────────────────────────────────────────────────────────
  private sliceLast<T>(arr: T[], n: number): T[] { return arr.slice(-n); }
  private pointsFor(p: Period, max = 24): number {
    return p === '7d' ? Math.min(7, max) : p === '30d' ? Math.min(14, max) : max;
  }
  private shortDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  xStepFor(len: number): number { return len <= 7 ? 1 : len <= 14 ? 2 : 4; }
  absVal(n: number): number { return Math.abs(n); }

  goBack():           void { this.router.navigate(['/home']); }
  goToMeasurements(): void { this.router.navigate(['/measurements']); }
}
