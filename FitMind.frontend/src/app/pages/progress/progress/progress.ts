import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';
import { ChartDataDto } from '../../../core/models/api.models';

type Period = '7d' | '30d' | '3m';

@Component({
  selector: 'app-progress',
  imports: [],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress implements OnInit {
  constructor(private router: Router, private progressService: ProgressService) {}

  period  = signal<Period>('30d');
  loading = signal(true);
  private chartData = signal<ChartDataDto | null>(null);

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

  ngOnInit(): void { this.loadChartData(); }

  onPeriodChange(p: Period): void { this.period.set(p); this.loadChartData(); }

  private loadChartData(): void {
    this.loading.set(true);
    this.progressService.getChartData(this.period()).subscribe({
      next:  d => { this.chartData.set(d as ChartDataDto); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
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
