import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonList, IonItem, IonItemDivider,
  IonLabel, IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, walkOutline, chevronForwardOutline,
  businessOutline, flagOutline, triangleOutline, apertureOutline,
} from 'ionicons/icons';
import { LocationService } from '../../services/location.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { UmreLocation, UserPosition } from '../../models/location.model';

@Component({
  selector: 'app-lokasyonlar',
  standalone: true,
  imports: [
    CommonModule, AppHeaderComponent,
    IonContent, IonIcon, IonList, IonItem, IonItemDivider, IonLabel, IonSearchbar,
  ],
  templateUrl: './lokasyonlar.page.html',
  styleUrls: ['./lokasyonlar.page.scss'],
})
export class LokasyonlarPage implements OnInit {
  locations: UmreLocation[] = [];
  searchQuery = '';
  userPosition: UserPosition | null = null;

  constructor(
    private locationService: LocationService,
    private router: Router,
  ) {
    addIcons({
      locationOutline, walkOutline, chevronForwardOutline,
      businessOutline, flagOutline, triangleOutline, apertureOutline,
    });
  }

  ngOnInit() {
    this.locationService.getLocations().subscribe(data => this.locations = data);
    this.locationService.getUserPosition()
      .then(pos => this.userPosition = pos)
      .catch(() => {});
  }

  get filteredLocations(): UmreLocation[] {
    if (!this.searchQuery.trim()) return this.locations;
    const q = this.searchQuery.toLowerCase();
    return this.locations.filter(l => l.name.toLowerCase().includes(q));
  }

  onSearchChange(event: CustomEvent) {
    this.searchQuery = (event.detail as any).value ?? '';
  }

  distanceTo(loc: UmreLocation): string | null {
    if (!this.userPosition) return null;
    const m = this.locationService.distanceBetween(this.userPosition, loc);
    return this.locationService.formatDistance(m);
  }

  goToDetail(loc: UmreLocation) {
    this.router.navigate(['/location', loc.id]);
  }

  getIconName(type: string): string {
    const icons: Record<string, string> = {
      mosque:     'business-outline',
      historical: 'flag-outline',
      mountain:   'triangle-outline',
      cave:       'aperture-outline',
    };
    return icons[type] ?? 'location-outline';
  }
}
