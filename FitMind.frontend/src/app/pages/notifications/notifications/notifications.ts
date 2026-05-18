import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

type NotifCategory = 'all' | 'workout' | 'diet' | 'water' | 'challenge';

interface Notification {
  id: number;
  type: 'workout' | 'diet' | 'water' | 'challenge';
  title: string;
  body: string;
  time: Date;
  read: boolean;
  action?: string;
  actionRoute?: string;
}

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  activeFilter = signal<NotifCategory>('all');

  notifications = signal<Notification[]>([
    {
      id: 1,
      type: 'workout',
      title: 'Treino pendente',
      body: 'Você ainda não realizou seu treino de hoje (Perna). Não perca o ritmo!',
      time: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      action: 'Ver treino',
      actionRoute: '/workout-plans',
    },
    {
      id: 2,
      type: 'diet',
      title: 'Hora do almoço',
      body: 'Seu plano alimentar sugere: Frango grelhado (200g), arroz integral (150g) e salada.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      action: 'Ver plano alimentar',
    },
    {
      id: 3,
      type: 'water',
      title: 'Hidratação',
      body: 'Baseado no seu peso (75kg), você deveria ter tomado 5 copos de água até agora. Beba mais!',
      time: new Date(Date.now() - 1000 * 60 * 60 * 3),
      read: false,
      action: 'Registrar consumo',
      actionRoute: '/home',
    },
    {
      id: 4,
      type: 'challenge',
      title: 'Desafio: 30 dias de treino',
      body: 'Você está no dia 14 de 30! Faltam 16 dias para completar seu desafio. Continue assim!',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      action: 'Ver desafio',
    },
    {
      id: 5,
      type: 'diet',
      title: 'Lanche da tarde gerado por IA',
      body: 'Sugestão de lanche: 1 banana + pasta de amendoim (30g) = 210 kcal. Registrar?',
      time: new Date(Date.now() - 1000 * 60 * 60 * 6),
      read: true,
      action: 'Registrar refeição',
    },
    {
      id: 6,
      type: 'workout',
      title: 'Treino de ontem concluído!',
      body: 'Parabéns! Você completou o treino de costas de ontem. +50 XP conquistados.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 26),
      read: true,
    },
    {
      id: 7,
      type: 'water',
      title: 'Meta de hidratação atingida!',
      body: 'Você bebeu 8 copos de água hoje. Meta diária concluída!',
      time: new Date(Date.now() - 1000 * 60 * 60 * 27),
      read: true,
    },
    {
      id: 8,
      type: 'challenge',
      title: 'Novo desafio disponível',
      body: '"Desafio Hidratação Extrema" foi publicado por Emily Mekaru. Participe!',
      time: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      action: 'Ver desafio',
    },
  ]);

  filters: { key: NotifCategory; label: string; icon: string }[] = [
    { key: 'all',       label: 'Todas',    icon: 'notifications' },
    { key: 'workout',   label: 'Treino',   icon: 'fitness_center' },
    { key: 'diet',      label: 'Dieta',    icon: 'restaurant' },
    { key: 'water',     label: 'Água',     icon: 'water_drop' },
    { key: 'challenge', label: 'Desafios', icon: 'emoji_events' },
  ];

  typeConfig: Record<string, { icon: string; color: string }> = {
    workout:   { icon: 'fitness_center', color: '#4caf50' },
    diet:      { icon: 'restaurant',     color: '#ff9800' },
    water:     { icon: 'water_drop',     color: '#2196f3' },
    challenge: { icon: 'emoji_events',   color: '#9c27b0' },
  };

  constructor(private router: Router) {}

  get filtered(): Notification[] {
    const f = this.activeFilter();
    const list = f === 'all' ? this.notifications() : this.notifications().filter(n => n.type === f);
    return list;
  }

  get unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  markRead(id: number): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  dismiss(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  navigate(notif: Notification): void {
    this.markRead(notif.id);
    if (notif.actionRoute) this.router.navigate([notif.actionRoute]);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
