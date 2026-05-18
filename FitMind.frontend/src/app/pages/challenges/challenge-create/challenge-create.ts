import { Component, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

type ChallengeType = 'individual' | 'group';

@Component({
  selector: 'app-challenge-create',
  imports: [DatePipe],
  templateUrl: './challenge-create.html',
  styleUrl:    './challenge-create.scss',
})
export class ChallengeCreate {
  constructor(private router: Router) {}

  // ── Form fields ──────────────────────────────────────────────────────────────

  title    = signal('');
  goal     = signal('');
  deadline = signal('');
  type     = signal<ChallengeType>('individual');
  maxPpl   = signal(5);
  unit     = signal('dias');
  creating = signal(false);
  created  = signal(false);
  errors   = signal<Record<string, string>>({});

  readonly units = ['dias', 'treinos', 'km', 'kg', 'kcal', 'copos de água'];

  // ── Computed ──────────────────────────────────────────────────────────────────

  canSubmit = computed(() =>
    !!this.title().trim() && !!this.goal().trim() && !!this.deadline()
  );

  minDate = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.title().trim())  errs['title']    = 'Título é obrigatório';
    if (!this.goal().trim())   errs['goal']     = 'Meta é obrigatória';
    if (!this.deadline())      errs['deadline'] = 'Prazo é obrigatório';
    if (this.type() === 'group' && (this.maxPpl() < 2 || this.maxPpl() > 10))
      errs['maxPpl'] = 'Grupo deve ter entre 2 e 10 participantes';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  submit(): void {
    if (!this.validate()) return;
    this.creating.set(true);
    setTimeout(() => {
      this.creating.set(false);
      this.created.set(true);
      // Navigate to the new challenge detail (mock id = 99)
      setTimeout(() => this.router.navigate(['/challenges', 99]), 1000);
    }, 1200);
  }

  goBack(): void { this.router.navigate(['/home']); }
}
