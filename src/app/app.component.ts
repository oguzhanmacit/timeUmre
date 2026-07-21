import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OfflineBannerComponent } from './components/offline-banner/offline-banner.component';
import {
  PremiumHeaderComponent,
  PremiumNavItem,
} from './components/premium-header/premium-header.component';
import { UmreContentService } from './services/umre-content.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, OfflineBannerComponent, PremiumHeaderComponent],
  template: `
    <ion-app>
      @if (!isAuthRoute) {
        <app-premium-header
          [navItems]="premiumNavItems"
          (navItemSelect)="onHeaderNavSelect($event)"
        ></app-premium-header>
      }
      <app-offline-banner></app-offline-banner>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  /** Giriş/kayıt ekranları tam ekran (Netflix tarzı) olduğundan header gizlenir. */
  isAuthRoute = false;

  constructor(
    private readonly router: Router,
    private readonly content: UmreContentService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAuthRoute = event.urlAfterRedirects.startsWith('/auth');
      }
    });
  }

  get premiumNavItems(): PremiumNavItem[] {
    return [
      {
        id: 'umre',
        label: 'Umre',
        payload: { setKey: 'umre' },
      },
      ...this.content.giderimItems.map(item => ({
        id: item.id,
        label: item.label,
        route: item.route,
        payload: item.route
          ? undefined
          : item.videos?.length
            ? { setKey: item.id }
            : { videoUrl: item.videoUrl },
      })),
    ];
  }

  onHeaderNavSelect(item: PremiumNavItem) {
    if (!item.payload) return;

    const payload = item.payload as { setKey?: string; videoUrl?: string };
    if (payload.setKey) {
      this.router.navigate(['/video-list'], { queryParams: { set: payload.setKey } });
      return;
    }
    if (payload.videoUrl) this.playVideo(payload.videoUrl);
  }

  private playVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
  }
}
