import { Component, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

type HistoryTab = 'workouts' | 'diet' | 'achievements';

interface WorkoutRecord {
  id:       number;
  date:     string;
  name:     string;
  duration: number;
  exercises: number;
  feeling:  string;
}

interface DietRecord {
  id:      number;
  date:    string;
  kcal:    number;
  goal:    number;
  protein: number;
  carbs:   number;
  fat:     number;
}

interface AchievRecord {
  id:    number;
  date:  string;
  icon:  string;
  title: string;
  rare:  boolean;
}

@Component({
  selector: 'app-history',
  imports: [DecimalPipe],
  templateUrl: './history.html',
  styleUrl:    './history.scss',
})
export class History {
  constructor(private router: Router) {}

  tab = signal<HistoryTab>('workouts');

  workouts: WorkoutRecord[] = [
    { id:1,  date:'26/04/2025', name:'Perna A',         duration:65, exercises:7, feeling:'sentiment_satisfied' },
    { id:2,  date:'24/04/2025', name:'Peito & Tríceps', duration:72, exercises:8, feeling:'fitness_center' },
    { id:3,  date:'22/04/2025', name:'Costas & Bíceps', duration:68, exercises:7, feeling:'sentiment_satisfied' },
    { id:4,  date:'20/04/2025', name:'Ombros',          duration:55, exercises:6, feeling:'sentiment_neutral' },
    { id:5,  date:'18/04/2025', name:'Perna B',         duration:80, exercises:8, feeling:'local_fire_department' },
    { id:6,  date:'16/04/2025', name:'Cardio',          duration:40, exercises:1, feeling:'sentiment_satisfied' },
    { id:7,  date:'14/04/2025', name:'Peito & Tríceps', duration:70, exercises:8, feeling:'fitness_center' },
    { id:8,  date:'12/04/2025', name:'Costas & Bíceps', duration:65, exercises:7, feeling:'sentiment_satisfied' },
    { id:9,  date:'10/04/2025', name:'Perna A',         duration:75, exercises:7, feeling:'local_fire_department' },
    { id:10, date:'08/04/2025', name:'Ombros',          duration:52, exercises:6, feeling:'sentiment_neutral' },
  ];

  diet: DietRecord[] = [
    { id:1, date:'26/04/2025', kcal:1940, goal:2200, protein:148, carbs:210, fat:62 },
    { id:2, date:'25/04/2025', kcal:2210, goal:2200, protein:162, carbs:232, fat:70 },
    { id:3, date:'24/04/2025', kcal:1820, goal:2200, protein:140, carbs:196, fat:58 },
    { id:4, date:'23/04/2025', kcal:2350, goal:2200, protein:170, carbs:248, fat:75 },
    { id:5, date:'22/04/2025', kcal:2080, goal:2200, protein:155, carbs:220, fat:66 },
    { id:6, date:'21/04/2025', kcal:1750, goal:2200, protein:132, carbs:188, fat:55 },
    { id:7, date:'20/04/2025', kcal:2190, goal:2200, protein:158, carbs:230, fat:68 },
    { id:8, date:'19/04/2025', kcal:2040, goal:2200, protein:150, carbs:215, fat:63 },
  ];

  achievements: AchievRecord[] = [
    { id:1, date:'15/04/2025', icon:'eco',                   title:'Verde Todo Dia',       rare:false },
    { id:2, date:'04/04/2025', icon:'volcano',               title:'Sequência de 30 dias', rare:true  },
    { id:3, date:'22/03/2025', icon:'timer',                 title:'Maratonista',          rare:false },
    { id:4, date:'10/03/2025', icon:'wb_twilight',           title:'Madrugador',           rare:false },
    { id:5, date:'20/02/2025', icon:'restaurant',            title:'Dieta Limpa',          rare:false },
    { id:6, date:'15/02/2025', icon:'fitness_center',        title:'10 Treinos',           rare:false },
    { id:7, date:'12/02/2025', icon:'local_fire_department', title:'Sequência de 7 dias',  rare:false },
    { id:8, date:'01/02/2025', icon:'fitness_center',        title:'Primeiro Treino',      rare:false },
  ];

  // ── Stats ─────────────────────────────────────────────────────────────────

  get totalDuration(): number { return this.workouts.reduce((s, w) => s + w.duration, 0); }
  get avgKcal():       number { return Math.round(this.diet.reduce((s, d) => s + d.kcal, 0) / this.diet.length); }
  get onTargetDays():  number { return this.diet.filter(d => d.kcal >= d.goal * 0.85 && d.kcal <= d.goal * 1.1).length; }

  goalPct(d: DietRecord): number { return Math.min((d.kcal / d.goal) * 100, 110); }
  goalColor(d: DietRecord): string {
    const p = this.goalPct(d);
    if (p >= 85 && p <= 110) return 'var(--primary)';
    if (p > 110) return 'var(--danger)';
    return 'var(--warning)';
  }

  goBack(): void { this.router.navigate(['/home']); }
}
