import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AchievementService } from '../../../services/achievement.service';
import { AchievementDto } from '../../../core/models/api.models';

type AchievCategory = 'all' | 'workout' | 'diet' | 'streak' | 'challenge';

@Component({
  selector: 'app-achievements',
  imports: [DecimalPipe],
  templateUrl: './achievements.html',
  styleUrl:    './achievements.scss',
})
export class Achievements implements OnInit {
  constructor(private router: Router, private achievementService: AchievementService) {}

  filter      = signal<AchievCategory>('all');
  loading     = signal(true);
  shareTarget = signal<AchievementDto | null>(null);
  shareCopied = signal(false);

  readonly categories: { key: AchievCategory; label: string; icon: string }[] = [
    { key: 'all',       label: 'Todas',     icon: 'military_tech'        },
    { key: 'workout',   label: 'Treino',    icon: 'fitness_center'       },
    { key: 'diet',      label: 'Dieta',     icon: 'restaurant'           },
    { key: 'streak',    label: 'Sequência', icon: 'local_fire_department'},
    { key: 'challenge', label: 'Desafio',   icon: 'emoji_events'         },
  ];

  allAchievements = signal<AchievementDto[]>([]);

  filtered = computed(() => {
    const f = this.filter();
    return f === 'all'
      ? this.allAchievements()
      : this.allAchievements().filter(a => a.category.toLowerCase() === f);
  });

  filteredUnlocked = computed(() => this.filtered().filter(a =>  a.unlocked));
  filteredLocked   = computed(() => this.filtered().filter(a => !a.unlocked));

  ngOnInit(): void {
    this.achievementService.getAll().subscribe({
      next:  list => { this.allAchievements.set(list); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  openShare(a: AchievementDto): void {
    if (!a.unlocked) return;
    this.shareTarget.set(a); this.shareCopied.set(false);
  }

  closeShare(): void { this.shareTarget.set(null); }

  copyShare(): void {
    const a = this.shareTarget();
    if (!a) return;
    const text = `Acabei de ganhar a conquista "${a.name}" no FitMind! #FitMind #Fitness`;
    navigator.clipboard?.writeText(text).catch(() => {});
    this.shareCopied.set(true);
    setTimeout(() => this.shareCopied.set(false), 2000);
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  goBack(): void { this.router.navigate(['/home']); }
}
