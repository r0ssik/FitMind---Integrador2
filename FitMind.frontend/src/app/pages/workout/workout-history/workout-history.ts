import { Component, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../../../services/history.service';
import { WorkoutHistoryDto } from '../../../core/models/api.models';

type FilterType = 'all' | 'perna' | 'peito' | 'costas' | 'ombro' | 'cardio';

@Component({
  selector: 'app-workout-history',
  imports: [DatePipe],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.scss',
})
export class WorkoutHistory implements OnInit {
  today        = new Date();
  viewYear     = signal(this.today.getFullYear());
  viewMonth    = signal(this.today.getMonth());
  activeFilter = signal<FilterType>('all');
  selectedDate = signal<string | null>(null);
  loading      = signal(true);

  filters: { key: FilterType; label: string }[] = [
    { key: 'all',    label: 'Todos'  },
    { key: 'perna',  label: 'Perna'  },
    { key: 'peito',  label: 'Peito'  },
    { key: 'costas', label: 'Costas' },
    { key: 'ombro',  label: 'Ombro'  },
    { key: 'cardio', label: 'Cardio' },
  ];

  feelingConfig: Record<string, { icon: string; color: string; label: string }> = {
    great: { icon: 'local_fire_department',       color: '#4caf50', label: 'Ótimo'   },
    good:  { icon: 'fitness_center',              color: '#2196f3', label: 'Bom'     },
    ok:    { icon: 'sentiment_neutral',           color: '#ff9800', label: 'Regular' },
    bad:   { icon: 'sentiment_very_dissatisfied', color: '#f44336', label: 'Difícil' },
  };

  records = signal<WorkoutHistoryDto[]>([]);

  calendarDays = computed(() => this.buildCalendar());

  get filtered(): WorkoutHistoryDto[] {
    let list = this.records();
    const f  = this.activeFilter();
    if (f !== 'all') list = list.filter(r => (r.focus ?? '').toLowerCase().includes(f));
    const d  = this.selectedDate();
    if (d)  list = list.filter(r => this.toKey(new Date(r.date)) === d);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get stats() {
    const month = this.records().filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === this.today.getMonth() && d.getFullYear() === this.today.getFullYear();
    });
    const totalMinutes = month.reduce((s, r) => s + r.durationMinutes, 0);
    return {
      total:       month.length,
      avgDuration: month.length ? Math.round(totalMinutes / month.length) : 0,
      streak:      this.calcStreak(),
      totalSets:   month.reduce((s, r) => s + (r.setsTotal ?? 0), 0),
    };
  }

  monthName = computed(() =>
    new Date(this.viewYear(), this.viewMonth(), 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );

  constructor(private router: Router, private historyService: HistoryService) {}

  ngOnInit(): void {
    this.historyService.getWorkouts().subscribe({
      next:  records => { this.records.set(records); this.loading.set(false); },
      error: ()      => this.loading.set(false),
    });
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else this.viewMonth.update(m => m - 1);
    this.selectedDate.set(null);
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else this.viewMonth.update(m => m + 1);
    this.selectedDate.set(null);
  }

  selectDay(key: string): void {
    this.selectedDate.set(this.selectedDate() === key ? null : key);
  }

  private toKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  private buildCalendar() {
    const y = this.viewYear(), m = this.viewMonth();
    const first = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const trainedKeys = new Set(this.records().map(r => this.toKey(new Date(r.date))));
    const cells: { day: number | null; key: string | null; trained: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < first; i++) cells.push({ day: null, key: null, trained: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${m}-${d}`;
      cells.push({ day: d, key, trained: trainedKeys.has(key),
        isToday: d === this.today.getDate() && m === this.today.getMonth() && y === this.today.getFullYear() });
    }
    return cells;
  }

  private calcStreak(): number {
    const keys = new Set(this.records().map(r => this.toKey(new Date(r.date))));
    let streak = 0;
    const d = new Date();
    while (true) {
      if (keys.has(this.toKey(d))) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  getFeelingConfig(feeling: string | undefined) {
    return this.feelingConfig[feeling ?? 'good'] ?? this.feelingConfig['good'];
  }

  goBack(): void { this.router.navigate(['/home']); }
}
