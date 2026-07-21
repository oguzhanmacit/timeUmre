import { Component, HostListener, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, createOutline } from 'ionicons/icons';
import { VideoNotesService, VideoNote } from '../../services/video-notes.service';

/**
 * Sayfadan ayrılmadan video oynatan popup (not alma destekli).
 * Kullanım: şablona `<app-video-popup #videoPopup></app-video-popup>` ekleyip
 * `videoPopup.open(url, başlık, başlangıçSaniyesi?)` çağrılır. YouTube olmayan
 * URL'lerde /watch sayfasına düşer. Escape'i üst bileşen yönetir (isOpen + close).
 */
@Component({
  selector: 'app-video-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
  templateUrl: './video-popup.component.html',
  styleUrls: ['./video-popup.component.scss'],
})
export class VideoPopupComponent implements OnDestroy {
  isOpen = false;
  embedUrl: SafeResourceUrl | null = null;

  noteOpen = false;
  noteText = '';
  noteSaved = false;
  existingNotes: VideoNote[] = [];

  private url = '';
  private title = '';
  private ytTime = -1;
  private openedAt = 0;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router,
    private readonly videoNotes: VideoNotesService,
  ) {
    addIcons({ checkmarkOutline, closeOutline, createOutline });
    // Notlar Firestore'dan asenkron gelir; panel açıkken snapshot güncellenirse liste tazelenir.
    effect(() => {
      this.videoNotes.notes();
      if (this.noteOpen && this.url) {
        this.existingNotes = this.videoNotes.getByUrl(this.url);
      }
    });
  }

  open(url: string, title?: string, startSecond?: number): void {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]{11})/,
    );
    if (!m) {
      this.router.navigate(['/watch'], { queryParams: { url } });
      return;
    }
    const t = startSecond ?? Number(url.match(/[?&]t=(\d+)/)?.[1] ?? 0);
    // enablejsapi: not zaman damgası için oynatma süresi iframe'den dinlenir
    const embed = `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0&enablejsapi=1${t ? '&start=' + Math.floor(t) : ''}`;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    this.url = url;
    this.title = title ?? 'Video';
    this.ytTime = -1;
    this.openedAt = Date.now();
    this.isOpen = true;
    // Global header Ionic sayfa stacking context'i yüzünden popup'ın üstünde
    // kalıyor; popup açıkken gizlenir (styles.scss).
    document.body.classList.add('video-popup-open');
  }

  close(): void {
    document.body.classList.remove('video-popup-open');
    this.isOpen = false;
    this.embedUrl = null;
    this.url = '';
    this.noteOpen = false;
    this.noteText = '';
    this.noteSaved = false;
    this.existingNotes = [];
    this.ytTime = -1;
  }

  /** iframe yüklenince YouTube API'sine "listening" bildirilir; infoDelivery akışı başlar. */
  onIframeLoad(frame: HTMLIFrameElement): void {
    frame.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'vpp' }), '*',
    );
  }

  @HostListener('window:message', ['$event'])
  onWindowMessage(e: MessageEvent): void {
    if (!this.isOpen) return;
    try {
      const d: any = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d?.event === 'infoDelivery' && d.info?.currentTime != null) {
        this.ytTime = +d.info.currentTime;
      }
    } catch {}
  }

  toggleNote(): void {
    this.noteOpen = !this.noteOpen;
    if (this.noteOpen) {
      this.existingNotes = this.videoNotes.getByUrl(this.url);
    }
  }

  saveNote(): void {
    if (!this.noteText.trim() || !this.url) return;
    this.videoNotes.saveNote(this.url, this.title, this.noteText, this.currentSecond());
    this.noteText = '';
    this.existingNotes = this.videoNotes.getByUrl(this.url);
    this.noteSaved = true;
    setTimeout(() => (this.noteSaved = false), 1500);
  }

  formatSecond(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  private currentSecond(): number {
    if (this.ytTime >= 0) return Math.round(this.ytTime);
    return Math.round((Date.now() - this.openedAt) / 1000);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('video-popup-open');
  }
}
