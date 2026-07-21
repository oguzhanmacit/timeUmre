import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircleOutline } from 'ionicons/icons';
import { UmreContentService } from '../../services/umre-content.service';
import { VideoPopupComponent } from '../../components/video-popup/video-popup.component';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, VideoPopupComponent],
  templateUrl: './video-list.page.html',
  styleUrls: ['./video-list.page.scss'],
})
export class VideoListPage implements OnInit {
  title = '';
  videos: { label: string; url: string }[] = [];

  @ViewChild('videoPopup') videoPopup?: VideoPopupComponent;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly content: UmreContentService,
  ) {
    addIcons({ playCircleOutline });
  }

  ngOnInit() {
    // queryParamMap aboneliği: Ionic aynı component örneğini yeniden kullandığında
    // (örn. Umre listesindeyken header'dan Vize'ye geçiş) liste de güncellenir.
    this.route.queryParamMap.subscribe(params => {
      const set = this.content.getVideoSet(params.get('set') ?? '');
      this.title = set?.title ?? '';
      this.videos = set?.videos ?? [];
    });
  }

  /** Liste videoları sayfadan ayrılmadan paylaşılan popup'ta oynar. */
  playVideo(url: string, label?: string) {
    this.videoPopup?.open(url, label ?? this.title);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.videoPopup?.isOpen) this.videoPopup.close();
  }

  ytThumb(url: string): string {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]{11})/,
    );
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
  }
}
