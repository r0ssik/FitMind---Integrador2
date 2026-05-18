import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

type Period = '7d' | '30d' | '3m';

interface WeightEntry  { date: string; value: number }
interface MeasEntry    { date: string; waist: number; hip: number; chest: number }
interface WorkoutEntry { date: string; duration: number; exercises: number }

@Component({
  selector: 'app-progress',
  imports: [],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {
  constructor(private router: Router) {}

  period = signal<Period>('30d');

  // ── Mock data ────────────────────────────────────────────────────────────────

  private weightAll: WeightEntry[] = [
    { date: '01/02', value: 84.2 }, { date: '03/02', value: 83.8 },
    { date: '06/02', value: 83.5 }, { date: '10/02', value: 83.1 },
    { date: '14/02', value: 82.7 }, { date: '18/02', value: 82.4 },
    { date: '22/02', value: 82.0 }, { date: '26/02', value: 81.8 },
    { date: '01/03', value: 81.5 }, { date: '05/03', value: 81.2 },
    { date: '09/03', value: 80.9 }, { date: '13/03', value: 80.6 },
    { date: '17/03', value: 80.4 }, { date: '21/03', value: 80.1 },
    { date: '25/03', value: 79.9 }, { date: '29/03', value: 79.6 },
    { date: '02/04', value: 79.4 }, { date: '06/04', value: 79.2 },
    { date: '10/04', value: 79.0 }, { date: '14/04', value: 78.8 },
    { date: '18/04', value: 78.6 }, { date: '22/04', value: 78.3 },
    { date: '26/04', value: 82.0 }, { date: '28/04', value: 81.8 },
  ];

  private measAll: MeasEntry[] = [
    { date: '01/02', waist: 88, hip: 98, chest: 102 },
    { date: '15/02', waist: 87, hip: 97, chest: 101 },
    { date: '01/03', waist: 86, hip: 96, chest: 100 },
    { date: '15/03', waist: 85, hip: 96, chest: 100 },
    { date: '01/04', waist: 84, hip: 95, chest: 99  },
    { date: '15/04', waist: 83, hip: 94, chest: 98  },
  ];

  private workoutAll: WorkoutEntry[] = [
    { date: '01/02', duration: 55, exercises: 6 },
    { date: '03/02', duration: 62, exercises: 7 },
    { date: '06/02', duration: 48, exercises: 5 },
    { date: '09/02', duration: 70, exercises: 8 },
    { date: '12/02', duration: 58, exercises: 6 },
    { date: '15/02', duration: 65, exercises: 7 },
    { date: '19/02', duration: 52, exercises: 6 },
    { date: '22/02', duration: 68, exercises: 7 },
    { date: '25/02', duration: 60, exercises: 7 },
    { date: '28/02', duration: 73, exercises: 8 },
    { date: '03/03', duration: 55, exercises: 6 },
    { date: '07/03', duration: 66, exercises: 7 },
    { date: '11/03', duration: 71, exercises: 8 },
    { date: '15/03', duration: 62, exercises: 7 },
    { date: '19/03', duration: 78, exercises: 9 },
    { date: '23/03', duration: 65, exercises: 7 },
    { date: '27/03', duration: 70, exercises: 8 },
    { date: '31/03', duration: 80, exercises: 9 },
    { date: '04/04', duration: 68, exercises: 8 },
    { date: '08/04', duration: 75, exercises: 8 },
    { date: '12/04', duration: 82, exercises: 9 },
    { date: '16/04', duration: 72, exercises: 8 },
    { date: '20/04', duration: 88, exercises: 10 },
    { date: '24/04', duration: 79, exercises: 9 },
  ];

  // ── Filtered data based on period ────────────────────────────────────────────

  weightData = computed(() => this.sliceLast(this.weightAll, this.pointsFor(this.period())));
  measData   = computed(() => this.sliceLast(this.measAll,   this.pointsFor(this.period(), 6)));
  workoutData = computed(() => this.sliceLast(this.workoutAll, this.pointsFor(this.period())));

  // ── Summary stats ────────────────────────────────────────────────────────────

  weightChange = computed(() => {
    const d = this.weightData();
    if (d.length < 2) return 0;
    return +(d[d.length - 1].value - d[0].value).toFixed(1);
  });

  totalWorkouts = computed(() => this.workoutData().length);

  avgDuration = computed(() => {
    const d = this.workoutData();
    if (!d.length) return 0;
    return Math.round(d.reduce((s, w) => s + w.duration, 0) / d.length);
  });

  waistChange = computed(() => {
    const d = this.measData();
    if (d.length < 2) return 0;
    return +(d[d.length - 1].waist - d[0].waist).toFixed(1);
  });

  // ── SVG helpers ──────────────────────────────────────────────────────────────

  readonly W = 320;
  readonly H = 120;
  readonly PAD = { top: 10, right: 12, bottom: 28, left: 36 };

  linePoints(values: number[]): string {
    if (!values.length) return '';
    const min  = Math.min(...values);
    const max  = Math.max(...values);
    const rng  = max - min || 1;
    const w    = this.W - this.PAD.left - this.PAD.right;
    const h    = this.H - this.PAD.top  - this.PAD.bottom;
    return values
      .map((v, i) => {
        const x = this.PAD.left + (i / (values.length - 1 || 1)) * w;
        const y = this.PAD.top  + h - ((v - min) / rng) * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
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
    return labels
      .filter((_, i) => i % step === 0 || i === labels.length - 1)
      .map((label, idx, arr) => ({
        x: this.PAD.left + (labels.indexOf(label) / (labels.length - 1 || 1)) * w,
        label,
      }));
  }

  yLabels(values: number[], count = 4): { y: number; label: string }[] {
    const min  = Math.min(...values);
    const max  = Math.max(...values);
    const rng  = max - min || 1;
    const h    = this.H - this.PAD.top - this.PAD.bottom;
    return Array.from({ length: count }, (_, i) => {
      const frac = i / (count - 1);
      const val  = min + frac * rng;
      const y    = this.PAD.top + h - frac * h;
      return { y: +y.toFixed(1), label: val.toFixed(rng < 5 ? 1 : 0) };
    });
  }

  barRects(values: number[]): { x: number; y: number; w: number; h: number; value: number }[] {
    const max = Math.max(...values, 1);
    const W   = this.W - this.PAD.left - this.PAD.right;
    const H   = this.H - this.PAD.top  - this.PAD.bottom;
    const barW = Math.max(4, W / values.length - 3);
    return values.map((v, i) => {
      const barH = (v / max) * H;
      const x    = this.PAD.left + (i / values.length) * W + (W / values.length - barW) / 2;
      const y    = this.PAD.top  + H - barH;
      return { x: +x.toFixed(1), y: +y.toFixed(1), w: +barW.toFixed(1), h: +barH.toFixed(1), value: v };
    });
  }

  // ── Computed chart data ───────────────────────────────────────────────────────

  weightValues  = computed(() => this.weightData().map(d => d.value));
  weightLabels  = computed(() => this.weightData().map(d => d.date));

  waistValues   = computed(() => this.measData().map(d => d.waist));
  hipValues     = computed(() => this.measData().map(d => d.hip));
  chestValues   = computed(() => this.measData().map(d => d.chest));
  measLabels    = computed(() => this.measData().map(d => d.date));

  durationValues = computed(() => this.workoutData().map(d => d.duration));
  workoutLabels  = computed(() => this.workoutData().map(d => d.date));

  // ── Utils ────────────────────────────────────────────────────────────────────

  private sliceLast<T>(arr: T[], n: number): T[] {
    return arr.slice(-n);
  }

  private pointsFor(p: Period, max = 24): number {
    return p === '7d' ? Math.min(7, max) : p === '30d' ? Math.min(14, max) : max;
  }

  xStepFor(len: number): number {
    return len <= 7 ? 1 : len <= 14 ? 2 : 4;
  }

  absVal(n: number): number { return Math.abs(n); }

  goBack(): void            { this.router.navigate(['/home']); }
  goToMeasurements(): void  { this.router.navigate(['/measurements']); }
}
