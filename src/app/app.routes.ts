import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'harita',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/harita/harita.page').then(m => m.HaritaPage),
  },
  {
    path: 'lokasyonlar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lokasyonlar/lokasyonlar.page').then(m => m.LokasyonlarPage),
  },
  {
    path: 'location/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/detail/detail.page').then(m => m.DetailPage),
  },
  {
    path: 'player/:id/:videoId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/player/player.page').then(m => m.PlayerPage),
  },
  {
    path: 'watch',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/player/player.page').then(m => m.PlayerPage),
  },
  {
    path: 'notlarim',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notlarim/notlarim.page').then(m => m.NotlarimPage),
  },
  {
    path: 'video-list',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/video-list/video-list.page').then(m => m.VideoListPage),
  },
  {
    path: 'umrah-routes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/route-guide/route-list/route-list.page').then(m => m.RouteListPage),
  },
  {
    path: 'umrah-routes/:routeId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/route-guide/route-detail/route-detail.page').then(m => m.RouteDetailPage),
  },
];
