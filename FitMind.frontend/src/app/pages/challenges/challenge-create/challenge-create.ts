import { Component, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';

type ChallengeType = 'individual' | 'group';

@Component({
  selector: 'app-challenge-create',
  imports: [DatePipe],
  templateUrl: './challenge-create.html',
  styleUrl:    './challenge-create.scss',
})
export class ChallengeCreate {
  constructor(private router: Router, private challengeService: ChallengeService) {}

  title    = signal('');
  goal     = signal('');
  deadline = signal('');
  type     = signal<ChallengeType>('individual');
  maxPpl   = signal(5);
  unit     = signal('dias');
  creating = signal(false);
  created  = signal(false);
  error    = signal('');
  errors   = signal<Record<string, string>>({});

  readonly units = ['dias', 'treinos', 'km', 'kg', 'kcal', 'copos de água'];

  canSubmit = computed(() => !!this.title().trim() && !!this.goal().trim() && !!this.deadline());

  minDate = computed(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.title().trim())  errs['title']    = 'Título é obrigatório';
    if (!this.goal().trim())   errs['goal']     = 'Meta é obrigatória';
    if (!this.deadline())      errs['deadline'] = 'Prazo é obrigatório';
    if (isNaN(Number(this.goal()))) errs['goal'] = 'Meta deve ser um número';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  submit(): void {
    if (!this.validate()) return;
    this.creating.set(true);
    this.error.set('');

    const today = new Date().toISOString().split('T')[0];
    this.challengeService.create({
      name:        this.title(),
      description: '',
      type:        this.type() === 'group' ? 'Group' : 'Individual',
      goal:        Number(this.goal()),
      unit:        this.unit(),
      startDate:   today,
      endDate:     this.deadline(),
    }).subscribe({
      next: challenge => {
        this.creating.set(false);
        this.created.set(true);
        setTimeout(() => this.router.navigate(['/challenges', challenge.id]), 1000);
      },
      error: () => {
        this.error.set('Erro ao criar desafio. Tente novamente.');
        this.creating.set(false);
      },
    });
  }

  goBack(): void { this.router.navigate(['/home']); }
}
