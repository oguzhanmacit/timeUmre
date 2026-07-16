import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonIcon,
  ],
  templateUrl: './app-header.component.html',
  styleUrls:  ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  @Input() title       = '';
  @Input() showBack    = false;
  @Input() showHome    = false;
  @Input() translucent = true;

  /** Parent bağlarsa varsayılan navigasyon yerine bu event tetiklenir */
  @Output() backClick = new EventEmitter<void>();
  @Output() homeClick = new EventEmitter<void>();

  constructor(private router: Router, private location: Location) {
    addIcons({ arrowBackOutline, homeOutline });
  }

  goBack() {
    if (this.backClick.observed) this.backClick.emit();
    // Derin linkle gelindiyse geçmiş boştur; geri yerine ana sayfaya dön
    else if (window.history.length > 1) this.location.back();
    else this.router.navigate(['/']);
  }

  goHome() {
    if (this.homeClick.observed) this.homeClick.emit();
    else this.router.navigate(['/']);
  }
}
