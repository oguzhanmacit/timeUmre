import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  playOutline,
  addOutline,
  playCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-movie-detail-popup',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './movie-detail-popup.component.html',
  styleUrls: ['./movie-detail-popup.component.scss'],
})
export class MovieDetailPopupComponent {
  @Input() item: any;
  @Output() close = new EventEmitter<void>();
  @Output() play = new EventEmitter<string>();

  constructor() {
    addIcons({ closeOutline, playOutline, addOutline, playCircleOutline });
  }

  onPlay(): void {
    if (this.item?.watchUrl) {
      this.play.emit(this.item.watchUrl);
    }
  }

  onPlayVideo(url: string): void {
    this.play.emit(url);
  }

  heroBg(url: string): string {
    return `url("${url}")`;
  }
}
