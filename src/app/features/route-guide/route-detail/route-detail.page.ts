import { Component, HostListener, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, ToastController, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, airplaneOutline, closeOutline,
  checkmarkOutline, checkmarkCircleOutline, trainOutline, carOutline, busOutline, peopleOutline,
  playCircleOutline, starOutline, locationOutline, homeOutline,
  searchOutline, mapOutline, downloadOutline, personOutline,
  chevronForwardOutline, chevronDownOutline, refreshOutline,
  shareOutline, bookmarkOutline, createOutline, informationCircleOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { UMRAH_ROUTES } from '../data/umrah-routes.data';
import { UmrahRoute, UmrahRouteStep, City, StepType, TransportType } from '../../../models/route.model';
import { RouteChecklistService } from '../../../services/route-checklist.service';
import { VideoPopupComponent } from '../../../components/video-popup/video-popup.component';

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, VideoPopupComponent],
  templateUrl: './route-detail.page.html',
  styleUrls: ['./route-detail.page.scss'],
})
export class RouteDetailPage implements OnInit {
  route: UmrahRoute | null = null;
  checkStates: Record<string, boolean[]> = {};
  activeTab = '';

  popupOpen = false;
  popupStep: UmrahRouteStep | null = null;
  expandedTransportKey: string | null = null;

  nextStepDialogOpen = false;
  pendingNextStep: UmrahRouteStep | null = null;

  /* Rota adımı videoları başka sayfaya gitmeden bu popup'ta oynatılır. */
  @ViewChild('videoPopup') videoPopup?: VideoPopupComponent;

