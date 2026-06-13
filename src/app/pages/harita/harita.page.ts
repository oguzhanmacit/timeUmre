import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locateOutline, warningOutline,
  businessOutline, flagOutline, triangleOutline, apertureOutline,
  homeOutline, searchOutline, mapOutline, downloadOutline, personOutline,
} from 'ionicons/icons';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { MapCacheService } from '../../services/map-cache.service';
import { UmreLocation, UserPosition } from '../../models/location.model';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl:       'assets/leaflet/marker-icon.png',
  shadowUrl:     'assets/leaflet/marker-shadow.png',
});

function svgIconContent(type: string): string {
  const icons: Record<string, string> = {
    mosque: `
      <path d="M9,17 Q9,9 16,9 Q23,9 23,17" fill="white"/>
      <rect x="9" y="17" width="14" height="2.5" rx="1.2" fill="white"/>
      <path d="M13.5,19.5 Q13.5,14 16,14 Q18.5,14 18.5,19.5 Z" fill="rgba(255,255,255,.75)"/>`,
    historical: `
      <rect x="9" y="9" width="14" height="13" rx="2.5" fill="white"/>
      <rect x="11" y="12" width="10" height="1.5" rx=".7" fill="rgba(0,0,0,.35)"/>
      <rect x="11" y="15" width="10" height="1.5" rx=".7" fill="rgba(0,0,0,.35)"/>
      <rect x="11" y="18" width="7"  height="1.5" rx=".7" fill="rgba(0,0,0,.35)"/>`,
    mountain: `
      <polygon points="16,8 8,22 24,22" fill="white"/>
      <polygon points="16,8 13.5,13 18.5,13" fill="rgba(255,255,255,.75)"/>`,
    cave: `
      <path d="M9,22 L9,15 Q16,7 23,15 L23,22 Z" fill="white"/>
      <path d="M12,22 L12,17 Q16,12 20,17 L20,22 Z" fill="rgba(0,0,0,.3)"/>`,
  };
  return icons[type] ?? `<circle cx="16" cy="15" r="6" fill="white"/>`;
}

