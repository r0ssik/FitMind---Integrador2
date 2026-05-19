import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { NotificationDto } from '../../../core/models/api.models';

type NotifCategory = 'all' | 'workout' | 'diet' | 'water' | 'challenge';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  activeFilter   = signal<NotifCategory>('all');
  notifications  = signal<NotificationDto[]>([]);
  loading        = signal(true);

  filters: { key: NotifCategory; label: string; icon: string }[] = [
    { key: 'all',       label: 'Todas',    icon: 'notifications'        },
    { key: 'workout',   label: 'Treino',   icon: 'fitness_center'       },
    { key: 'diet',      label: 'Dieta',    icon: 'restaurant'           },
    { key: 'water',     label: 'Água',     icon: 'water_drop'           },
    { key: 'challenge', label: 'Desafios', icon: 'emoji_events'         },
  ];

  typeConfig: Record<string, { icon: string; color: string }> = {
    workout:   { icon: 'fitness_center', color: '#4caf50' },
    diet:      { icon: 'restaurant',     color: '#ff9800' },
    water:     { icon: 'water_drop',     color: '#2196f3' },
    challenge: { icon: 'emoji_events',   color: '#9c27b0' },
  };

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getAll().subscribe({
      next:  list => { this.notifications.set(list); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  get filtered(): NotificationDto[] {
    const f = this.activeFilter();
    return f === 'all' ? this.notifications() : this.notifications().filter(n => n.type === f);
  }

  get unreadCount(): number { return this.notifications().filter(n => !n.isRead).length; }

  markRead(id: string): void {
    this.notificationService.markRead(id).subscribe({ error: () => {} });
    this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({ error: () => {} });
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
  }

  dismiss(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  navigate(notif: NotificationDto): void {
    this.markRead(notif.id);
    if (notif.actionRoute) this.router.navigate([notif.actionRoute]);
  }

  typeIcon(type: string): string  { return this.typeConfig[type]?.icon  ?? 'notifications'; }
  typeColor(type: string): string { return this.typeConfig[type]?.color ?? '#666'; }

  goBack(): void { this.router.navigate(['/home']); }
}
