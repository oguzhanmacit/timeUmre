import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
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

  closePopup() {
    this.popupOpen = false;
    this.expandedTransportKey = null;
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
      this.playVideo(opt.videos[0].url);
      return;
    }

    const sheet = await this.actionSheetCtrl.create({
      header: opt.title,
      cssClass: 'rd-video-sheet',
      buttons: [
        ...opt.videos.map(v => ({
          text: v.label,
          icon: 'play-circle-outline',
          handler: () => { this.playVideo(v.url); },
        })),
        { text: 'Vazgeç', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  playVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
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
    if (tab === 'downloads' || tab === 'profile') {
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

  openStepVideo() {
    if (!this.popupStep) return;
    const step = this.popupStep;

    if (step.videos && step.videos.length > 1) {
      this.router.navigate(['/umrah-routes', this.routeId, 'step-videos', step.id]);
      return;
    }

    const url = step.videos?.[0]?.url ?? step.videoUrl;
    if (url) {
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
    if (allDone) {
      const toast = await this.toastCtrl.create({
        message: 'Bu adımın tüm maddeleri zaten tamamlandı.',
        duration: 1600,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
      return;
    }
    const updated = Array(len).fill(true);
    this.checkStates[stepId] = updated;
    updated.forEach((_, i) => {
      this.checklistService.updateChecklistItem(this.routeId, stepId, i, true);
    });
    const toast = await this.toastCtrl.create({
      message: 'Tüm maddeler tamamlandı!',
      duration: 1600,
      position: 'bottom',
      cssClass: 'nf-toast',
      color: 'dark',
    });
    await toast.present();
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

  async shareStep() {
    const toast = await this.toastCtrl.create({
      message: 'Paylaşım özelliği yakında geliyor!',
      duration: 1800,
      position: 'bottom',
      cssClass: 'nf-toast',
      color: 'dark',
    });
    await toast.present();
  }

  async bookmarkStep() {
    const toast = await this.toastCtrl.create({
      message: 'Adım kaydedildi!',
      duration: 1600,
      position: 'bottom',
      cssClass: 'nf-toast',
      color: 'dark',
    });
    await toast.present();
  }
}
