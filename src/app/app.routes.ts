import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage),
  },
  {
    path: 'harita',
    loadComponent: () => import('./pages/harita/harita.page').then(m => m.HaritaPage),
  },
  {
    path: 'lokasyonlar',
    loadComponent: () => import('./pages/lokasyonlar/lokasyonlar.page').then(m => m.LokasyonlarPage),
  },
  {
    path: 'location/:id',
    loadComponent: () => import('./pages/detail/detail.page').then(m => m.DetailPage),
  },
  {
    path: 'player/:id/:videoId',
    loadComponent: () => import('./pages/player/player.page').then(m => m.PlayerPage),
  },
  {
    path: 'watch',
    loadComponent: () => import('./pages/player/player.page').then(m => m.PlayerPage),
  },
  {
    path: 'notlarim',
    loadComponent: () => import('./pages/notlarim/notlarim.page').then(m => m.NotlarimPage),
  },
  {
    path: 'umrah-routes',
    loadComponent: () =>
      import('./features/route-guide/route-list/route-list.page').then(m => m.RouteListPage),
  },
  {
    path: 'umrah-routes/:routeId/step-videos/:stepId',
    loadComponent: () =>
      import('./features/route-guide/step-videos/step-videos.page').then(m => m.StepVideosPage),
  },
  {
    path: 'umrah-routes/:routeId',
    loadComponent: () =>
      import('./features/route-guide/route-detail/route-detail.page').then(m => m.RouteDetailPage),
  },
  {
    path: 'umrah-routes/:routeId/step-videos/:stepId',
    loadComponent: () =>
      import('./features/route-guide/step-videos/step-videos.page').then(m => m.StepVideosPage),
  },
];