  private routeId = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private checklistService: RouteChecklistService,
  ) {
    addIcons({
      arrowBackOutline, airplaneOutline, closeOutline,
      checkmarkOutline, checkmarkCircleOutline, trainOutline, carOutline, busOutline, peopleOutline,
      playCircleOutline, starOutline, locationOutline, homeOutline,
      searchOutline, mapOutline, downloadOutline, personOutline,
      chevronForwardOutline, chevronDownOutline, refreshOutline,
      shareOutline, bookmarkOutline, createOutline, informationCircleOutline,
      arrowForwardOutline,
    });
    // Checklist Firestore'dan asenkron gelir; snapshot güncellenince durum tazelenir.
    effect(() => {
      this.checklistService.states();
      if (this.route) this.loadCheckStates();
    });
  }

  ngOnInit() {
    this.routeId = this.activatedRoute.snapshot.paramMap.get('routeId') ?? '';
    this.route = UMRAH_ROUTES.find(r => r.id === this.routeId) ?? null;
    if (this.route) {
      this.loadCheckStates();
    }
  }

  private loadCheckStates() {
    if (!this.route) return;
    const saved = this.checklistService.getChecklistState(this.routeId);
    this.route.steps.forEach(step => {
      this.checkStates[step.id] = step.checklist.map(
        (_, i) => saved[`${step.id}:${i}`] ?? false
      );
    });
  }

  openPopup(stepId: string) {
    this.popupStep = this.route?.steps.find(s => s.id === stepId) ?? null;
    this.popupOpen = true;
  }

  /** Kart tıklaması: aynı kart açıksa kapat, değilse o kartı genişlet. */
  togglePopup(stepId: string) {
    if (this.popupOpen && this.popupStep?.id === stepId) {
      this.closePopup();
    } else {
      this.openPopup(stepId);
    }
  }

  isStepExpanded(stepId: string): boolean {
    return this.popupOpen && this.popupStep?.id === stepId;
  }

  closePopup() {
    this.popupOpen = false;
    this.expandedTransportKey = null;
  }

  /** Adım panelinin tek kapanma yolu: Escape (üst bar ve yüzer buton kaldırıldı). */
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.videoPopup?.isOpen) {
      this.videoPopup.close();
      return;
    }
    if (this.nextStepDialogOpen) {
      this.dismissNextStep();
      return;
    }
    if (this.popupOpen) this.closePopup();
  }

  toggleTransport(stepId: string, optIndex: number) {
    const key = `${stepId}:${optIndex}`;
    this.expandedTransportKey = this.expandedTransportKey === key ? null : key;
  }

  isTransportExpanded(stepId: string, optIndex: number): boolean {
    return this.expandedTransportKey === `${stepId}:${optIndex}`;
  }

  get popupStepIndex(): number {
    if (!this.popupStep || !this.route) return 0;
    return this.route.steps.findIndex(s => s.id === this.popupStep!.id);
  }

  get popupCheckStates(): boolean[] {
    return this.popupStep ? (this.checkStates[this.popupStep.id] ?? []) : [];
  }

  togglePopupCheck(index: number) {
    if (!this.popupStep) return;
    this.toggleCheck(this.popupStep.id, index);
  }

  toggleCheck(stepId: string, index: number) {
    const updated = [...this.checkStates[stepId]];
    updated[index] = !updated[index];
    this.checkStates[stepId] = updated;
    this.checklistService.updateChecklistItem(this.routeId, stepId, index, updated[index]);
  }

  async clearChecklist() {
    const alert = await this.alertCtrl.create({
      header: 'İlerlemeyi Sıfırla',
      message: 'Tüm işaretlemeler silinecek. Emin misiniz?',
      cssClass: 'rd-confirm-alert',
      buttons: [
        { text: 'Vazgeç', role: 'cancel' },
        {
          text: 'Sıfırla',
          role: 'destructive',
          handler: async () => {
            this.checklistService.clearRouteChecklist(this.routeId);
            this.loadCheckStates();
            const toast = await this.toastCtrl.create({
              message: 'İlerleme sıfırlandı.',
              duration: 1600,
              position: 'bottom',
              cssClass: 'nf-toast',
              color: 'dark',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  cityLabel(city: City): string {
    const labels: Record<City, string> = { Jeddah: 'Cidde', Makkah: 'Mekke', Madinah: 'Medine' };
    return labels[city];
  }

  typeIcon(type: StepType): string {
    const map: Record<StepType, string> = {
      airport: 'airplane-outline', transport: 'train-outline',
      hotel: 'home-outline', worship: 'star-outline',
      visit: 'location-outline', return: 'airplane-outline',
    };
    return map[type];
  }

  transportIcon(type: TransportType): string {
    const map: Record<TransportType, string> = {
      train: 'train-outline', taxi: 'car-outline',
      bus: 'bus-outline', private_transfer: 'people-outline',
    };
    return map[type];
  }

  async selectVideo(opt: import('../../../models/route.model').TransportOption) {
    if (!opt.videos?.length) return;

    if (opt.videos.length === 1) {
      this.playVideo(opt.videos[0].url, opt.videos[0].label ?? opt.title);
      return;
    }

    const sheet = await this.actionSheetCtrl.create({
      header: opt.title,
      cssClass: 'rd-video-sheet',
      buttons: [
        ...opt.videos.map(v => ({
          text: v.label,
          icon: 'play-circle-outline',
          handler: () => { this.playVideo(v.url, v.label); },
        })),
        { text: 'Vazgeç', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  /** Rota adımı videoları sayfadan ayrılmadan paylaşılan popup bileşeninde oynatılır. */
  playVideo(url: string, title?: string) {
    this.videoPopup?.open(url, title ?? this.popupStep?.title ?? 'Rota Videosu');
  }

  goBack() {
    this.router.navigate(['/umrah-routes']);
  }

  async setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'home')    { this.router.navigate(['/']); return; }
    if (tab === 'search')  { this.router.navigate(['/lokasyonlar']); return; }
    if (tab === 'explore') { this.router.navigate(['/harita']); return; }
    if (tab === 'notes') { this.router.navigate(['/notlarim']); return; }
    if (tab === 'profile') { this.router.navigate(['/profile']); return; }
    if (tab === 'downloads') {
      const toast = await this.toastCtrl.create({
        message: 'Bu özellik yakında geliyor!',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
      this.activeTab = '';
    }
  }

  checkedCount(stepId: string): number {
    return (this.checkStates[stepId] ?? []).filter(Boolean).length;
  }

  totalCount(stepId: string): number {
    return this.checkStates[stepId]?.length ?? 0;
  }

  get totalCheckedAll(): number {
    return Object.values(this.checkStates).reduce((sum, arr) => sum + arr.filter(Boolean).length, 0);
  }

  get totalItemsAll(): number {
    return Object.values(this.checkStates).reduce((sum, arr) => sum + arr.length, 0);
  }

  getStepRatio(stepId: string): number {
    const total = this.totalCount(stepId);
    return total > 0 ? this.checkedCount(stepId) / total : 0;
  }

  cityRingClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-story-ring--blue',
      Makkah:  'rd-story-ring--gold',
      Madinah: 'rd-story-ring--green',
    };
    return map[city];
  }

  cityGlowClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-icon-circle--cyan',
      Makkah:  'rd-icon-circle--gold',
      Madinah: 'rd-icon-circle--green',
    };
    return map[city];
  }

  cityDotClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-dot--cyan',
      Makkah:  'rd-dot--gold',
      Madinah: 'rd-dot--green',
    };
    return map[city];
  }

  cityBadgeClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-step-badge--cyan',
      Makkah:  'rd-step-badge--gold',
      Madinah: 'rd-step-badge--green',
    };
    return map[city];
  }

  cityProgressClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-card-progress-fill--cyan',
      Makkah:  'rd-card-progress-fill--gold',
      Madinah: 'rd-card-progress-fill--green',
    };
    return map[city];
  }

  cityCardClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-glass-card--cyan',
      Makkah:  'rd-glass-card--gold',
      Madinah: 'rd-glass-card--green',
    };
    return map[city];
  }

  transportCardBgClass(type: TransportType): string {
    const map: Record<TransportType, string> = {
      train:            'rd-fs-tc--train',
      taxi:             'rd-fs-tc--taxi',
      private_transfer: 'rd-fs-tc--private',
      bus:              'rd-fs-tc--bus',
    };
    return map[type];
  }

  getStepImage(step: UmrahRouteStep): string {
    if (step.city === 'Jeddah' && step.type === 'airport') {
      return "url('assets/images/cidde-havalimani.jpg')";
    }
    return '';
  }

  cityHeroClass(city: City): string {
    const map: Record<City, string> = {
      Jeddah:  'rd-fs-hero--cyan',
      Makkah:  'rd-fs-hero--gold',
      Madinah: 'rd-fs-hero--green',
    };
    return map[city];
  }

  getYoutubeThumbnail(url: string): string {
    const match = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1];
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  }

  getVideoCardThumbnail(step: UmrahRouteStep): string {
    const url = step.videoUrl ?? step.videos?.[0]?.url ?? '';
    return url ? this.getYoutubeThumbnail(url) : '';
  }

  hasVideoCard(step: UmrahRouteStep): boolean {
    return !step.hideVideoButton && !!(step.videoUrl || step.videos?.length);
  }

  /** Birden çok video varsa tekli küçük resim yerine kart içinde ızgara gösterilir. */
  hasMultipleVideos(step: UmrahRouteStep): boolean {
    return !!(step.videos && step.videos.length > 1);
  }

  /** Yalnızca tekli video kutusundan çağrılır (çoklu videoda her öğe kendi tıklamasıyla oynar). */
  openStepVideo() {
    if (!this.popupStep) return;
    const url = this.popupStep.videos?.[0]?.url ?? this.popupStep.videoUrl;
    if (url) {
      // Kart açık kalır; video üstte popup'ta oynar.
      this.playVideo(url);
    } else {
      this.toastCtrl.create({
        message: 'Bu adım için video yakında eklenecek.',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      }).then(t => t.present());
    }
  }

  async markAllComplete() {
    if (!this.popupStep) return;
    const stepId = this.popupStep.id;
    const len = this.checkStates[stepId]?.length ?? 0;
    const allDone = this.checkStates[stepId]?.every(Boolean);

    if (!allDone) {
      const updated = Array(len).fill(true);
      this.checkStates[stepId] = updated;
      updated.forEach((_, i) => {
        this.checklistService.updateChecklistItem(this.routeId, stepId, i, true);
      });
    }

    const nextIndex = this.popupStepIndex + 1;
    if (this.route && nextIndex < this.route.steps.length) {
      this.pendingNextStep = this.route.steps[nextIndex];
      this.nextStepDialogOpen = true;
    } else {
      const toast = await this.toastCtrl.create({
        message: allDone ? 'Bu adımın tüm maddeleri zaten tamamlandı.' : 'Tüm maddeler tamamlandı!',
        duration: 1600,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
    }
  }

  confirmNextStep() {
    const next = this.pendingNextStep;
    this.nextStepDialogOpen = false;
    this.pendingNextStep = null;
    if (next) {
      this.closePopup();
      setTimeout(() => this.openPopup(next.id), 50);
    }
  }

  dismissNextStep() {
    this.nextStepDialogOpen = false;
    this.pendingNextStep = null;
  }

  async showDetailInfo() {
    const toast = await this.toastCtrl.create({
      message: 'Detaylı bilgi özelliği yakında geliyor!',
      duration: 1800,
      position: 'bottom',
      cssClass: 'nf-toast',
      color: 'dark',
    });
    await toast.present();
  }

  async showNotesToast() {
    const toast = await this.toastCtrl.create({
      message: 'Notlarım özelliği yakında geliyor!',
      duration: 1800,
      position: 'bottom',
      cssClass: 'nf-toast',
      color: 'dark',
    });
    await toast.present();
  }

}
