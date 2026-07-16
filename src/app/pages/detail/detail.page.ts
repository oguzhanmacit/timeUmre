import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonIcon, IonSpinner, IonChip, IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  imageOutline, timeOutline, locationOutline,
  playCircleOutline, videocamOutline, calendarOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { LocationService } from '../../services/location.service';
import { VideoService } from '../../services/video.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';
import { UmreLocation, LocationVideo } from '../../models/location.model';

interface VideoCard {
  video:      LocationVideo;
  thumbnail:  string | null;
  type:       'youtube' | 'local' | 'unknown';
}

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    IonContent, IonIcon, IonSpinner, IonChip, IonLabel,
  ],
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  @Input() id!: string;

  location:      UmreLocation | null = null;
  videoCards:    VideoCard[] = [];
  isLoading      = true;
  activeVideo:   LocationVideo | null = null;

  constructor(
    private locationService: LocationService,
    private videoService:    VideoService,
  ) {
    addIcons({
      imageOutline, timeOutline, locationOutline,
      playCircleOutline, videocamOutline, calendarOutline,
    });
  }

  async ngOnInit() {
    const all = await firstValueFrom(this.locationService.getLocations());
    this.location = all.find(l => l.id === +this.id) ?? null;

    if (this.location) {
      this.videoCards = [...this.location.videos]
        .sort((a, b) => {
          const aH = a.type === 'hyperlapse' ? 0 : 1;
          const bH = b.type === 'hyperlapse' ? 0 : 1;
          return aH - bH;
        })
        .map(v => {
          const info = this.videoService.resolve(v.url);
          return {
            video:     v,
            thumbnail: info.type === 'youtube'
              ? this.videoService.getYoutubeThumbnail(v.url)
              : null,
            type: info.type,
          };
        });
    }

    this.isLoading = false;
  }

  get hyperlapseCards(): VideoCard[] {
    return this.videoCards.filter(c => c.video.type === 'hyperlapse');
  }

  get standardCards(): VideoCard[] {
    return this.videoCards.filter(c => c.video.type !== 'hyperlapse');
  }

  playVideo(video: LocationVideo) {
    this.activeVideo = video;
  }

  closePlayer() {
    this.activeVideo = null;
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      mosque: 'Cami / Mescit', historical: 'Tarihi Mekân',
      mountain: 'Dağ / Tepe',  cave: 'Mağara',
    };
    return labels[type] ?? type;
  }

  chipColor(type: string): string {
    const colors: Record<string, string> = {
      mosque: 'success', historical: 'warning',
      mountain: 'tertiary', cave: 'medium',
    };
    return colors[type] ?? 'primary';
  }
}
