import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeasurementService } from '../../../services/measurement.service';
import { MeasurementDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-measurements',
  imports: [],
  templateUrl: './measurements.html',
  styleUrl:    './measurements.scss',
})
export class Measurements implements OnInit {
  constructor(private router: Router, private measurementService: MeasurementService) {}

  showForm = signal(false);
  saved    = signal(false);
  loading  = signal(true);

  fWeight = signal(''); fBf    = signal(''); fWaist = signal('');
  fHip    = signal(''); fChest = signal(''); fArm   = signal(''); fThigh = signal('');

  records = signal<MeasurementDto[]>([]);
  latest  = computed(() => this.records()[0] ?? null);

  ngOnInit(): void {
    this.measurementService.getAll().subscribe({
      next:  recs => { this.records.set(recs); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  diff(field: keyof MeasurementDto): string {
    const recs = this.records();
    if (recs.length < 2) return '';
    const cur  = recs[0][field] as number | null | undefined;
    const prev = recs[1][field] as number | null | undefined;
    if (cur == null || prev == null) return '';
    const d = +(cur - prev).toFixed(1);
    return d === 0 ? '=' : (d > 0 ? '+' : '') + d;
  }

  diffClass(field: keyof MeasurementDto, lowerIsBetter = true): string {
    const recs = this.records();
    if (recs.length < 2) return '';
    const cur  = recs[0][field] as number | null | undefined;
    const prev = recs[1][field] as number | null | undefined;
    if (cur == null || prev == null) return '';
    const d = cur - prev;
    if (d === 0) return 'diff-neutral';
    return (lowerIsBetter ? d < 0 : d > 0) ? 'diff-good' : 'diff-bad';
  }

  openForm(): void { this.showForm.set(true); this.saved.set(false); }
  closeForm(): void { this.showForm.set(false); this.resetForm(); }

  saveRecord(): void {
    const dateStr = new Date().toISOString().split('T')[0];
    this.measurementService.add({
      date:                dateStr,
      weight:              this.fWeight() ? +this.fWeight() : undefined,
      bodyFatPercentage:   this.fBf()     ? +this.fBf()     : undefined,
      waist:               this.fWaist()  ? +this.fWaist()  : undefined,
      hip:                 this.fHip()    ? +this.fHip()    : undefined,
      chest:               this.fChest()  ? +this.fChest()  : undefined,
      arm:                 this.fArm()    ? +this.fArm()    : undefined,
      thigh:               this.fThigh()  ? +this.fThigh()  : undefined,
    }).subscribe({
      next: rec => {
        this.records.update(r => [rec, ...r]);
        this.saved.set(true);
        this.resetForm();
        setTimeout(() => { this.showForm.set(false); this.saved.set(false); }, 1400);
      },
      error: () => {},
    });
  }

  deleteRecord(id: string): void {
    this.measurementService.delete(id).subscribe({
      next:  () => this.records.update(r => r.filter(m => m.id !== id)),
      error: () => {},
    });
  }

  private resetForm(): void {
    this.fWeight.set(''); this.fBf.set('');    this.fWaist.set('');
    this.fHip.set('');    this.fChest.set(''); this.fArm.set(''); this.fThigh.set('');
  }

  canSave = computed(() =>
    !!(this.fWeight() || this.fBf() || this.fWaist() || this.fHip() ||
       this.fChest()  || this.fArm()  || this.fThigh())
  );

  bfCategory(bf: number | null | undefined): string {
    if (bf == null) return '';
    if (bf < 10) return 'Atlético';
    if (bf < 18) return 'Fitness';
    if (bf < 25) return 'Saudável';
    if (bf < 32) return 'Sobrepeso';
    return 'Obeso';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  goBack(): void { this.router.navigate(['/progress']); }
}
