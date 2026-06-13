import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, cloudOfflineOutline, createOutline, checkmarkOutline } from 'ionicons/icons';
import { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { VideoService } from '../../services/video.service';
import { VideoNotesService, VideoNote } from '../../services/video-notes.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonSpinner],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() url!: string;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  @ViewChild('playerIframe') playerIframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild('playerSheet')  playerSheet?: ElementRef<HTMLDivElement>;
  @ViewChild('noteArea')     noteArea?: ElementRef<HTMLDivElement>;

  safeUrl:       SafeResourceUrl | null = null;
  isOffline      = false;
  isReady        = false;
  noteOpen       = false;
  noteText       = '';
  noteSaved      = false;
  existingNotes: VideoNote[] = [];

  private ytCurrentTime = -1;
  private playedMs      = 0;
  private lastPlayAt    = 0;
  private boundMsg!: (e: MessageEvent) => void;
  private netListener!: PluginListenerHandle;

  constructor(
    private videoService: VideoService,
    private videoNotes:   VideoNotesService,
  ) {
    addIcons({ closeOutline, cloudOfflineOutline, createOutline, checkmarkOutline });
  }

  async ngOnInit() {
    const status   = await Network.getStatus();
    this.isOffline = !status.connected;
    this.safeUrl   = this.videoService.getSafeEmbedUrl(this.url, true);
    this.isReady   = true;

    this.boundMsg = (e: MessageEvent) => {
      if (e.origin !== 'https://www.youtube.com') return;
      try {
        const d: any = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!d?.event) return;
        if (d.event === 'infoDelivery' && d.info?.currentTime != null) {
          this.ytCurrentTime = +d.info.currentTime;
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
          }
        }
      } catch {}
    };
    window.addEventListener('message', this.boundMsg);

    this.netListener = await Network.addListener('networkStatusChange', s => {
      this.isOffline = !s.connected;
    });
  }

  toggleNote() {
    this.noteOpen = !this.noteOpen;
    if (this.noteOpen) {
      this.pauseYoutube();
      this.existingNotes = this.videoNotes.getByUrl(this.url);
      setTimeout(() => {
        this.noteArea?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
    }
  }

  saveNote() {
    if (!this.noteText.trim()) return;
    this.videoNotes.saveNote(this.url, this.title, this.noteText, this.currentSecond());
    this.noteText     = '';
    this.existingNotes = this.videoNotes.getByUrl(this.url);
    this.noteSaved    = true;
    setTimeout(() => this.noteSaved = false, 1500);
  }

  formatSecond(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  close() { this.closed.emit(); }

  onIframeLoad() {
    this.playerIframe?.nativeElement?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'vp1' }), '*'
    );
  }

  private currentSecond(): number {
    if (this.ytCurrentTime >= 0) return Math.round(this.ytCurrentTime);
    let ms = this.playedMs;
    if (this.lastPlayAt) ms += Date.now() - this.lastPlayAt;
    return Math.round(ms / 1000);
  }

  private pauseYoutube() {
    this.playerIframe?.nativeElement?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
    );
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.boundMsg);
    this.safeUrl = null;
    this.netListener?.remove();
  }
}
