import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { imageOutline, cloudOfflineOutline, createOutline, checkmarkOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { LocationService } from '../../services/location.service';
import { VideoService, VideoInfo } from '../../services/video.service';
import { PlaybackProgressService } from '../../services/playback-progress.service';
import { WatchHistoryService } from '../../services/watch-history.service';
import { VideoNotesService, VideoNote } from '../../services/video-notes.service';
import { VideoFeedService, FeedVideo } from '../../services/video-feed.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { UmreLocation, LocationVideo } from '../../models/location.model';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, IonContent, IonSpinner, IonIcon],
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit, OnChanges, OnDestroy {
  @Input() id!: string;
  @Input() videoId!: string;
  @Input() url?: string;
  @Input() t?: string;

  @ViewChild('playerFrame') playerFrame?: ElementRef<HTMLIFrameElement>;
  @ViewChild('localVideo')  localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild(IonContent)    content?: IonContent;

  location:     UmreLocation | null = null;
  video:        LocationVideo | null = null;
  videoInfo!:   VideoInfo;
  safeEmbedUrl: SafeResourceUrl | null = null;
  mediaLoaded   = false;
  mediaError    = false;
  isLoading     = true;
  isOffline     = false;
  startTime     = 0;
  noteOpen       = false;
  noteText       = '';
  noteSaved      = false;
  existingNotes: VideoNote[] = [];

  private ytCurrentTime = -1;
  private ytDuration    = -1;
  private playedMs      = 0;
  private lastPlayAt    = 0;
  private netListener!: PluginListenerHandle;
  private openedAt     = 0;
  private saveInterval?: ReturnType<typeof setInterval>;
  private boundOnMessage!: (e: MessageEvent) => void;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private videoService:    VideoService,
    private progressService: PlaybackProgressService,
    private watchHistory:    WatchHistoryService,
    private videoNotes:      VideoNotesService,
    private feed:            VideoFeedService,
  ) {
    addIcons({ imageOutline, cloudOfflineOutline, createOutline, checkmarkOutline });
  }

  get recommendations(): FeedVideo[] {
    return this.feed.videos.filter(v => v.url !== this.url).slice(0, 20);
  }

  openRecommended(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
  }

  async ngOnInit() {
    const netStatus = await Network.getStatus();
    this.isOffline  = !netStatus.connected;
    this.netListener = await Network.addListener('networkStatusChange', s => {
      this.isOffline = !s.connected;
    });
    await this.loadPlayer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['url'] && !changes['url'].firstChange) {
      const prevUrl = changes['url'].previousValue as string | undefined;
      this.saveWatchHistory(prevUrl);
      this.cleanupPlayer();
      this.resetState();
      this.loadPlayer();
    }
  }

  onMediaLoad()  { this.mediaLoaded = true; }
  onMediaError() { this.mediaError  = true; this.mediaLoaded = true; }

  toggleNote() {
    this.noteOpen = !this.noteOpen;
    if (this.noteOpen) {
      this.pauseVideo();
      const url = this.url ?? this.video?.url ?? '';
      this.existingNotes = this.videoNotes.getByUrl(url);
      setTimeout(() => this.content?.scrollToBottom(300), 120);
    }
  }

  saveNote() {
    if (!this.noteText.trim()) return;
    const url    = this.url ?? this.video?.url ?? '';
    const title  = this.video?.title ?? '';
    this.videoNotes.saveNote(url, title, this.noteText, this.currentSecond());
    this.noteText      = '';
    this.existingNotes = this.videoNotes.getByUrl(url);
    this.noteSaved = true;
    setTimeout(() => this.noteSaved = false, 1500);
  }

  formatSecond(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  onIframeLoad() {
    this.playerFrame?.nativeElement?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'pp1' }), '*'
    );
  }

  ngOnDestroy() {
    this.saveWatchHistory(this.url);
    this.cleanupPlayer();
    this.persistProgress();
    this.safeEmbedUrl = null;
    this.netListener?.remove();
  }

  private async loadPlayer() {
    if (this.url) {
      const tSec = this.t ? +this.t : 0;
      this.startTime    = tSec;
      this.videoInfo    = this.videoService.resolve(this.url);
      this.safeEmbedUrl = this.videoService.getSafeEmbedUrl(this.url, true, tSec);
      this.video        = { id: 0, title: '', year: '', url: this.url };
      if (this.videoInfo.type === 'youtube') this.mediaLoaded = true;
      this.isLoading = false;
      this.openedAt  = Date.now();

      this.boundOnMessage = (e: MessageEvent) => {
        if (e.origin !== 'https://www.youtube.com') return;
        try {
          const d: any = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (!d?.event) return;
          if (d.event === 'infoDelivery' && d.info?.currentTime != null) {
            this.ytCurrentTime = +d.info.currentTime;
            if (d.info.duration > 0) this.ytDuration = +d.info.duration;
          }
          if (d.event === 'onStateChange') {
            const state = +d.info;
            if (state === 1) {
              this.lastPlayAt = Date.now();
            } else if (state === 2 || state === 0) {
              if (this.lastPlayAt) {
                this.playedMs  += Date.now() - this.lastPlayAt;
                this.lastPlayAt = 0;
              }
              if (state === 0) this.watchHistory.markCompleted(this.url!);
            }
          }
        } catch {}
      };
      window.addEventListener('message', this.boundOnMessage);
      return;
    }

    const all     = await firstValueFrom(this.locationService.getLocations());
    this.location = all.find(l => l.id === +this.id) ?? null;

    if (this.location) {
      this.video = this.location.videos.find(v => v.id === +this.videoId)
                ?? this.location.videos[0]
                ?? null;

      if (this.video) {
        this.startTime    = this.progressService.getProgress(+this.id, this.video.id);
        this.videoInfo    = this.videoService.resolve(this.video.url);
        this.safeEmbedUrl = this.videoService.getSafeEmbedUrl(this.video.url, true, this.startTime);
        if (this.videoInfo.type === 'youtube') this.mediaLoaded = true;
      }
    }

    this.isLoading = false;
    this.openedAt  = Date.now();
    this.saveInterval = setInterval(() => this.persistProgress(), 15_000);
  }

  private resetState() {
    this.location     = null;
    this.video        = null;
    this.safeEmbedUrl = null;
    this.mediaLoaded  = false;
    this.mediaError   = false;
    this.isLoading    = true;
    this.noteOpen     = false;
    this.noteText     = '';
    this.noteSaved    = false;
    this.existingNotes = [];
    this.ytCurrentTime = -1;
    this.ytDuration    = -1;
    this.playedMs      = 0;
    this.lastPlayAt    = 0;
    this.openedAt      = 0;
  }

  private saveWatchHistory(url?: string) {
    if (url && this.openedAt) {
      const elapsed = (Date.now() - this.openedAt) / 1000;
      const seconds = this.ytCurrentTime >= 0 ? this.ytCurrentTime : elapsed;
      if (elapsed > 15) this.watchHistory.recordSeconds(url, seconds, this.ytDuration > 0 ? this.ytDuration : undefined);
    }
  }

  private cleanupPlayer() {
    if (this.playerFrame?.nativeElement) {
      this.playerFrame.nativeElement.src = '';
    }
    if (this.boundOnMessage) window.removeEventListener('message', this.boundOnMessage);
    clearInterval(this.saveInterval);
  }

  private currentSecond(): number {
    if (this.ytCurrentTime >= 0) return Math.round(this.ytCurrentTime);
    let ms = this.playedMs;
    if (this.lastPlayAt) ms += Date.now() - this.lastPlayAt;
    return Math.round(this.startTime + ms / 1000);
  }

  private pauseVideo() {
    this.playerFrame?.nativeElement?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
    );
    this.localVideo?.nativeElement?.pause();
  }

  private persistProgress(): void {
    if (!this.video || !this.location || !this.openedAt) return;
    const elapsed = (Date.now() - this.openedAt) / 1000;
    this.progressService.saveProgress(+this.id, this.video.id, this.startTime + elapsed);
  }
}
