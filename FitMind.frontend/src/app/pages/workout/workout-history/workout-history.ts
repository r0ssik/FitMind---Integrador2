import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

type FilterType = 'all' | 'perna' | 'peito' | 'costas' | 'ombro' | 'cardio';

interface WorkoutRecord {
  date: Date;
  name: string;
  focus: string;
  duration: number;
  setsTotal: number;
  feeling: 'great' | 'good' | 'ok' | 'bad';
}

@Component({
  selector: 'app-workout-history',
  imports: [],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.scss',
})
export class WorkoutHistory {
  today = new Date();
  viewYear = signal(this.today.getFullYear());
  viewMonth = signal(this.today.getMonth());
  activeFilter = signal<FilterType>('all');
  selectedDate = signal<string | null>(null);

  filters: { key: FilterType; label: string }[] = [
    { key: 'all',    label: 'Todos' },
    { key: 'perna',  label: 'Perna' },
    { key: 'peito',  label: 'Peito' },
    { key: 'costas', label: 'Costas' },
    { key: 'ombro',  label: 'Ombro' },
    { key: 'cardio', label: 'Cardio' },
  ];

  feelingConfig: Record<string, { icon: string; color: string; label: string }> = {
    great: { icon: 'local_fire_department',      color: '#4caf50', label: 'Ótimo' },
    good:  { icon: 'fitness_center',             color: '#2196f3', label: 'Bom' },
    ok:    { icon: 'sentiment_neutral',          color: '#ff9800', label: 'Regular' },
    bad:   { icon: 'sentiment_very_dissatisfied',color: '#f44336', label: 'Difícil' },
  };

  records: WorkoutRecord[] = this.generateRecords();

  calendarDays = computed(() => this.buildCalendar());

  get filtered(): WorkoutRecord[] {
    let list = this.records;
    const f = this.activeFilter();
    if (f !== 'all') list = list.filter(r => r.focus.toLowerCase().includes(f));
    const d = this.selectedDate();
    if (d) list = list.filter(r => this.toKey(r.date) === d);
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  get stats() {
    const month = this.records.filter(r =>
      r.date.getMonth() === this.today.getMonth() &&
      r.date.getFullYear() === this.today.getFullYear()
    );
    const totalMinutes = month.reduce((s, r) => s + r.duration, 0);
    const streak = this.calcStreak();
    return {
      total: month.length,
      avgDuration: month.length ? Math.round(totalMinutes / month.length) : 0,
      streak,
      totalSets: month.reduce((s, r) => s + r.setsTotal, 0),
    };
  }

  monthName = computed(() => {
    return new Date(this.viewYear(), this.viewMonth(), 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

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
    const trainedKeys = new Set(this.records.map(r => this.toKey(r.date)));
    const cells: { day: number | null; key: string | null; trained: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < first; i++) cells.push({ day: null, key: null, trained: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${m}-${d}`;
      cells.push({
        day: d,
        key,
        trained: trainedKeys.has(key),
        isToday: d === this.today.getDate() && m === this.today.getMonth() && y === this.today.getFullYear(),
      });
    }
    return cells;
  }

  private calcStreak(): number {
    const keys = new Set(this.records.map(r => this.toKey(r.date)));
    let streak = 0;
    const d = new Date();
    while (true) {
      if (keys.has(this.toKey(d))) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  private generateRecords(): WorkoutRecord[] {
    const names = [
      { name: 'Peito + Tríceps', focus: 'peito' },
      { name: 'Costas + Bíceps', focus: 'costas' },
      { name: 'Perna', focus: 'perna' },
      { name: 'Ombro + Core', focus: 'ombro' },
      { name: 'Cardio HIIT', focus: 'cardio' },
    ];
    const feelings: WorkoutRecord['feeling'][] = ['great', 'good', 'ok', 'bad'];
    const records: WorkoutRecord[] = [];
    const today = new Date();
    const usedDays = new Set<number>();
    for (let i = 0; i < 28; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      if (usedDays.has(daysAgo)) continue;
      usedDays.add(daysAgo);
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const w = names[i % names.length];
      records.push({
        date: d,
        name: w.name,
        focus: w.focus,
        duration: 45 + Math.floor(Math.random() * 45),
        setsTotal: 15 + Math.floor(Math.random() * 10),
        feeling: feelings[Math.floor(Math.random() * feelings.length)],
      });
    }
    return records;
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
