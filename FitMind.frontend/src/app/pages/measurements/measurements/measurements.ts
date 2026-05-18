import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

interface MeasRecord {
  id:        number;
  date:      string;
  weight:    number | null;
  bf:        number | null;
  waist:     number | null;
  hip:       number | null;
  chest:     number | null;
  arm:       number | null;
  thigh:     number | null;
}

@Component({
  selector: 'app-measurements',
  imports: [],
  templateUrl: './measurements.html',
  styleUrl:    './measurements.scss',
})
export class Measurements {
  constructor(private router: Router) {}

  // ── State ────────────────────────────────────────────────────────────────────

  showForm  = signal(false);
  saved     = signal(false);

  // Form fields
  fWeight = signal('');
  fBf     = signal('');
  fWaist  = signal('');
  fHip    = signal('');
  fChest  = signal('');
  fArm    = signal('');
  fThigh  = signal('');

  // ── Mock historical records ──────────────────────────────────────────────────

  records = signal<MeasRecord[]>([
    { id: 6, date: '15/04/2025', weight: 78.6, bf: 18.2, waist: 83, hip: 94, chest: 98,  arm: 34, thigh: 56 },
    { id: 5, date: '01/04/2025', weight: 79.4, bf: 18.8, waist: 84, hip: 95, chest: 99,  arm: 33, thigh: 57 },
    { id: 4, date: '15/03/2025', weight: 80.4, bf: 19.5, waist: 85, hip: 96, chest: 100, arm: 33, thigh: 58 },
    { id: 3, date: '01/03/2025', weight: 81.5, bf: 20.1, waist: 86, hip: 96, chest: 100, arm: 32, thigh: 58 },
    { id: 2, date: '15/02/2025', weight: 82.7, bf: 20.8, waist: 87, hip: 97, chest: 101, arm: 32, thigh: 59 },
    { id: 1, date: '01/02/2025', weight: 84.2, bf: 21.5, waist: 88, hip: 98, chest: 102, arm: 31, thigh: 60 },
  ]);

  latest = computed(() => this.records()[0] ?? null);

  // ── Diffs vs previous record ──────────────────────────────────────────────────

  diff(field: keyof MeasRecord): string {
    const recs = this.records();
    if (recs.length < 2) return '';
    const cur  = recs[0][field] as number | null;
    const prev = recs[1][field] as number | null;
    if (cur == null || prev == null) return '';
    const d = +(cur - prev).toFixed(1);
    if (d === 0) return '=';
    return (d > 0 ? '+' : '') + d;
  }

  diffClass(field: keyof MeasRecord, lowerIsBetter = true): string {
    const recs = this.records();
    if (recs.length < 2) return '';
    const cur  = recs[0][field] as number | null;
    const prev = recs[1][field] as number | null;
    if (cur == null || prev == null) return '';
    const d = cur - prev;
    if (d === 0) return 'diff-neutral';
    const good = lowerIsBetter ? d < 0 : d > 0;
    return good ? 'diff-good' : 'diff-bad';
  }

  // ── Form actions ──────────────────────────────────────────────────────────────

  openForm(): void  { this.showForm.set(true); this.saved.set(false); }
  closeForm(): void { this.showForm.set(false); this.resetForm(); }

  saveRecord(): void {
    const now  = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const nextId = (this.records()[0]?.id ?? 0) + 1;

    const rec: MeasRecord = {
      id:     nextId,
      date,
      weight: this.fWeight() ? +this.fWeight() : null,
      bf:     this.fBf()     ? +this.fBf()     : null,
      waist:  this.fWaist()  ? +this.fWaist()  : null,
      hip:    this.fHip()    ? +this.fHip()    : null,
      chest:  this.fChest()  ? +this.fChest()  : null,
      arm:    this.fArm()    ? +this.fArm()    : null,
      thigh:  this.fThigh()  ? +this.fThigh()  : null,
    };

    this.records.update(r => [rec, ...r]);
    this.saved.set(true);
    this.resetForm();
    setTimeout(() => { this.showForm.set(false); this.saved.set(false); }, 1400);
  }

  private resetForm(): void {
    this.fWeight.set(''); this.fBf.set('');    this.fWaist.set('');
    this.fHip.set('');    this.fChest.set(''); this.fArm.set(''); this.fThigh.set('');
  }

  canSave = computed(() =>
    !!(this.fWeight() || this.fBf() || this.fWaist() || this.fHip() ||
       this.fChest()  || this.fArm()  || this.fThigh())
  );

  // ── Helpers ───────────────────────────────────────────────────────────────────

  bfCategory(bf: number | null): string {
    if (bf == null) return '';
    if (bf < 10) return 'Atlético';
    if (bf < 18) return 'Fitness';
    if (bf < 25) return 'Saudável';
    if (bf < 32) return 'Sobrepeso';
    return 'Obeso';
  }

  goBack(): void { this.router.navigate(['/progress']); }
}
