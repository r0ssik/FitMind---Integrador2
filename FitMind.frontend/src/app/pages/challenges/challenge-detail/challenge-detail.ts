import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { Auth } from '../../../services/auth';
import { ChallengeDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-challenge-detail',
  imports: [DecimalPipe],
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

  activeTab  = signal<'ranking' | 'progress' | 'participants'>('ranking');
  challenge  = signal<ChallengeDto | null>(null);
  showInvite = signal(false);
  linkCopied = signal(false);
  loading    = signal(true);
  error      = signal('');

  get inviteLink(): string { return `${window.location.origin}/challenges/${this.challenge()?.id}`; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.challengeService.getById(id).subscribe({
      next:  c => { this.challenge.set(c); this.loading.set(false); },
      error: () => { this.error.set('Desafio não encontrado.'); this.loading.set(false); },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  isMe(userId: string): boolean {
    return this.auth.currentUser()?.id === userId;
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

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

  // ── Progress chart ────────────────────────────────────────────────────────────

  get progressHistory(): number[] {
    return this.ranking().map(p => p.currentProgress);
  }

  miniBarRects = computed(() => {
    const data  = this.progressHistory;
    const maxV  = Math.max(...data, 1);
    const total = data.length || 1;
    const bw    = 320 / total - 3;
    return data.map((val, i) => ({
      x:       +(i * (320 / total) + 1).toFixed(1),
      y:       +(80 - (val / maxV) * 72).toFixed(1),
      w:       +bw.toFixed(1),
      h:       +((val / maxV) * 72).toFixed(1),
      value:   val,
      opacity: +(0.5 + (i / total) * 0.5).toFixed(2),
    }));
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  joinChallenge(): void {
    const id = this.challenge()?.id;
    if (!id) return;
    this.challengeService.join(id).subscribe({
      next:  () => this.challengeService.getById(id).subscribe({ next: c => this.challenge.set(c), error: () => {} }),
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

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  goBack(): void { this.router.navigate(['/home']); }
}
