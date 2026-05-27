import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { NotificationDto } from '../../../core/models/api.models';

type NotifCategory =
  | 'all'
  | 'social'
  | 'like'
  | 'comment'
  | 'follow'
  | 'challenge';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {

  activeFilter = signal<NotifCategory>('all');

  notifications = signal<NotificationDto[]>([]);

  loading = signal(true);

  filters: { key: NotifCategory; label: string; icon: string }[] = [
    {
      key: 'all',
      label: 'Todas',
      icon: 'notifications'
    },

    {
      key: 'social',
      label: 'Sociais',
      icon: 'groups'
    },

    {
      key: 'like',
      label: 'Curtidas',
      icon: 'favorite'
    },

    {
      key: 'comment',
      label: 'Comentários',
      icon: 'chat'
    },

    {
      key: 'follow',
      label: 'Seguidores',
      icon: 'person_add'
    },

    {
      key: 'challenge',
      label: 'Desafios',
      icon: 'emoji_events'
    }
  ];

  typeConfig: Record<string, { icon: string; color: string }> = {

    social: {
      icon: 'groups',
      color: '#22c55e'
    },

    like: {
      icon: 'favorite',
      color: '#ef4444'
    },

    comment: {
      icon: 'chat',
      color: '#3b82f6'
    },

    follow: {
      icon: 'person_add',
      color: '#a855f7'
    },

    challenge: {
      icon: 'emoji_events',
      color: '#f59e0b'
    },

    workout: {
      icon: 'fitness_center',
      color: '#22c55e'
    },

    diet: {
      icon: 'restaurant',
      color: '#f97316'
    },

    water: {
      icon: 'water_drop',
      color: '#06b6d4'
    },

    achievement: {
      icon: 'military_tech',
      color: '#eab308'
    }
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationService.getAll().subscribe({
      next: list => {

        // padroniza tudo para lowercase
        const normalized = list.map(n => ({
          ...n,
          type: n.type.toLowerCase()
        }));

        console.log(normalized);

        this.notifications.set(normalized);

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      },
    });
  }

  get filtered(): NotificationDto[] {

    const f = this.activeFilter();

    if (f === 'all') {
      return this.notifications();
    }

    return this.notifications().filter(
      n => n.type.toLowerCase() === f
    );
  }

  get unreadCount(): number {
    return this.notifications().filter(n => !n.isRead).length;
  }

  markRead(id: string): void {

    this.notificationService.markRead(id)
      .subscribe({ error: () => {} });

    this.notifications.update(list =>
      list.map(n =>
        n.id === id
          ? { ...n, isRead: true }
          : n
      )
    );
  }

  markAllRead(): void {

    this.notificationService.markAllRead()
      .subscribe({ error: () => {} });

    this.notifications.update(list =>
      list.map(n => ({
        ...n,
        isRead: true
      }))
    );
  }

  dismiss(id: string): void {

    this.notifications.update(list =>
      list.filter(n => n.id !== id)
    );
  }

  navigate(notif: NotificationDto): void {

    this.markRead(notif.id);

    if (notif.actionRoute) {
      this.router.navigate([notif.actionRoute]);
    }
  }

  typeIcon(type: string): string {

    return this.typeConfig[type?.toLowerCase()]?.icon
      ?? 'notifications';
  }

  typeColor(type: string): string {

    return this.typeConfig[type?.toLowerCase()]?.color
      ?? '#666';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}