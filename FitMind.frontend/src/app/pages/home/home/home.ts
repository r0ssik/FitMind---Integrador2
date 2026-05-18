import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';


interface WorkoutExercise {
  name: string;
  sets: string;
  done: boolean;
}

interface Meal {
  name: string;
  time: string;
  calories: number;
}

interface Challenge {
  name: string;
  icon: string;
  current: number;
  total: number;
  unit: string;
}

interface FeedPost {
  user: string;
  initials: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  comments: number;
}

@Component({
  selector: 'app-home',
  imports: [DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  activeNav = signal('home');

  waterCups = signal([true, true, true, false, false, false, false, false]);
  waterGoal = 8;

  workout: WorkoutExercise[] = [
    { name: 'Agachamento', sets: '4x12', done: true },
    { name: 'Leg Press', sets: '3x15', done: true },
    { name: 'Cadeira Extensora', sets: '3x15', done: false },
    { name: 'Panturrilha', sets: '4x20', done: false },
  ];

  meals: Meal[] = [
    { name: 'Café da manhã', time: '07:30', calories: 420 },
    { name: 'Almoço', time: '12:00', calories: 680 },
    { name: 'Lanche', time: '15:30', calories: 210 },
    { name: 'Jantar', time: '19:00', calories: 0 },
  ];

  challenges: Challenge[] = [
    { name: '30 dias de treino', icon: 'emoji_events', current: 14, total: 30, unit: 'dias' },
    { name: 'Beber 2L de água',  icon: 'water_drop',   current: 3,  total: 8,  unit: 'copos' },
  ];

  feed: FeedPost[] = [
    { user: 'João Barros',  initials: 'JB', text: 'Completei meu desafio de 30 dias! Nunca me senti tão bem!',     time: '2h atrás', likes: 24, liked: false, comments: 5 },
    { user: 'Emily Mekaru', initials: 'EM', text: 'Treino de hoje concluído! Pernas destruídas.',                  time: '4h atrás', likes: 18, liked: true,  comments: 3 },
    { user: 'Carlos Silva', initials: 'CS', text: 'Novo recorde pessoal no supino: 100kg! Meses de dedicação.',    time: '6h atrás', likes: 42, liked: false, comments: 11 },
  ];

  get workoutDone(): number {
    return this.workout.filter(w => w.done).length;
  }

  get workoutProgress(): number {
    return (this.workoutDone / this.workout.length) * 100;
  }

  get waterDone(): number {
    return this.waterCups().filter(c => c).length;
  }

  get waterProgress(): number {
    return (this.waterDone / this.waterGoal) * 100;
  }

  get totalCalories(): number {
    return this.meals.reduce((sum, m) => sum + m.calories, 0);
  }

  get caloriePct(): number {
    return Math.min((this.totalCalories / 2000) * 100, 100);
  }

  get userName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Usuário';
  }

  get userInitials(): string {
    const name = this.auth.currentUser()?.name ?? 'U';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  constructor(private auth: Auth, private router: Router) {}

  toggleCup(index: number): void {
    const cups = [...this.waterCups()];
    cups[index] = !cups[index];
    this.waterCups.set(cups);
  }

  toggleExercise(index: number): void {
    this.workout[index].done = !this.workout[index].done;
  }

  toggleLike(post: FeedPost): void {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }

  logout(): void {
    this.auth.logout();
  }

  challengeProgress(c: Challenge): number {
    return (c.current / c.total) * 100;
  }

  goProfile():       void { this.router.navigate(['/profile']); }
  goNotifications(): void { this.router.navigate(['/notifications']); }

  navigate(section: string): void {
    const map: Record<string, string> = {
      home:     '/home',
      workout:  '/workout-plans',
      diet:     '/food-diary',
      progress: '/progress',
      social:   '/social',
    };
    this.activeNav.set(section);
    const route = map[section];
    if (route && route !== '/home') this.router.navigate([route]);
  }
}
