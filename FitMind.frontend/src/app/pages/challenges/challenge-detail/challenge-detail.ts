import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Participant {
  id:       number;
  name:     string;
  initials: string;
  current:  number;
  isMe:     boolean;
}

interface ChallengeData {
  id:       number;
  title:    string;
  goal:     number;
  unit:     string;
  type:     'individual' | 'group';
  deadline: string;
  daysLeft: number;
  icon:     string;
  participants: Participant[];
}

@Component({
  selector: 'app-challenge-detail',
  imports: [DecimalPipe],
  templateUrl: './challenge-detail.html',
  styleUrl:    './challenge-detail.scss',
})
export class ChallengeDetail implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  activeTab = signal<'ranking' | 'progress' | 'participants'>('ranking');
  challenge = signal<ChallengeData | null>(null);
  showInvite = signal(false);
  inviteLink = signal('https://fitmind.app/join/ABC123');
  linkCopied = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.challenge.set(this.mockChallenge(id));
  }

  private mockChallenge(id: number): ChallengeData {
    const isNew = id === 99;
    return {
      id,
      title:    isNew ? 'Meu novo desafio' : '30 dias de treino',
      goal:     isNew ? 30 : 30,
      unit:     'dias',
      type:     'group',
      deadline: '30/05/2025',
      daysLeft: 34,
      icon:     'emoji_events',
      participants: [
        { id: 4, name: 'Carlos Silva',  initials: 'CS', current: 28, isMe: false },
        { id: 1, name: 'Você',          initials: 'EU', current: 22, isMe: true  },
        { id: 2, name: 'João Barros',   initials: 'JB', current: 20, isMe: false },
        { id: 3, name: 'Emily Mekaru',  initials: 'EM', current: 18, isMe: false },
        { id: 5, name: 'Ana Lima',      initials: 'AL', current: 15, isMe: false },
      ],
    };
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

  myProgress = computed(() => {
    const c = this.challenge();
    if (!c) return null;
    const me = c.participants.find(p => p.isMe);
    return me ?? null;
  });

  myPct = computed(() => {
    const c = this.challenge();
    const me = this.myProgress();
    if (!c || !me) return 0;
    return Math.min((me.current / c.goal) * 100, 100);
  });

  ranking = computed(() => {
    const c = this.challenge();
    if (!c) return [];
    return [...c.participants].sort((a, b) => b.current - a.current);
  });

  myRank = computed(() => this.ranking().findIndex(p => p.isMe) + 1);

  // ── History points for mini chart ─────────────────────────────────────────────

  progressHistory = [5, 8, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  miniBarRects = computed(() => {
    const data  = this.progressHistory;
    const maxV  = data[data.length - 1] || 1;
    const total = data.length;
    const bw    = 320 / total - 3;
    return data.map((val, i) => {
      const bh = (val / maxV) * 72;
      return {
        x:       +(i * (320 / total) + 1).toFixed(1),
        y:       +(80 - bh).toFixed(1),
        w:       +bw.toFixed(1),
        h:       +bh.toFixed(1),
        value:   val,
        opacity: +(0.5 + (i / total) * 0.5).toFixed(2),
      };
    });
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  copyInvite(): void {
    navigator.clipboard?.writeText(this.inviteLink()).catch(() => {});
    this.linkCopied.set(true);
    setTimeout(() => this.linkCopied.set(false), 2000);
  }

  pct(current: number): number {
    return Math.min((current / (this.challenge()?.goal ?? 1)) * 100, 100);
  }

  medalFor(rank: number): string {
    return `${rank}º`;
  }

  goBack(): void { this.router.navigate(['/home']); }
}