@Component({
  selector: 'app-harita',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './harita.page.html',
  styleUrls: ['./harita.page.scss'],
})
export class HaritaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  activeTab = 'explore';
  locations: UmreLocation[] = [];
  userPosition: UserPosition | null = null;
  locationError = '';

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private userMarker: L.CircleMarker | null = null;

  constructor(
    private locationService: LocationService,
    private mapCache: MapCacheService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      locateOutline, warningOutline, businessOutline, flagOutline, triangleOutline, apertureOutline,
      homeOutline, searchOutline, mapOutline, downloadOutline, personOutline,
    });
  }

  ngOnInit() {
    this.locationService.getLocations().subscribe(data => {
      this.locations = data;
      if (this.map) this.addLocationMarkers();
    });
    this.mapCache.init().then(() => this.mapCache.preloadMecca());
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 150);
  }

  ionViewDidEnter() {
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  async setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'home') { this.router.navigate(['/']); return; }
    if (tab === 'search') { this.router.navigate(['/lokasyonlar']); return; }
    if (tab === 'explore') return;
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
      this.activeTab = 'explore';
    }
  }

  ngOnDestroy() {
    this.map?.stopLocate();
    this.map?.remove();
    this.map = null;
  }

  /** Locate butonuna basılınca: konum biliniyorsa haritayı o noktaya ortalar */
  centerOnUser() {
    if (this.userPosition && this.map) {
      this.map.setView([this.userPosition.lat, this.userPosition.lng], 16);
    }
  }

  private initMap() {
    if (!this.mapContainer?.nativeElement || this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [21.4225, 39.8262],
      zoom: 13,
      zoomControl: false,
    });

    this.mapCache.createLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    if (this.locations.length) this.addLocationMarkers();

    // Leaflet'in kendi geolocation API'si — tarayıcı ve WebView'da doğrudan çalışır
    this.map.on('locationfound', (e: L.LocationEvent) => {
      this.locationError = '';
      const pos: UserPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.userPosition = pos;
      this.updateUserMarker(pos);
    });

    this.map.on('locationerror', () => {
      this.locationError = 'Konum alınamadı. Lütfen tarayıcı/cihaz konum iznini kontrol edin.';
    });

    // Harita açılınca otomatik konum izlemeyi başlat
    this.map.locate({ watch: true, enableHighAccuracy: true, timeout: 10000, setView: false });
  }

  private addLocationMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.locations.forEach(loc => {
      const near = this.isNearby(loc);
      const marker = L.marker([loc.lat, loc.lng], { icon: this.buildSvgIcon(loc.type, near, loc.name) })
        .addTo(this.map!)
        .bindPopup(this.buildPopup(loc), { maxWidth: 220 });
      marker.on('click', () => this.onMarkerClick(loc));
      this.markers.push(marker);
    });
  }

  private async onMarkerClick(loc: UmreLocation) {
    if (!loc.videos || loc.videos.length === 0) {
      const toast = await this.toastCtrl.create({
        message: `"${loc.name}" için içerik hazırlanıyor...`,
        duration: 2200,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
      return;
    }
    this.router.navigate(['/location', loc.id]);
  }

  private isNearby(loc: UmreLocation): boolean {
    if (!this.userPosition) return true;
    return this.locationService.distanceBetween(this.userPosition, loc) <= 500;
  }

  private buildSvgIcon(type: string, isNear: boolean, name = ''): L.DivIcon {
    const colors: Record<string, string> = {
      mosque: '#1a7a4a', historical: '#c17f24',
      mountain: '#7b5ea7', cave: '#5a6e8c',
    };
    const color = colors[type] ?? '#1a7a4a';
    const pulse = isNear
      ? `<div class="sv-pulse" style="--pulse-color:${color}99"></div>` : '';
    const label = name
      ? `<div class="sv-label">${name}</div>` : '';
    return L.divIcon({
      className: '',
      html: `<div class="sv-marker ${isNear ? 'sv-marker--near' : 'sv-marker--far'}">
        <svg width="36" height="50" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pin-shine-${type}" x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%"   stop-color="#fff" stop-opacity=".45"/>
              <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <ellipse cx="16" cy="43" rx="5" ry="2" fill="rgba(0,0,0,.28)"/>
          <path d="M16 2C8.3 2 2 8.3 2 16c0 10.4 14 28 14 28s14-17.6 14-28C30 8.3 23.7 2 16 2z" fill="${color}"/>
          <path d="M16 2C8.3 2 2 8.3 2 16c0 10.4 14 28 14 28s14-17.6 14-28C30 8.3 23.7 2 16 2z"
                fill="url(#pin-shine-${type})"/>
          ${svgIconContent(type)}
        </svg>${pulse}${label}</div>`,
      iconSize:    [36, 50],
      iconAnchor:  [18, 49],
      popupAnchor: [0, -52],
    });
  }

  private buildPopup(loc: UmreLocation): string {
    return `<div style="font-family:sans-serif;text-align:center;min-width:140px">
      <strong style="font-size:14px;color:#1a7a4a">${loc.name}</strong><br>
      <small style="color:#888">${loc.historicalPeriod}</small>
    </div>`;
  }

  private updateUserMarker(pos: UserPosition) {
    if (!this.map) return;
    const isFirst = !this.userMarker;
    this.userMarker?.remove();
    this.userMarker = L.circleMarker([pos.lat, pos.lng], {
      radius: 10, color: '#fff', fillColor: '#2196F3',
      fillOpacity: 1, weight: 3,
    }).addTo(this.map).bindPopup('Konumunuz');
    if (isFirst) this.map.setView([pos.lat, pos.lng], 15);
    this.addLocationMarkers();
  }
}
