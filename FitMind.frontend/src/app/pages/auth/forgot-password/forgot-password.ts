import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  form: FormGroup;
  loading = signal(false);
  sent = signal(false);
  error = signal('');

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.sendPasswordResetEmail(this.form.value.email);
      this.sent.set(true);
    } catch {
      this.error.set('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
