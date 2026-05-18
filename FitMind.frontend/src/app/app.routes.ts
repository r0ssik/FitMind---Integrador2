import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password').then(m => m.ResetPassword),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home/home').then(m => m.Home),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications/notifications').then(m => m.Notifications),
  },
  {
    path: 'workout-plans',
    loadComponent: () => import('./pages/workout/workout-plans/workout-plans').then(m => m.WorkoutPlans),
  },
  {
    path: 'workout-plans/generate',
    loadComponent: () => import('./pages/workout/workout-generator/workout-generator').then(m => m.WorkoutGenerator),
  },
  {
    path: 'workout-plans/detail',
    loadComponent: () => import('./pages/workout/workout-detail/workout-detail').then(m => m.WorkoutDetail),
  },
  {
    path: 'workout-history',
    loadComponent: () => import('./pages/workout/workout-history/workout-history').then(m => m.WorkoutHistory),
  },
  {
    path: 'diet-plan',
    loadComponent: () => import('./pages/diet/diet-plan-generator/diet-plan-generator').then(m => m.DietPlanGenerator),
  },
  {
    path: 'food-diary',
    loadComponent: () => import('./pages/diet/food-diary/food-diary').then(m => m.FoodDiary),
  },
  {
    path: 'manual-meal',
    loadComponent: () => import('./pages/diet/manual-meal/manual-meal').then(m => m.ManualMeal),
  },
  {
    path: 'image-analysis',
    loadComponent: () => import('./pages/diet/image-analysis/image-analysis').then(m => m.ImageAnalysis),
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress/progress').then(m => m.Progress),
  },
  {
    path: 'measurements',
    loadComponent: () => import('./pages/measurements/measurements/measurements').then(m => m.Measurements),
  },
  {
    path: 'achievements',
    loadComponent: () => import('./pages/achievements/achievements/achievements').then(m => m.Achievements),
  },
  {
    path: 'social',
    loadComponent: () => import('./pages/social/social/social').then(m => m.Social),
  },
  {
    path: 'challenges/create',
    loadComponent: () => import('./pages/challenges/challenge-create/challenge-create').then(m => m.ChallengeCreate),
  },
  {
    path: 'challenges/:id',
    loadComponent: () => import('./pages/challenges/challenge-detail/challenge-detail').then(m => m.ChallengeDetail),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/my-profile/my-profile').then(m => m.MyProfile),
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile/user-profile/user-profile').then(m => m.UserProfile),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings/settings').then(m => m.Settings),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history/history').then(m => m.History),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/admin-users/admin-users').then(m => m.AdminUsers),
  },
  { path: '**', redirectTo: 'login' },
];
