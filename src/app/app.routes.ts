import { Routes } from '@angular/router';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectLoggedInToAdmin = () => redirectLoggedInTo(['/deenscorp']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/authentication']);


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/authentication',
  },
  /*   {
    path: 'debug',
    loadComponent: () => import('./features/debug/debug.component').then((_) => _.DebugComponent),
  },*/
  {
    path: 'authentication',
    loadComponent: () =>
      import('./features/authentication/login/login.component').then((_) => _.LoginComponent),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToAdmin },
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./features/authentication/forgot-password/forgot-password.component').then(
        (_) => _.ForgotPasswordComponent,
      ),
  },
  {
    path: 'deenscorp',
    loadComponent: () => import('./core/layout/layout').then((_) => _.Layout),
    loadChildren: () => import('./core/routes').then((_) => _.routes),
    /*    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },*/
  },
];
