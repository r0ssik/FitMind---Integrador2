import { Component, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Auth } from '../../../services/auth';
import { ProgressService } from '../../../services/progress.service';
import { WaterService } from '../../../services/water.service';
import { SocialService } from '../../../services/social.service';
import { ChallengeService } from '../../../services/challenge.service';
import { NotificationService } from '../../../services/notification.service';

import {
  DashboardProgressDto,
  PostDto,
  ChallengeDto,
  WaterIntakeDto,
  NotificationDto
} from '../../../core/models/api.models';

@Component({
  selector: 'app-home',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  activeNav = signal('home');

  dashboard = signal<DashboardProgressDto | null>(null);
  water     = signal<WaterIntakeDto | null>(null);
  feed      = signal<PostDto[]>([]);
  challenges = signal<ChallengeDto[]>([]);

  notifications = signal<NotificationDto[]>([]);

  unreadNotifications = signal(0);

  waterCups = signal<boolean[]>([]);
  waterGoal = 8;

  constructor(
    private auth: Auth,
    private router: Router,
    private progressService: ProgressService,
    private waterService: WaterService,
    private socialService: SocialService,
    private challengeService: ChallengeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.loadNotifications();

    this.progressService.getDashboard().subscribe({
      next: d => {
        this.dashboard.set(d);

        const total = d.waterGoal || 8;
        const cups  = d.waterCups || 0;

        this.waterGoal = total;

        this.waterCups.set(
          Array.from({ length: total }, (_, i) => i < cups)
        );
      },

      error: () => {}
    });

    this.waterService.getToday().subscribe({
      next: w => {

        this.water.set(w);

        this.waterGoal = w.goal;

        this.waterCups.set(
          Array.from({ length: w.goal }, (_, i) => i < w.cups)
        );
      },

      error: () => {}
    });

    this.socialService.getFeed(1, 3).subscribe({
      next: posts => this.feed.set(posts),
      error: () => {}
    });

    this.challengeService.getAll().subscribe({
      next: c => this.challenges.set(c.slice(0, 3)),
      error: () => {}
    });
  }

  loadNotifications(): void {

    this.notificationService.getAll().subscribe({

      next: (list) => {

        this.notifications.set(list);

        this.unreadNotifications.set(
          list.filter(n => !n.isRead).length
        );
      },

      error: (err) => {
        console.error(err);
      }
    });
  }

  get userName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Usuário';
  }

  get userInitials(): string {

    const name = this.auth.currentUser()?.name ?? 'U';

    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get isAdmin(): boolean {
    return this.auth.currentUser()?.isAdmin ?? false;
  }

  get workoutDone(): number {
    return this.dashboard()?.todayWorkoutDone ?? 0;
  }

  get workoutTotal(): number {
    return this.dashboard()?.todayWorkoutTotal ?? 0;
  }

  get workoutProgress(): number {

    const t = this.workoutTotal;

    if (!t) return this.workoutDone > 0 ? 100 : 0;

    return Math.min((this.workoutDone / t) * 100, 100);
  }

  get workoutLabel(): string {

    const done = this.workoutDone;
    const total = this.workoutTotal;

    if (!total && !done) return '0 exercícios';

    if (!total) return `${done} exercícios concluídos`;

    return `${Math.min(done, total)}/${total} exercícios concluídos`;
  }

  get waterDone(): number {
    return this.water()?.cups ?? 0;
  }

  get waterProgress(): number {

    return (
      ((this.water()?.cups ?? 0) /
      (this.water()?.goal ?? 8)) * 100
    );
  }

  get totalCalories(): number {
    return this.dashboard()?.todayCalories ?? 0;
  }

  get calorieGoal(): number {
    return this.dashboard()?.calorieGoal ?? 2000;
  }

  get caloriePct(): number {

    return Math.min(
      (this.totalCalories / this.calorieGoal) * 100,
      100
    );
  }

  toggleCup(index: number): void {

    const cups = [...this.waterCups()];

    cups[index] = !cups[index];

    this.waterCups.set(cups);

    const count = cups.filter(c => c).length;

    const current = this.water();

    if (current) {
      this.water.set({
        ...current,
        cups: count
      });
    }

    this.waterService
      .setCups({ cups: count })
      .subscribe({
        error: () => {}
      });
  }

  toggleLike(post: PostDto): void {

    if (post.isLikedByCurrentUser) {

      this.socialService
        .unlikePost(post.id)
        .subscribe({ error: () => {} });

    } else {

      this.socialService
        .likePost(post.id)
        .subscribe({ error: () => {} });
    }

    this.feed.update(list =>
      list.map(p =>
        p.id === post.id
          ? {
              ...p,
              isLikedByCurrentUser: !p.isLikedByCurrentUser,
              likesCount:
                p.likesCount +
                (p.isLikedByCurrentUser ? -1 : 1)
            }
          : p
      )
    );
  }

  challengeProgress(c: ChallengeDto): number {

    if (!c.myProgress) return 0;

    return Math.min((c.myProgress / c.goal) * 100, 100);
  }

  goChallenge(id: string): void {
    this.router.navigate(['/challenges', id]);
  }

  logout(): void {
    this.auth.logout();
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }

  goNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  goAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigate(section: string): void {

    const map: Record<string, string> = {
      home: '/home',
      workout: '/workout-plans',
      diet: '/food-diary',
      progress: '/progress',
      social: '/social',
    };

    this.activeNav.set(section);

    const route = map[section];

    if (route && route !== '/home') {
      this.router.navigate([route]);
    }
  }
}