import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

type UserStatus = 'active' | 'suspended' | 'blocked';

interface AdminUser {
  id:        number;
  name:      string;
  email:     string;
  initials:  string;
  joined:    string;
  workouts:  number;
  status:    UserStatus;
}

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl:    './admin-users.scss',
})
export class AdminUsers {
  constructor(private router: Router) {}

  search  = signal('');
  filterStatus = signal<UserStatus | 'all'>('all');

  confirmAction = signal<{ user: AdminUser; action: 'suspend' | 'block' | 'delete' } | null>(null);

  users = signal<AdminUser[]>([
    { id:1,  name:'Gabriel Santos',  email:'gabriel@email.com', initials:'GS', joined:'01/02/2025', workouts:87,  status:'active'    },
    { id:2,  name:'João Barros',     email:'joao@email.com',    initials:'JB', joined:'05/02/2025', workouts:312, status:'active'    },
    { id:3,  name:'Emily Mekaru',    email:'emily@email.com',   initials:'EM', joined:'10/02/2025', workouts:180, status:'active'    },
    { id:4,  name:'Carlos Silva',    email:'carlos@email.com',  initials:'CS', joined:'12/02/2025', workouts:241, status:'active'    },
    { id:5,  name:'Ana Lima',        email:'ana@email.com',     initials:'AL', joined:'18/02/2025', workouts:95,  status:'active'    },
    { id:6,  name:'Pedro Costa',     email:'pedro@email.com',   initials:'PC', joined:'01/03/2025', workouts:42,  status:'suspended' },
    { id:7,  name:'Lucas Torres',    email:'lucas@email.com',   initials:'LT', joined:'05/03/2025', workouts:11,  status:'blocked'   },
    { id:8,  name:'André Melo',      email:'andre@email.com',   initials:'AM', joined:'10/03/2025', workouts:28,  status:'suspended' },
    { id:9,  name:'Carla Santos',    email:'carla@email.com',   initials:'CaSt',joined:'15/03/2025',workouts:66, status:'active'    },
    { id:10, name:'Rafael Lima',     email:'rafael@email.com',  initials:'RL', joined:'20/03/2025', workouts:53,  status:'active'    },
  ]);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const f = this.filterStatus();
    return this.users().filter(u => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchF = f === 'all' || u.status === f;
      return matchQ && matchF;
    });
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  openConfirm(user: AdminUser, action: 'suspend' | 'block' | 'delete'): void {
    this.confirmAction.set({ user, action });
  }

  closeConfirm(): void { this.confirmAction.set(null); }

  executeAction(): void {
    const ca = this.confirmAction();
    if (!ca) return;
    const { user, action } = ca;

    if (action === 'delete') {
      this.users.update(us => us.filter(u => u.id !== user.id));
    } else {
      const newStatus: UserStatus = action === 'suspend' ? 'suspended' : 'blocked';
      this.users.update(us => us.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    }
    this.closeConfirm();
  }

  reactivate(user: AdminUser): void {
    this.users.update(us => us.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
  }

  actionLabel(action: string): string {
    const m: Record<string, string> = { suspend: 'Suspender', block: 'Bloquear', delete: 'Excluir' };
    return m[action] ?? action;
  }

  actionIcon(action: string): string {
    const m: Record<string, string> = { suspend: 'pause_circle', block: 'block', delete: 'delete' };
    return m[action] ?? 'warning';
  }

  statusLabel(s: UserStatus): string {
    return s === 'active' ? 'Ativo' : s === 'suspended' ? 'Suspenso' : 'Bloqueado';
  }

  goBack(): void { this.router.navigate(['/admin']); }
}
