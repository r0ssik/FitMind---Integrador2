import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  step = signal(1);
  loading = signal(false);
  error = signal('');

  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;

  goals = [
    { value: 'emagrecer',       label: 'Emagrecer',       icon: 'local_fire_department' },
    { value: 'hipertrofia',     label: 'Hipertrofia',     icon: 'fitness_center' },
    { value: 'saude',           label: 'Saúde Geral',     icon: 'favorite' },
    { value: 'condicionamento', label: 'Condicionamento', icon: 'directions_run' },
  ];

  limitations = [
    'Problemas no joelho',
    'Problemas na coluna',
    'Problemas no ombro',
    'Problemas cardíacos',
    'Nenhuma limitação',
  ];

  availabilityOptions = [
    { value: 2, label: '2x por semana' },
    { value: 3, label: '3x por semana' },
    { value: 4, label: '4x por semana' },
    { value: 5, label: '5x por semana' },
    { value: 6, label: '6x por semana' },
  ];

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router, private toastr: ToastrService) {
    this.step1Form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      birthDate: ['', Validators.required],
    });

    this.step2Form = this.fb.group({
      sex: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      limitations: [[]],
    });

    this.step3Form = this.fb.group({
      goals: [[], [Validators.required]],
      weeklyAvailability: [3, Validators.required],
    });
  }

  goToStep(n: number): void {
    if (n === 2) {
      this.step1Form.markAllAsTouched();
      if (this.step1Form.invalid) return;
    }
    if (n === 3) {
      this.step2Form.markAllAsTouched();
      if (this.step2Form.invalid) return;
    }
    this.step.set(n);
    this.error.set('');
  }

  toggleGoal(value: string): void {
    const current: string[] = this.step3Form.value.goals ?? [];
    const updated = current.includes(value)
      ? current.filter(g => g !== value)
      : [...current, value];
    this.step3Form.patchValue({ goals: updated });
  }

  toggleLimitation(value: string): void {
    const current: string[] = this.step2Form.value.limitations ?? [];
    const updated = current.includes(value)
      ? current.filter(l => l !== value)
      : [...current, value];
    this.step2Form.patchValue({ limitations: updated });
  }

  async onSubmit(): Promise<void> {

  this.step3Form.markAllAsTouched();

  if (this.step3Form.value.goals.length === 0) {
    this.error.set('Selecione ao menos um objetivo.');
    return;
  }

  this.loading.set(true);
  this.error.set('');

  try {

    await this.auth.register(
      {
        name: this.step1Form.value.name,
        email: this.step1Form.value.email,
        phone: this.step1Form.value.phone,
        birthDate: this.step1Form.value.birthDate,
        sex: this.step2Form.value.sex,
        weight: this.step2Form.value.weight,
        height: this.step2Form.value.height,
        limitations: this.step2Form.value.limitations,
        goals: this.step3Form.value.goals,
        weeklyAvailability: this.step3Form.value.weeklyAvailability,
      },
      this.step1Form.value.password
    );

    this.toastr.success('Conta criada com sucesso!');
    this.router.navigate(['/home']);

  } catch (err: any) {

    if (err.status === 400) {

  this.toastr.error('Dados inválidos.');
  this.error.set('Dados inválidos. Verifique os campos.');

} else if (err.status === 401) {

  this.toastr.error('Não autorizado.');
  this.error.set('Não autorizado.');

} else if (err.status === 409) {

  this.toastr.error('E-mail já cadastrado.');
  this.error.set('E-mail já cadastrado.');

} else if (err.status === 500) {

  this.toastr.error('Erro interno do servidor.');
  this.error.set('Erro interno do servidor.');

} else if (err.status === 0) {

  this.toastr.error('Servidor offline.');
  this.error.set('Servidor offline ou sem conexão.');

} else {

  this.toastr.error('Erro ao criar conta.');
  this.error.set('Erro ao criar conta.');
}
  } finally {

    this.loading.set(false);

  }
}

  hasGoal(value: string): boolean {
    return (this.step3Form.value.goals ?? []).includes(value);
  }

  hasLimitation(value: string): boolean {
    return (this.step2Form.value.limitations ?? []).includes(value);
  }
}
