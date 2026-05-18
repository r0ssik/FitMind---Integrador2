import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl:    './settings.scss',
})
export class Settings {
  constructor(private auth: Auth, private router: Router) {}

  // ── Notification toggles ──────────────────────────────────────────────────

  notifWorkout    = signal(true);
  notifDiet       = signal(true);
  notifWater      = signal(true);
  notifChallenge  = signal(true);
  notifSocial     = signal(false);
  notifAchievement = signal(true);

  // ── Privacy toggles ───────────────────────────────────────────────────────

  publicProfile   = signal(true);
  showActivity    = signal(true);
  showWeight      = signal(false);

  // ── Theme ─────────────────────────────────────────────────────────────────

  theme  = signal<'light' | 'dark' | 'system'>('system');
  lang   = signal<'pt' | 'en'>('pt');

  // ── Logout modal ──────────────────────────────────────────────────────────

  showLogoutConfirm = signal(false);

  confirmLogout(): void {
    this.auth.logout();
  }

  goBack():       void { this.router.navigate(['/home']); }
  goProfile():    void { this.router.navigate(['/profile']); }
  goAdmin():      void { this.router.navigate(['/admin']); }
  goAdminUsers(): void { this.router.navigate(['/admin/users']); }
}
