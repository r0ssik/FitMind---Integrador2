import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.form.value.email, this.form.value.password);
      this.router.navigate(['/home']);
    } catch {
      this.error.set('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch {
      this.error.set('Erro ao entrar com Google.');
    } finally {
      this.loading.set(false);
    }
  }

  get emailCtrl() { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }
}
