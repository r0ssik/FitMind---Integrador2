import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  sex?: string;
  weight?: number;
  height?: number;
  limitations?: string[];
  goals?: string[];
  weeklyAvailability?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly TOKEN_KEY = 'fitmind_token';
  private readonly USER_KEY = 'fitmind_user';

  currentUser = signal<UserProfile | null>(this.loadUser());

  constructor(private router: Router) {}

  login(email: string, _password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && _password) {
          const user: UserProfile = { name: 'Gabriel', email };
          this.saveSession(user);
          resolve();
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 800);
    });
  }

  loginWithGoogle(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const user: UserProfile = { name: 'Gabriel (Google)', email: 'gabriel@gmail.com' };
        this.saveSession(user);
        resolve();
      }, 800);
    });
  }

  register(profile: UserProfile, _password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (profile.email) {
          this.saveSession(profile);
          resolve();
        } else {
          reject(new Error('Dados inválidos'));
        }
      }, 800);
    });
  }

  sendPasswordResetEmail(_email: string): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 800));
  }

  resetPassword(_token: string, _password: string): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 800));
  }

  updateProfile(partial: Partial<UserProfile>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(user: UserProfile): void {
    localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser(): UserProfile | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }
}
