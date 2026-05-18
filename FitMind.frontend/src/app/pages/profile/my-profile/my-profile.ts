import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, UserProfile as UserProfileData } from '../../../services/auth';

@Component({
  selector: 'app-my-profile',
  imports: [],
  templateUrl: './my-profile.html',
  styleUrl:    './my-profile.scss',
})
export class MyProfile {
  private auth   = inject(Auth);
  private router = inject(Router);

  /** Expose auth signal so template can call user() */
  readonly user = this.auth.currentUser;

  editing = signal(false);
  saved   = signal(false);

  // Editable fields (loaded from auth service)
  fName     = signal('');
  fEmail    = signal('');
  fPhone    = signal('');
  fBirth    = signal('');
  fSex      = signal('');
  fWeight   = signal('');
  fHeight   = signal('');

  // Multi-select arrays
  goals      = signal<string[]>([]);
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

  // ── Edit mode ─────────────────────────────────────────────────────────────────

  startEdit(): void {
    const u = this.user();
    this.fName.set(u?.name        ?? '');
    this.fEmail.set(u?.email      ?? '');
    this.fPhone.set(u?.phone      ?? '');
    this.fBirth.set(u?.birthDate  ?? '');
    this.fSex.set(u?.sex          ?? '');
    this.fWeight.set(String(u?.weight ?? ''));
    this.fHeight.set(String(u?.height ?? ''));
    this.goals.set([...(u?.goals         ?? [])]);
    this.limitations.set([...(u?.limitations ?? [])]);
    this.editing.set(true);
    this.saved.set(false);
  }

  toggleGoal(g: string): void {
    this.goals.update(arr =>
      arr.includes(g) ? arr.filter(x => x !== g) : [...arr, g]
    );
  }

  toggleLimitation(l: string): void {
    this.limitations.update(arr =>
      arr.includes(l) ? arr.filter(x => x !== l) : [...arr, l]
    );
  }

  saveProfile(): void {
    const updated: Partial<UserProfileData> = {
      name:        this.fName()   || undefined,
      phone:       this.fPhone()  || undefined,
      birthDate:   this.fBirth()  || undefined,
      sex:         this.fSex()    || undefined,
      weight:      this.fWeight() ? +this.fWeight() : undefined,
      height:      this.fHeight() ? +this.fHeight() : undefined,
      goals:       this.goals(),
      limitations: this.limitations(),
    };
    this.auth.updateProfile(updated);
    this.saved.set(true);
    setTimeout(() => { this.editing.set(false); this.saved.set(false); }, 1200);
  }

  cancelEdit(): void { this.editing.set(false); }

  goBack():         void { this.router.navigate(['/home']); }
  goSettings():     void { this.router.navigate(['/settings']); }
  goAchievements(): void { this.router.navigate(['/achievements']); }
  goHistory():      void { this.router.navigate(['/history']); }
}
