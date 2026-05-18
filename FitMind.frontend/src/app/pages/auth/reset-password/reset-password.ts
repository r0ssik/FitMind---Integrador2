import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

function passwordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const password = ctrl.get('password')?.value;
  const confirm = ctrl.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  form: FormGroup;
  loading = signal(false);
  done = signal(false);
  error = signal('');

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    }, { validators: passwordsMatch });
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.resetPassword('mock-token', this.form.value.password);
      this.done.set(true);
      setTimeout(() => this.router.navigate(['/login']), 2500);
    } catch {
      this.error.set('Erro ao redefinir senha. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
