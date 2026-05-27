import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { Auth } from '../../../services/auth';
import { ChallengeDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-challenge-detail',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './challenge-detail.html',
  styleUrl:    './challenge-detail.scss',
})
export class ChallengeDetail implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private challengeService: ChallengeService,
    private auth: Auth,
  ) {}

  challenge   = signal<ChallengeDto | null>(null);
  showInvite  = signal(false);
  linkCopied  = signal(false);
  loading     = signal(true);
  error       = signal('');

  // ── Registrar progresso ───────────────────────────────────────────────────────
  showProgress  = signal(false);
  progressInput = signal(0);
  savingProgress = signal(false);
  progressSaved  = signal(false);

  get inviteLink(): string { return `${window.location.origin}/challenges/${this.challenge()?.id}`; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadChallenge(id);
  }

  private loadChallenge(id: string): void {
    this.challengeService.getById(id).subscribe({
      next:  c => { this.challenge.set(c); this.loading.set(false); },
      error: () => { this.error.set('Desafio não encontrado.'); this.loading.set(false); },
    });
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

  isMe(userId: string): boolean {
    return this.auth.currentUser()?.id === userId;
  }

  myProgress = computed(() => {
    const c = this.challenge();
    const me = this.auth.currentUser();
    if (!c || !me) return null;
    return c.participants.find(p => p.userId === me.id) ?? null;
  });

  myPct = computed(() => {
    const c = this.challenge();
    const mp = this.myProgress();
    if (!c || !mp) return 0;
    return Math.min((mp.currentProgress / c.goal) * 100, 100);
  });

  ranking = computed(() => {
    const c = this.challenge();
    if (!c) return [];
    return [...c.participants].sort((a, b) => b.currentProgress - a.currentProgress);
  });

  myRank = computed(() => {
    const me = this.auth.currentUser();
    if (!me) return 0;
    const idx = this.ranking().findIndex(p => p.userId === me.id);
    return idx >= 0 ? idx + 1 : 0;
  });

  // ── Registrar progresso ───────────────────────────────────────────────────────

  openProgress(): void {
    this.progressInput.set(this.myProgress()?.currentProgress ?? 0);
    this.progressSaved.set(false);
    this.showProgress.set(true);
  }

  addQuick(amount: number): void {
    const current = this.progressInput();
    const goal = this.challenge()?.goal ?? 999999;
    this.progressInput.set(Math.min(current + amount, goal));
  }

  saveProgress(): void {
    const c = this.challenge();
    const val = this.progressInput();
    if (!c || val < 0) return;

    this.savingProgress.set(true);
    this.challengeService.updateProgress(c.id, { progress: val }).subscribe({
      next: () => {
        this.savingProgress.set(false);
        this.progressSaved.set(true);
        this.showProgress.set(false);
        // Recarrega o desafio para atualizar ranking e progresso
        this.loadChallenge(c.id);
        setTimeout(() => this.progressSaved.set(false), 3000);
      },
      error: () => this.savingProgress.set(false),
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  joinChallenge(): void {
    const c = this.challenge();
    if (!c) return;
    this.challengeService.join(c.id).subscribe({
      next: () => this.loadChallenge(c.id),
      error: () => {},
    });
  }

  copyInvite(): void {
    navigator.clipboard?.writeText(this.inviteLink).catch(() => {});
    this.linkCopied.set(true);
    setTimeout(() => this.linkCopied.set(false), 2000);
  }

  medalFor(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}º`;
  }

  pct(current: number): number {
    return Math.min((current / (this.challenge()?.goal ?? 1)) * 100, 100);
  }

  goBack(): void { this.router.navigate(['/home']); }
}
