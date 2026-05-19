import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AdminUserDto } from '../../../core/models/api.models';

type UserStatus = 'active' | 'suspended' | 'blocked';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl:    './admin-users.scss',
})
export class AdminUsers implements OnInit {
  constructor(private router: Router, private adminService: AdminService) {}

  search       = signal('');
  filterStatus = signal<UserStatus | 'all'>('all');
  loading      = signal(true);
  error        = signal('');

  confirmAction = signal<{ user: AdminUserDto; action: 'suspend' | 'block' | 'delete' } | null>(null);
  users         = signal<AdminUserDto[]>([]);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const f = this.filterStatus();
    return this.users().filter(u => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchF = f === 'all' || u.status.toLowerCase() === f;
      return matchQ && matchF;
    });
  });

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next:  list => { this.users.set(list); this.loading.set(false); },
      error: ()   => { this.error.set('Erro ao carregar usuários.'); this.loading.set(false); },
    });
  }

  openConfirm(user: AdminUserDto, action: 'suspend' | 'block' | 'delete'): void {
    this.confirmAction.set({ user, action });
  }

  closeConfirm(): void { this.confirmAction.set(null); }

  executeAction(): void {
    const ca = this.confirmAction();
    if (!ca) return;
    const { user, action } = ca;

    if (action === 'suspend') {
      this.adminService.suspendUser(user.id).subscribe({
        next:  () => this.users.update(us => us.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u)),
        error: () => {},
      });
    } else if (action === 'block') {
      this.adminService.blockUser(user.id).subscribe({
        next:  () => this.users.update(us => us.map(u => u.id === user.id ? { ...u, status: 'blocked' } : u)),
        error: () => {},
      });
    }
    this.closeConfirm();
  }

  reactivate(user: AdminUserDto): void {
    this.adminService.reactivateUser(user.id).subscribe({
      next:  () => this.users.update(us => us.map(u => u.id === user.id ? { ...u, status: 'active' } : u)),
      error: () => {},
    });
  }

  actionLabel(action: string): string {
    const m: Record<string, string> = { suspend: 'Suspender', block: 'Bloquear', delete: 'Excluir' };
    return m[action] ?? action;
  }

  actionIcon(action: string): string {
    const m: Record<string, string> = { suspend: 'pause_circle', block: 'block', delete: 'delete' };
    return m[action] ?? 'warning';
  }

  statusLabel(s: string): string {
    return s === 'active' ? 'Ativo' : s === 'suspended' ? 'Suspenso' : 'Bloqueado';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  goBack(): void { this.router.navigate(['/admin']); }
}
