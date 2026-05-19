import { Component, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { DashboardStatsDto, ReportDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl:    './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  constructor(private router: Router, private adminService: AdminService) {}

  loading = signal(true);
  stats   = signal<DashboardStatsDto | null>(null);
  reports = signal<ReportDto[]>([]);
  filterReport = signal<'all' | 'pending' | 'resolved'>('all');

  get totalUsers():       number { return this.stats()?.totalUsers       ?? 0; }
  get activeToday():      number { return this.stats()?.activeToday      ?? 0; }
  get newThisWeek():      number { return this.stats()?.newThisWeek      ?? 0; }
  get workoutsToday():    number { return this.stats()?.workoutsToday    ?? 0; }
  get challengesActive(): number { return this.stats()?.activeChallenges ?? 0; }
  get reportsOpen():      number { return this.stats()?.openReports      ?? 0; }
  get weeklyActive():     { day: string; val: number }[] {
    return (this.stats()?.weeklyActivity ?? []).map(w => ({ day: w.day, val: w.count }));
  }
  get maxActive(): number { return Math.max(...this.weeklyActive.map(d => d.val), 1); }

  barH(val: number): number { return Math.round((val / this.maxActive) * 70); }

  filteredReports = () => {
    const f = this.filterReport();
    return f === 'all' ? this.reports() : this.reports().filter(r => r.status.toLowerCase() === f);
  };

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next:  s  => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.adminService.getReports().subscribe({
      next:  r  => this.reports.set(r),
      error: () => {},
    });
  }

  resolveReport(id: string): void {
    this.adminService.updateReportStatus(id, { status: 'Resolved' }).subscribe({
      next: () => this.reports.update(rs => rs.map(r => r.id === id ? { ...r, status: 'Resolved' } : r)),
      error: () => {},
    });
  }

  dismissReport(id: string): void {
    this.adminService.updateReportStatus(id, { status: 'Dismissed' }).subscribe({
      next: () => this.reports.update(rs => rs.map(r => r.id === id ? { ...r, status: 'Dismissed' } : r)),
      error: () => {},
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  goUsers(): void { this.router.navigate(['/admin/users']); }
  goHome():  void { this.router.navigate(['/home']); }
}
