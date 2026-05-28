import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const guarded = (loader: () => Promise<any>) =>
  ({ loadComponent: loader, canActivate: [authGuard] });

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Rotas públicas ────────────────────────────────────────────
  { path: 'login',          loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) },
  { path: 'register',       loadComponent: () => import('./pages/auth/register/register').then(m => m.Register) },
  { path: 'forgot-password',loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password').then(m => m.ResetPassword) },

  // ── Rotas protegidas ──────────────────────────────────────────
  { path: 'home',                      ...guarded(() => import('./pages/home/home/home').then(m => m.Home)) },
  { path: 'notifications',             ...guarded(() => import('./pages/notifications/notifications/notifications').then(m => m.Notifications)) },
  { path: 'workout-plans',             ...guarded(() => import('./pages/workout/workout-plans/workout-plans').then(m => m.WorkoutPlans)) },
  { path: 'workout-plans/generate',    ...guarded(() => import('./pages/workout/workout-generator/workout-generator').then(m => m.WorkoutGenerator)) },
  { path: 'workout-plans/detail/:planId/:dayId', ...guarded(() => import('./pages/workout/workout-detail/workout-detail').then(m => m.WorkoutDetail)) },
  { path: 'workout-history',           ...guarded(() => import('./pages/workout/workout-history/workout-history').then(m => m.WorkoutHistory)) },
  { path: 'diet-plan',                 ...guarded(() => import('./pages/diet/diet-plan-generator/diet-plan-generator').then(m => m.DietPlanGenerator)) },
  { path: 'food-diary',                ...guarded(() => import('./pages/diet/food-diary/food-diary').then(m => m.FoodDiary)) },
  { path: 'manual-meal',               ...guarded(() => import('./pages/diet/manual-meal/manual-meal').then(m => m.ManualMeal)) },
  { path: 'image-analysis',            ...guarded(() => import('./pages/diet/image-analysis/image-analysis').then(m => m.ImageAnalysis)) },
  { path: 'progress',                  ...guarded(() => import('./pages/progress/progress/progress').then(m => m.Progress)) },
  { path: 'measurements',              ...guarded(() => import('./pages/measurements/measurements/measurements').then(m => m.Measurements)) },
  { path: 'achievements',              ...guarded(() => import('./pages/achievements/achievements/achievements').then(m => m.Achievements)) },
  { path: 'social',                    ...guarded(() => import('./pages/social/social/social').then(m => m.Social)) },
  { path: 'challenges/create',         ...guarded(() => import('./pages/challenges/challenge-create/challenge-create').then(m => m.ChallengeCreate)) },
  { path: 'challenges/:id',            ...guarded(() => import('./pages/challenges/challenge-detail/challenge-detail').then(m => m.ChallengeDetail)) },
  { path: 'profile',                   ...guarded(() => import('./pages/profile/my-profile/my-profile').then(m => m.MyProfile)) },
  { path: 'profile/:id',               ...guarded(() => import('./pages/profile/user-profile/user-profile').then(m => m.UserProfile)) },
  { path: 'settings',                  ...guarded(() => import('./pages/settings/settings/settings').then(m => m.Settings)) },
  { path: 'history',                   ...guarded(() => import('./pages/history/history/history').then(m => m.History)) },
  { path: 'hydration',                 ...guarded(() => import('./pages/hydration/hydration-history/hydration-history').then(m => m.HydrationHistory)) },
  { path: 'admin',                     ...guarded(() => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)) },
  { path: 'admin/users',               ...guarded(() => import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsers)) },

  { path: '**', redirectTo: 'login' },
];
