import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { WaterService } from '../../../services/water.service';
import { WaterIntakeDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-hydration-history',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './hydration-history.html',
  styleUrl: './hydration-history.scss',
})
export class HydrationHistory implements OnInit {
  constructor(private waterService: WaterService, private router: Router) {}

  loading = signal(true);
  history = signal<WaterIntakeDto[]>([]);

  // ── Stats ─────────────────────────────────────────────────────────────────────

  avgCups = computed(() => {
    const h = this.history();
    if (!h.length) return 0;
    const total = h.reduce((s, d) => s + d.cups, 0);
    return total / h.length;
  });

  daysAtGoal = computed(() =>
    this.history().filter(d => d.cups >= d.goal).length
  );

  bestDay = computed(() => {
    const h = this.history();
    if (!h.length) return null;
    return h.reduce((best, d) => (d.cups > best.cups ? d : best), h[0]);
  });

  streak = computed(() => {
    // Days in a row (from today back) where goal was met
    const sorted = [...this.history()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let count = 0;
    for (const d of sorted) {
      if (d.cups >= d.goal) count++;
      else break;
    }
    return count;
  });

  // Reversed for display (newest first)
  sortedHistory = computed(() =>
    [...this.history()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  // Last 30 days for bar chart (oldest → newest)
  chartData = computed(() =>
    [...this.history()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.waterService.getHistory(30).subscribe({
      next: data => {
        this.history.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  pct(cups: number, goal: number): number {
    return Math.min((cups / (goal || 8)) * 100, 100);
  }

  barColor(d: WaterIntakeDto): string {
    if (d.cups === 0) return 'var(--border)';
    if (d.cups >= d.goal) return '#1e88e5';
    return '#64b5f6';
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  dayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
