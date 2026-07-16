import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
      <app-premium-header
        [navItems]="premiumNavItems"
        (navItemSelect)="onHeaderNavSelect($event)"
        (search)="onHeaderSearch($event)"
      ></app-premium-header>
      <app-offline-banner></app-offline-banner>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  constructor(
    private readonly router: Router,
    private readonly content: UmreContentService,
  ) {}

  get premiumNavItems(): PremiumNavItem[] {
    return [
      {
        id: 'umre',
        label: 'Umre',
        children: this.content.umreItems.map((item, i) => ({
          id: `umre-${i}`,
          label: item.label,
          payload: item,
        })),
      },
      ...this.content.giderimItems.map((item, i) => ({
        id: `giderim-${i}`,
        label: item.label,
        route: item.route,
        payload: item.route ? undefined : item,
      })),
    ];
  }

  onHeaderNavSelect(item: PremiumNavItem) {
    if (!item.payload) return;

    if (item.id.startsWith('umre-')) {
      const payload = item.payload as { videoUrl?: string };
      if (payload.videoUrl) this.playVideo(payload.videoUrl);
      return;
    }

    const payload = item.payload as {
      label: string;
      videoUrl?: string;
      videos?: { label: string; url: string }[];
    };
    if (payload.videos?.length) {
      this.router.navigate(['/video-list'], {
        state: { title: payload.label, videos: payload.videos },
      });
      return;
    }
    if (payload.videoUrl) this.playVideo(payload.videoUrl);
  }

  onHeaderSearch(query: string) {
    this.router.navigate(['/lokasyonlar'], { queryParams: { q: query } });
  }

  private playVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
  }
}
