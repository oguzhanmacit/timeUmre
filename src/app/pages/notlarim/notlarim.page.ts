import { Component, HostListener, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playCircleOutline, trashOutline, timeOutline,
  documentTextOutline, homeOutline, mapOutline,
  downloadOutline, personOutline,
} from 'ionicons/icons';
import { VideoNotesService, VideoNote } from '../../services/video-notes.service';
import { AuthService } from '../../services/auth.service';
import { VideoPopupComponent } from '../../components/video-popup/video-popup.component';

export interface NoteGroup {
  url: string;
  title: string;
  color: string;
  ytId: string;
  notes: VideoNote[];
  lastSaved: number;
}

@Component({
  selector: 'app-notlarim',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, VideoPopupComponent],
  templateUrl: './notlarim.page.html',
  styleUrls: ['./notlarim.page.scss'],
})
export class NotlarimPage implements OnInit {
  groups: NoteGroup[] = [];
  activeTab = 'notes';

  @ViewChild('videoPopup') videoPopup?: VideoPopupComponent;

  private readonly PALETTE = [
    '#1a7a4a', '#c17f24', '#7b5ea7', '#4a90d9',
    '#e05c5c', '#5a9e7a', '#d4853a', '#5a6e8c',
  ];

  constructor(
    private videoNotes: VideoNotesService,
    private router:     Router,
    private alertCtrl:  AlertController,
    private toastCtrl:  ToastController,
    private auth:       AuthService,
  ) {
    addIcons({
      playCircleOutline, trashOutline, timeOutline,
      documentTextOutline, homeOutline, mapOutline,
      downloadOutline, personOutline,
    });
    // Notlar Firestore'dan asenkron gelir; snapshot her güncellendiğinde liste tazelenir.
    effect(() => {
      this.videoNotes.notes();
      this.load();
    });
  }

  ngOnInit()        { this.load(); }
  ionViewWillEnter(){ this.load(); }

  private load() {
    const all = this.videoNotes.getAll();
    const map = new Map<string, NoteGroup>();

    for (const note of all) {
      if (!map.has(note.url)) {
        map.set(note.url, {
          url:      note.url,
          title:    note.title || 'Video',
          color:    this.urlColor(note.url),
          ytId:     this.extractYtId(note.url),
          notes:    [],
          lastSaved: 0,
        });
      }
      const g = map.get(note.url)!;
      g.notes.push(note);
      if (note.savedAt > g.lastSaved) g.lastSaved = note.savedAt;
    }

    this.groups = Array.from(map.values())
      .sort((a, b) => b.lastSaved - a.lastSaved)
      .map(g => ({ ...g, notes: g.notes.sort((a, b) => a.second - b.second) }));
  }

  formatSecond(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'short',
    });
  }

  /** Not videoları rota adımlarındaki gibi sayfadan ayrılmadan popup'ta oynar. */
  watchVideo(note: VideoNote) {
    this.videoPopup?.open(note.url, note.title, note.second);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.videoPopup?.isOpen) this.videoPopup.close();
  }

  async deleteNote(note: VideoNote) {
    const alert = await this.alertCtrl.create({
      header: 'Notu Sil',
      message: 'Bu not silinecek. Emin misiniz?',
      cssClass: 'nf-alert',
      buttons: [
        { text: 'Vazgeç', role: 'cancel' },
        {
          text: 'Sil',
          role: 'destructive',
          handler: () => { this.videoNotes.deleteNote(note.id); this.load(); },
        },
      ],
    });
    await alert.present();
  }

  urlColor(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    return this.PALETTE[Math.abs(hash) % this.PALETTE.length];
  }

  extractYtId(url: string): string {
    const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/]+)/);
    return m ? m[1] : '';
  }

  async setTab(tab: string) {
    if (tab === 'home')    { this.router.navigate(['/']); return; }
    if (tab === 'explore') { this.router.navigate(['/harita']); return; }
    if (tab === 'profile') { this.router.navigate([this.auth.accountRoute]); return; }
    if (tab === 'downloads') {
      const toast = await this.toastCtrl.create({
        message: 'Bu özellik yakında geliyor!',
        duration: 1800, position: 'bottom', cssClass: 'nf-toast', color: 'dark',
      });
      await toast.present();
    }
  }
}
