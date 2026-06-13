import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
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
  @Input() white       = false;
  @Input() translucent = true;

  /** Parent bağlarsa varsayılan navigasyon yerine bu event tetiklenir */
  @Output() backClick = new EventEmitter<void>();
  @Output() homeClick = new EventEmitter<void>();

  constructor(private router: Router, private location: Location) {
    addIcons({ arrowBackOutline, homeOutline });
  }

  goBack() {
    if (this.backClick.observed) this.backClick.emit();
    else this.location.back();
  }

  goHome() {
    if (this.homeClick.observed) this.homeClick.emit();
    else this.router.navigate(['/']);
  }
}
