import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { SettingsService } from '../../../services/settings.service';
import { UserSettingsDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl:    './settings.scss',
})
export class Settings implements OnInit {
  constructor(
    private auth: Auth,
    private router: Router,
    private settingsService: SettingsService,
  ) {}

  loading = signal(true);

  notifWorkout     = signal(true);
  notifDiet        = signal(true);
  notifWater       = signal(true);
  notifChallenge   = signal(true);
  notifSocial      = signal(false);
  notifAchievement = signal(true);

  publicProfile  = signal(true);
  showActivity   = signal(true);
  showWeight     = signal(false);

  theme = signal<'light' | 'dark' | 'system'>('system');
  lang  = signal<'pt' | 'en'>('pt');

  showLogoutConfirm = signal(false);

  get isAdmin(): boolean {
    return this.auth.currentUser()?.isAdmin ?? false;
  }

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: s => {
        this.notifWorkout.set(s.notifWorkout);
        this.notifDiet.set(s.notifDiet);
        this.notifWater.set(s.notifWater);
        this.notifChallenge.set(s.notifChallenge);
        this.notifSocial.set(s.notifSocial);
        this.notifAchievement.set(s.notifAchievement);
        this.publicProfile.set(s.publicProfile);
        this.showActivity.set(s.showActivity);
        this.showWeight.set(s.showWeight);
        this.theme.set((s.theme as 'light' | 'dark' | 'system') ?? 'system');
        this.lang.set((s.language as 'pt' | 'en') ?? 'pt');
        this.loading.set(false);
        this.applyTheme(this.theme());
      },
      error: () => this.loading.set(false),
    });
  }

  saveField(field: keyof UserSettingsDto, value: unknown): void {
    this.settingsService.update({ [field]: value }).subscribe({ error: () => {} });
  }

  toggle(field: keyof UserSettingsDto, sig: ReturnType<typeof signal<boolean>>): void {
    const next = !sig();
    sig.set(next);
    this.saveField(field, next);
  }

  setTheme(t: 'light' | 'dark' | 'system'): void {
    this.theme.set(t);
    this.applyTheme(t);
    this.saveField('theme', t);
  }

  applyTheme(t: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('fitmind_theme', 'dark');
    } else if (t === 'light') {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('fitmind_theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('fitmind_theme');
    }
  }

  setLang(l: 'pt' | 'en'): void {
    this.lang.set(l);
    this.saveField('language', l);
  }

  confirmLogout():  void { this.auth.logout(); }
  goBack():         void { this.router.navigate(['/home']); }
  goProfile():      void { this.router.navigate(['/profile']); }
  goAdmin():        void { this.router.navigate(['/admin']); }
  goAdminUsers():   void { this.router.navigate(['/admin/users']); }
}
