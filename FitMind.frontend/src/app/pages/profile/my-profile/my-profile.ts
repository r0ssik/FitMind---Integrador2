import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-my-profile',
  imports: [],
  templateUrl: './my-profile.html',
  styleUrl:    './my-profile.scss',
})
export class MyProfile implements OnInit {
  private auth        = inject(Auth);
  private router      = inject(Router);
  private userService = inject(UserService);

  readonly user = this.auth.currentUser;

  editing = signal(false);
  saved   = signal(false);
  saving  = signal(false);
  error   = signal('');

  fName   = signal('');
  fEmail  = signal('');
  fPhone  = signal('');
  fBirth  = signal('');
  fSex    = signal('');
  fWeight = signal('');
  fHeight = signal('');
  fBio    = signal('');

  goals       = signal<string[]>([]);
  limitations = signal<string[]>([]);

  readonly allGoals = [
    'Perder peso', 'Ganhar massa', 'Definição muscular',
    'Melhorar condicionamento', 'Saúde geral', 'Reduzir estresse',
  ];

  readonly allLimitations = [
    'Problema no joelho', 'Problema nas costas', 'Problema no ombro',
    'Hipertensão', 'Diabetes', 'Nenhuma limitação',
  ];

  get userInitials(): string {
    const n = this.user()?.name ?? 'U';
    return n.split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase();
  }

  /** Exibe o sexo em português no modo de leitura. */
  get sexLabel(): string {
    const map: Record<string, string> = {
      Male: 'Masculino', Female: 'Feminino',
      NonBinary: 'Não binário', NotInformed: 'Prefiro não dizer',
    };
    const v = this.user()?.sex ?? '';
    return map[v] ?? (v || '—');
  }

  ngOnInit(): void {}

  startEdit(): void {
    const u = this.user();
    if (!u) return;
    this.fName.set(u.name ?? '');
    this.fEmail.set(u.email ?? '');
    this.fPhone.set(u.phone ?? '');
    this.fBirth.set(u.birthDate?.split('T')[0] ?? '');
    this.fSex.set(u.sex ?? '');
    this.fWeight.set(u.weight ? String(u.weight) : '');
    this.fHeight.set(u.height ? String(u.height) : '');
    this.fBio.set(u.bio ?? '');
    const lims = u.limitations ? u.limitations.split(',').map(l => l.trim()).filter(Boolean) : [];
    this.limitations.set(lims);
    this.editing.set(true);
    this.error.set('');
  }

  saveEdit(): void {
    this.saving.set(true);
    this.error.set('');
    this.userService.updateMe({
      name:        this.fName()   || undefined,
      phone:       this.fPhone()  || undefined,
      bio:         this.fBio()    || undefined,
      weight:      this.fWeight() ? +this.fWeight() : undefined,
      height:      this.fHeight() ? +this.fHeight() : undefined,
      limitations: this.limitations().join(', ') || undefined,
      sex:         this.fSex()   || undefined,
      birthDate:   this.fBirth() || undefined,
    }).subscribe({
      next: updated => {
        this.auth.updateUserSignal(updated);
        this.saving.set(false);
        this.saved.set(true);
        // Re-fetch fresh data from server to garantir que o signal reflita o BD
        this.userService.getMe().subscribe({
          next: fresh => this.auth.updateUserSignal(fresh),
          error: () => {}
        });
        setTimeout(() => { this.editing.set(false); this.saved.set(false); }, 1200);
      },
      error: () => {
        this.error.set('Erro ao salvar. Tente novamente.');
        this.saving.set(false);
      },
    });
  }

  cancelEdit(): void { this.editing.set(false); }

  toggleGoal(value: string): void {
    const cur = this.goals();
    this.goals.set(cur.includes(value) ? cur.filter(g => g !== value) : [...cur, value]);
  }

  toggleLimitation(value: string): void {
    const cur = this.limitations();
    this.limitations.set(cur.includes(value) ? cur.filter(l => l !== value) : [...cur, value]);
  }

  hasGoal(value: string):       boolean { return this.goals().includes(value); }
  hasLimitation(value: string): boolean { return this.limitations().includes(value); }

  goBack():         void { this.router.navigate(['/home']); }
  goSettings():     void { this.router.navigate(['/settings']); }
  goAchievements(): void { this.router.navigate(['/achievements']); }
  goHistory():      void { this.router.navigate(['/history']); }
}
