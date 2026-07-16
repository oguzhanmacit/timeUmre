import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  imageOutline, locationOutline, locationSharp,
  playCircleOutline, videocamOutline,
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

interface InfoItem {
  icon?: string;
  title: string;
  text:  string;
}

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    IonContent, IonIcon, IonSpinner,
  ],
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  @Input() id!: string;

  @ViewChild('infoAnchor') infoAnchor?: ElementRef<HTMLElement>;

  location:            UmreLocation | null = null;
  videoCards:          VideoCard[] = [];
  heroImage:           string | null = null;
  directionsVideoCard: VideoCard | null = null;
  isLoading            = true;
  activeVideo:         LocationVideo | null = null;
  sideInfoItems:       InfoItem[] = [];
  rowInfoItems:        InfoItem[] = [];

  constructor(
    private locationService: LocationService,
    private videoService:    VideoService,
  ) {
    addIcons({
      imageOutline, locationOutline, locationSharp,
      playCircleOutline, videocamOutline,
    });
  }

  async ngOnInit() {
    const all = await firstValueFrom(this.locationService.getLocations());
    this.location = all.find(l => l.id === +this.id) ?? null;

    if (this.location) {
      this.videoCards = this.location.videos
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

      this.heroImage = this.location.image
        ?? this.videoCards.find(c => c.thumbnail)?.thumbnail
        ?? null;

      if (this.location.directionsVideo) {
        const v = this.location.directionsVideo;
        const info = this.videoService.resolve(v.url);
        this.directionsVideoCard = {
          video:     v,
          thumbnail: info.type === 'youtube'
            ? this.videoService.getYoutubeThumbnail(v.url)
            : null,
          type: info.type,
        };
      }

      const info = this.location.importantInfo;
      const hasVerse = !!(info?.arabicText || info?.translation);
      const items = info?.items ?? [];
      this.sideInfoItems = hasVerse ? items : [];
      this.rowInfoItems = hasVerse ? [] : items;
    }

    this.isLoading = false;
  }

  openMap() {
    if (!this.location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${this.location.lat},${this.location.lng}`;
    window.open(url, '_blank');
  }

  playVideo(video: LocationVideo) {
    this.activeVideo = video;
  }

  closePlayer() {
    this.activeVideo = null;
  }

  scrollToInfo() {
    this.infoAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      mosque: 'Cami / Mescit', historical: 'Tarihi Mekân',
      mountain: 'Dağ / Tepe',  cave: 'Mağara',
    };
    return labels[type] ?? type;
  }
}
