import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

interface Report {
  id:       number;
  type:     string;
  reporter: string;
  target:   string;
  reason:   string;
  date:     string;
  status:   'pending' | 'resolved' | 'dismissed';
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl:    './admin-dashboard.scss',
})
export class AdminDashboard {
  constructor(private router: Router) {}

  // ── Mock metrics ─────────────────────────────────────────────────────────────

  totalUsers       = 1_248;
  activeToday      = 312;
  newThisWeek      = 47;
  workoutsToday    = 518;
  challengesActive = 23;
  reportsOpen      = 5;

  // ── Trend chart (last 7 days active users) ────────────────────────────────

  weeklyActive = [
    { day: 'Seg', val: 280 }, { day: 'Ter', val: 295 },
    { day: 'Qua', val: 310 }, { day: 'Qui', val: 298 },
    { day: 'Sex', val: 340 }, { day: 'Sáb', val: 360 },
    { day: 'Dom', val: 312 },
  ];

  maxActive = Math.max(...this.weeklyActive.map(d => d.val));

  barH(val: number): number { return Math.round((val / this.maxActive) * 70); }

  // ── Reports ───────────────────────────────────────────────────────────────────

  reports = signal<Report[]>([
    { id:1, type:'Post',    reporter:'Ana Lima',     target:'Carlos Silva',  reason:'Conteúdo inadequado',    date:'26/04', status:'pending'   },
    { id:2, type:'Usuário', reporter:'João Barros',  target:'Pedro Costa',   reason:'Spam no feed',           date:'25/04', status:'pending'   },
    { id:3, type:'Post',    reporter:'Emily Mekaru', target:'Lucas Torres',  reason:'Linguagem ofensiva',      date:'24/04', status:'resolved'  },
    { id:4, type:'Usuário', reporter:'Carla Santos', target:'André Melo',    reason:'Perfil falso',           date:'23/04', status:'pending'   },
    { id:5, type:'Post',    reporter:'Rafael Lima',  target:'Diego Souza',   reason:'Propaganda enganosa',    date:'22/04', status:'dismissed' },
  ]);

  filterReport = signal<'all' | 'pending' | 'resolved'>('all');

  filteredReports = () => {
    const f = this.filterReport();
    const r = this.reports();
    if (f === 'all') return r;
    return r.filter(rep => rep.status === f);
  };

  resolveReport(id: number): void {
    this.reports.update(rs => rs.map(r => r.id === id ? { ...r, status: 'resolved' as const } : r));
  }

  dismissReport(id: number): void {
    this.reports.update(rs => rs.map(r => r.id === id ? { ...r, status: 'dismissed' as const } : r));
  }

  goUsers(): void { this.router.navigate(['/admin/users']); }
  goHome():  void { this.router.navigate(['/home']); }
}
