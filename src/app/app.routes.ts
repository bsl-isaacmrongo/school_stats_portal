import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { AuthLayout } from './auth/layout/auth-layout';
import { DashboardLayout } from './dashboard/layout/dashboard-layout';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login) }
    ]
  },
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'students', loadComponent: () => import('./dashboard/components/students/students').then(m => m.Students) },
      { path: 'students/:id', loadComponent: () => import('./dashboard/components/students/student-details/student-details').then(m => m.StudentDetails) },
      { path: 'year-group/:id', loadComponent: () => import('./dashboard/components/year-group-details/year-group-details').then(m => m.YearGroupDetails) },
      {
  path: 'year-groups/:yearGroupId',
  loadComponent: () =>
    import('./dashboard/components/year-group-details/year-group-details').then(m => m.YearGroupDetails),
}
    ]
  },
  { path: '**', redirectTo: '/login' }
];
