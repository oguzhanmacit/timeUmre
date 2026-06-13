import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, mapOutline, downloadOutline, personOutline,
} from 'ionicons/icons';
import { UMRAH_ROUTES } from '../data/umrah-routes.data';
import { UmrahRoute } from '../../../models/route.model';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './route-list.page.html',
  styleUrls: ['./route-list.page.scss'],
})
export class RouteListPage {
  readonly routes: UmrahRoute[] = UMRAH_ROUTES;
  activeTab = '';

  readonly routeImages: Record<string, string> = {
    'jeddah-makkah-madinah': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnuZ6J5R123_mBTWf509hKQqAiZzgEZJOZw45fIv4pbRD5hrDvba74Gqy7SPMGU0HCKeMbrS9g3LU4H_7iuSpG7H4iftPX8xtzNHc8PeWAT8Sdf4km38N7hgsFcAe3Ly0LergoM7DmRuaYH9xQv2Hgu2S9afmmoK28Kh7IPY8RGZyDZdPi0__oTfJifPqMhjsVOHkSG6A6lsfR0blkCktaHpn41cmbKHdK_NLNGrkngNlEaz-R15awYGo00nWji-9iXm029vdBIg',
    'madinah-makkah-jeddah': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7U2e6695-xTj_Beu9yZBqATuFB28dM1iCMALgbPQvWOD-YVoGTQIwJ2lUuCb5UqQuqU3GJtss7oXuNiX2STBRj07CMDOwgInAsl0YUUI5D9s3XJ9KntVE9NjCTaOHCfUX9SBy-jPrxxYmLeMC9-0Pwnbd2rYdUCI3EMG0Pn7grq9k_I4vVpmvDDp_yo9xIC72Ig3r1IeEOuH4wz0DSTpsEw2TLz6gWte3gW_GR-gNwdX0xvElz9O65ix9rbj9zGqqQvxcSXOzSA',
  };

  constructor(private router: Router, private toastCtrl: ToastController) {
    addIcons({ homeOutline, mapOutline, downloadOutline, personOutline });
  }

  titleParts(title: string): [string, string] {
    const idx = title.indexOf(',');
    return idx !== -1
      ? [title.slice(0, idx), title.slice(idx + 1).trim()]
      : [title, ''];
  }

  goToDetail(routeId: string) {
    this.router.navigate(['/umrah-routes', routeId]);
  }

  async setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'home')    { this.router.navigate(['/']); return; }
    if (tab === 'explore') { this.router.navigate(['/harita']); return; }
    if (tab === 'notes') { this.router.navigate(['/notlarim']); return; }
    if (tab === 'downloads' || tab === 'profile') {
      const toast = await this.toastCtrl.create({
        message: 'Bu özellik yakında geliyor!',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
      this.activeTab = '';
    }
  }
}
