import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoginRequest, LoginResponse, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest, UserDto,
} from '../core/models/api.models';

export type { UserDto as UserProfile };

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly TOKEN_KEY    = 'fitmind_token';
  private readonly REFRESH_KEY  = 'fitmind_refresh';
  private readonly USER_KEY     = 'fitmind_user';
  private readonly api = environment.apiUrl;

  currentUser = signal<UserDto | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api}/auth/login`, { email, password } as LoginRequest)
    );
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    // Fetch full profile after login
    const user = await firstValueFrom(this.http.get<UserDto>(`${this.api}/user/me`));
    this.saveUser(user);
  }

  loginWithGoogle(): Promise<void> {
    return Promise.reject(new Error('Login com Google não disponível ainda.'));
  }

  async register(
    profile: Omit<RegisterRequest, 'password'> & { limitations?: string[] },
    password: string
  ): Promise<void> {
    const body: RegisterRequest = {
      name: profile.name, email: profile.email, password,
      phone: profile.phone ?? '', birthDate: profile.birthDate ?? '',
      sex: profile.sex ?? '', weight: +(profile.weight ?? 0), height: +(profile.height ?? 0),
      limitations: Array.isArray(profile.limitations) ? profile.limitations.join(', ') : '',
      goals: profile.goals ?? [], weeklyAvailability: profile.weeklyAvailability ?? 3,
    };
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api}/auth/register`, body)
    );
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    const user = await firstValueFrom(this.http.get<UserDto>(`${this.api}/user/me`));
    this.saveUser(user);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/forgot-password`, { email } as ForgotPasswordRequest)
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/reset-password`, { token, newPassword } as ResetPasswordRequest)
    );
  }

  updateUserSignal(user: UserDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (refreshToken) {
      this.http.post(`${this.api}/auth/revoke`, JSON.stringify(refreshToken), {
        headers: { 'Content-Type': 'application/json' },
      }).subscribe({ error: () => {} });
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveUser(user: UserDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser(): UserDto | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }
}
