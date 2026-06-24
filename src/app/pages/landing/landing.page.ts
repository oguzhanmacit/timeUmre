import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { MovieDetailPopupComponent } from '../../components/movie-detail-popup/movie-detail-popup.component';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  compassOutline,
  searchOutline,
  homeOutline,
  downloadOutline,
  personOutline,
  mapOutline,
  chevronDownOutline,
  closeOutline,
  playOutline,
  playCircleOutline,
  checkmarkOutline,
  documentTextOutline,
  bagOutline,
  femaleOutline,
  maleOutline,
  sunnyOutline,
  moonOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { LocationService } from '../../services/location.service';
import { ThemeService } from '../../services/theme.service';
import {
  WatchHistoryService,
  WatchEntry,
} from '../../services/watch-history.service';
import { UmreLocation } from '../../models/location.model';
import { VideoFeedService } from '../../services/video-feed.service';

interface ContentItem {
  title: string;
  imageUrl: string;
  route: string[];
  watchUrl?: string;
  videos?: { label: string; url: string }[];
  duration?: string;
  label?: string;
}
interface ContentRow {
  title: string;
  items: ContentItem[];
}


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, MovieDetailPopupComponent],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  @ViewChild(IonContent, { static: false }) private ionContent!: IonContent;

  activeTab = 'home';
  headerScrolled = false;
  activeNav = 'umre';

  selectedItem: ContentItem | null = null;
  popupTop = 0;

  // ── Umre adımları ──────────────────────────────
  umreItems2 = [
    { label: 'İhram Giydim', checked: false },
    { label: 'İhram Namazını Kıldım', checked: false },
    { label: 'Niyet Ettim', checked: false },
    { label: 'Telbiye Getirdim', checked: false },
    { label: 'Tavaf Yaptım', checked: false },
    { label: 'Tavaf Namazı Kıldım', checked: false },
    { label: 'Say Yaptım', checked: false },
    { label: 'Tıraş Oldum', checked: false },
  ];

  // ── Resmi işlemler ─────────────────────────────
  resmiItems = [
    { label: 'Pasaport geçerlilik kontrolü (6 ay+)', checked: false },
    { label: 'E-vize başvurusu (visa.visitsaudi.com)', checked: false },
    { label: 'Uçak bileti alımı', checked: false },
    { label: 'Otel rezervasyonu', checked: false },
    { label: 'Nusuk Uygulaması Kaydı', checked: false },
    { label: 'Ravza Randevusu', checked: false },
  ];

  // ── Bavul ──────────────────────────────────────
  bavulItems = [
    { label: 'İhram', checked: false, blue: true },
    { label: 'İhram Kemeri', checked: false, blue: true },
    {
      label: 'Dikişsiz İhram Terliği (Topuk Açık)-Sandalet',
      checked: false,
      blue: true,
    },
    { label: 'Traş Makinesi-Makas', checked: false, blue: true },
    {
      label: 'Ferace-İç Göstermeyen Bol Elbiseler',
      checked: false,
      pink: true,
    },
    { label: 'Pamuklu İç Tülbent ve Başörtüsü', checked: false, pink: true },
    {
      label: 'Küçük Omuz Çantası (Ferace altı için)',
      checked: false,
      pink: true,
    },
    { label: 'Tavaf Patiği-Çorabı', checked: false },
    { label: 'Kokusuz Sabun', checked: false },
    { label: 'Pişik Kremi', checked: false },
    { label: 'Dikişsiz Terlik (Topuğu Açık)-Sandalet', checked: false },
    { label: 'Şemsiye (güneş için)', checked: false },
    { label: 'Şarj Kablosu ve Adaptör (İngiliz tip)', checked: false },
    { label: 'Küçük Sırt Çantası (harem için)', checked: false },
    { label: 'İlaç-Vitamin', checked: false },
    { label: 'Güneş Kremi', checked: false },
  ];

  // ── Aktif modal ────────────────────────────────
  checklistOpen = false;
  checklistTitle = '';
  checklistSequential = false;
  checklistItems: {
    label: string;
    checked: boolean;
    pink?: boolean;
    blue?: boolean;
  }[] = [];
  private checklistStorageKey = '';
  blueSectionOpen = true;
  pinkSectionOpen = true;

  get checklistTamamlananSayisi(): number {
    return this.checklistItems.filter((i) => i.checked).length;
  }
  get checklistOrani(): number {
    return this.checklistItems.length
      ? this.checklistTamamlananSayisi / this.checklistItems.length
      : 0;
  }
  get umreTamamlanan(): number {
    return this.umreItems2.filter((i) => i.checked).length;
  }
  get resmiTamamlanan(): number {
    return this.resmiItems.filter((i) => i.checked).length;
  }
  get bavulTamamlanan(): number {
    return this.bavulItems.filter((i) => i.checked).length;
  }
  get umreOrani(): number {
    return this.umreItems2.length
      ? this.umreTamamlanan / this.umreItems2.length
      : 0;
  }
  get resmiOrani(): number {
    return this.resmiItems.length
      ? this.resmiTamamlanan / this.resmiItems.length
      : 0;
  }
  get bavulOrani(): number {
    const items = this.bavulItems;
    const totalChecked = items.filter((i) => i.checked).length;

    // Tüm 16 madde işaretlendi
    if (totalChecked === items.length) return 1;

    const anyBlue = items.some((i) => i.blue && i.checked);
    const anyPink = items.some((i) => i.pink && i.checked);

    // Hiç mavi işaretlenmemiş + mavi olmayanların tamamı işaretli
    if (!anyBlue && items.filter((i) => !i.blue).every((i) => i.checked))
      return 1;

    // Hiç pembe işaretlenmemiş + pembe olmayanların tamamı işaretli
    if (!anyPink && items.filter((i) => !i.pink).every((i) => i.checked))
      return 1;

    return totalChecked / items.length;
  }

  private loadAllChecklists() {
    this.loadOne(this.umreItems2, 'umre-checklist-v1');
    this.loadOne(this.resmiItems, 'resmi-checklist-v1');
    this.loadOne(this.bavulItems, 'bavul-checklist-v2');
  }
  private loadOne(items: { label: string; checked: boolean }[], key: string) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const states: boolean[] = JSON.parse(saved);
        states.forEach((c, i) => {
          if (items[i]) items[i].checked = c;
        });
      }
    } catch {}
  }
  private saveChecklist() {
    localStorage.setItem(
      this.checklistStorageKey,
      JSON.stringify(this.checklistItems.map((i) => i.checked)),
    );
  }

  openUmreChecklist() {
    this.checklistItems = this.umreItems2;
    this.checklistTitle = 'Umre Adımları';
    this.checklistStorageKey = 'umre-checklist-v1';
    this.checklistSequential = true;
    this.checklistOpen = true;
  }
  openResmiChecklist() {
    this.checklistItems = this.resmiItems;
    this.checklistTitle = 'Resmi İşlemler';
    this.checklistStorageKey = 'resmi-checklist-v1';
    this.checklistSequential = false;
    this.checklistOpen = true;
  }
  openBavulChecklist() {
    this.checklistItems = this.bavulItems;
    this.checklistTitle = 'Bavul';
    this.checklistStorageKey = 'bavul-checklist-v2';
    this.checklistSequential = false;
    this.blueSectionOpen = this.bavulItems.some((i) => i.blue && i.checked);
    this.pinkSectionOpen = this.bavulItems.some((i) => i.pink && i.checked);
    this.checklistOpen = true;
  }
  closeChecklist() {
    this.checklistOpen = false;
  }

  isItemDisabled(index: number): boolean {
    return (
      this.checklistSequential &&
      index > 0 &&
      !this.checklistItems[index - 1].checked
    );
  }
  toggleItem(index: number) {
    if (this.isItemDisabled(index)) return;
    const item = this.checklistItems[index];
    if (item.checked) {
      if (this.checklistSequential) {
        for (let i = index; i < this.checklistItems.length; i++) {
          this.checklistItems[i].checked = false;
        }
      } else {
        item.checked = false;
      }
    } else {
      item.checked = true;
    }
    this.saveChecklist();
  }

  sheetOpen = false;
  sheetItem: ContentItem | null = null;
  sheetLocation: UmreLocation | null = null;
  sheetLoading = false;
  umreDropdownOpen = false;
  giderimDropdownOpen = false;
  continueWatchingItems: ContentItem[] = [];

  readonly umreItems: { label: string; videoUrl?: string }[] = [
    { label: 'İhram', videoUrl: 'https://www.youtube.com/shorts/-zzyB2FZKpA' },
    {
      label: 'İhram Namazı-Niyet-Telbiye',
      videoUrl: 'https://www.youtube.com/shorts/GHaB3maYk_A',
    },
    // { label: 'Telbiye' },
    {
      label: 'İhram Yasakları',
      videoUrl: 'https://www.youtube.com/watch?v=1M4EOX-uPns',
    },
    // { label: 'İhramlı İken Yasak Olmayan Bazı Fiil ve Davranışlar' },
    {
      label: 'Harem Bölgesine Giriş',
      videoUrl: 'https://www.youtube.com/watch?v=GhpPyRqoysI',
    },
    {
      label: 'Tavaf-Tavaf Namazı',
      videoUrl: 'https://www.youtube.com/watch?v=9cuzcnhh86k',
    },
    { label: 'Say', videoUrl: 'https://www.youtube.com/shorts/GMJoRtuNzGo' },
    {
      label: 'Tıraş Olup İhramdan Çıkış',
      videoUrl: 'https://www.youtube.com/shorts/-QOOrPt7bxo',
    },
  ];

  readonly giderimItems: {
    label: string;
    videoUrl?: string;
    videos?: { label: string; url: string }[];
    route?: string[];
  }[] = [
    {
      label: 'Adım Adım Rota Rehberi',
      route: ['/umrah-routes'],
    },
    {
      label: 'Vize İşlemleri',
      videos: [
        {
          label: 'Vize İşlemleri',
          url: 'https://www.youtube.com/watch?v=s9dvUYCZhFo&t=3s',
        },
        {
          label: 'Kapıda Vize (Alternatif)',
          url: 'https://www.youtube.com/watch?v=QVr2nPEq0V4',
        },
      ],
    },
    // {
    //   label: 'İstanbul-Cidde-Mekke-Medine-İstanbul Rotası',
    //   videos: [
    //     {
    //       label: "Cidde Havalimanından Mekke'ye Nasıl Gidilir?",
    //       url: 'https://www.youtube.com/watch?v=Os5rO3TngqU&t=81s',
    //     },
    //     {
    //       label: "Mekke'den Medine'ye Nasıl Gidilir?",
    //       url: 'https://www.youtube.com/watch?v=3L-ocdHKA_U',
    //     },
    //   ],
    // },
    // {
    //   label: 'İstanbul-Medine-Mekke-Cidde-İstanbul Rotası',
    //   videos: [
    //     {
    //       label: 'Cidde Havalimanından İstanbula Nasıl Gidilir ?',
    //       url: 'https://www.youtube.com/watch?v=oXKAF5zOefE',
    //     },
    //     {
    //       label: 'Mekkeden Ciddeye Nasıl Gidilir ?',
    //       url: 'https://www.youtube.com/watch?v=x-uMYfpvcRk',
    //     },
    //   ],
    // },
    {
      label: 'Hızlı Tren İşlemleri',
      videoUrl: 'https://www.youtube.com/watch?v=kKVuT_joVLI',
    },
    {
      label: 'Nusuk Uygulaması (Ravza Randevusu)',
      videoUrl: 'https://www.youtube.com/watch?v=3WdFmS_vmP0',
    },
  ];

  videoPickerOpen = false;
  videoPickerItems: { label: string; url: string }[] = [];

  onScroll(event: CustomEvent) {
    this.headerScrolled = event.detail.scrollTop > 60;
    this.closeDropdown();
  }

  async openPopup(item: ContentItem, event: MouseEvent): Promise<void> {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const scrollEl = await this.ionContent.getScrollElement();
    const scrollTop = scrollEl.scrollTop;
    this.selectedItem = item;
    this.popupTop = scrollTop + rect.top - 80;
    setTimeout(() => {
      this.ionContent.scrollToPoint(0, this.popupTop - 40, 300);
    });
  }

  closePopup(): void {
    this.selectedItem = null;
  }

  onPopupPlay(url: string): void {
    this.closePopup();
    this.router.navigate(['/watch'], { queryParams: { url } });
  }

  toggleUmreDropdown(event: Event) {
    event.stopPropagation();
    this.umreDropdownOpen = !this.umreDropdownOpen;
    this.giderimDropdownOpen = false;
    this.activeNav = 'umre';
  }

  toggleGiderimDropdown(event: Event) {
    event.stopPropagation();
    this.giderimDropdownOpen = !this.giderimDropdownOpen;
    this.umreDropdownOpen = false;
    this.activeNav = 'giderim';
  }

  closeDropdown() {
    this.umreDropdownOpen = false;
    this.giderimDropdownOpen = false;
  }

  selectUmreItem(item: { label: string; videoUrl?: string }) {
    this.closeDropdown();
    if (item.videoUrl) {
      this.router.navigate(['/watch'], { queryParams: { url: item.videoUrl } });
    }
  }

  selectGiderimItem(item: {
    label: string;
    videoUrl?: string;
    videos?: { label: string; url: string }[];
    route?: string[];
  }) {
    if (item.videos?.length) {
      this.closeDropdown();
      this.videoPickerItems = item.videos;
      this.videoPickerOpen = true;
      return;
    }
    this.closeDropdown();
    if (item.route) {
      this.router.navigate(item.route);
      return;
    }
    if (item.videoUrl) {
      this.router.navigate(['/watch'], { queryParams: { url: item.videoUrl } });
    }
  }

  ionViewWillEnter() {
    this.buildContinueWatching();
  }

  private buildContinueWatching(): void {
    const all: ContentItem[] = [];

    for (const row of this.rows) {
      for (const item of row.items) {
        if (item.watchUrl) all.push(item);
      }
    }

    for (const item of this.umreItems) {
      if (item.videoUrl) {
        all.push({
          title: item.label,
          imageUrl: this.ytThumb(item.videoUrl),
          route: [],
          watchUrl: item.videoUrl,
        });
      }
    }

    for (const item of this.giderimItems) {
      if (item.videoUrl) {
        all.push({
          title: item.label,
          imageUrl: this.ytThumb(item.videoUrl),
          route: [],
          watchUrl: item.videoUrl,
        });
      }
      for (const v of item.videos ?? []) {
        all.push({
          title: v.label,
          imageUrl: this.ytThumb(v.url),
          route: [],
          watchUrl: v.url,
        });
      }
    }

    const sorted = all
      .filter((item) => {
        const e = this.watchHistory.getEntry(item.watchUrl!);
        return e && e.seconds > 15 && !e.completed && !e.dismissed;
      })
      .sort((a, b) => {
        const ea = this.watchHistory.getEntry(a.watchUrl!)!;
        const eb = this.watchHistory.getEntry(b.watchUrl!)!;
        return (eb.updatedAt ?? 0) - (ea.updatedAt ?? 0);
      });

    const MAX = 10;
    sorted
      .slice(MAX)
      .forEach((item) => this.watchHistory.dismiss(item.watchUrl!));
    this.continueWatchingItems = sorted.slice(0, MAX);
  }

  private ytThumb(url: string): string {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]{11})/,
    );
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
  }

  continueWatching(item: ContentItem): void {
    const seconds = this.watchHistory.getEntry(item.watchUrl!)?.seconds ?? 0;
    this.router.navigate(['/watch'], {
      queryParams: { url: item.watchUrl, t: Math.floor(seconds) },
    });
  }

  removeContinueWatching(item: ContentItem, event: Event): void {
    event.stopPropagation();
    this.watchHistory.dismiss(item.watchUrl!);
    this.continueWatchingItems = this.continueWatchingItems.filter(
      (i) => i.watchUrl !== item.watchUrl,
    );
  }

  getWatchFillPct(url?: string): number {
    if (!url) return 0;
    const e = this.watchHistory.getEntry(url);
    if (!e) return 0;
    if (e.completed) return 100;
    if (e.duration && e.duration > 0)
      return Math.min(Math.round((e.seconds / e.duration) * 100), 99);
    return 40;
  }

  selectPickerVideo(url: string) {
    this.videoPickerOpen = false;
    this.router.navigate(['/watch'], { queryParams: { url } });
  }

  closeVideoPicker() {
    this.videoPickerOpen = false;
  }

  featured = {
    title: 'UMRE YOLCULUĞU:',
    subtitle: 'KUTSAL TOPRAKLARA ADIM ADIM',
    description:
      'Kutsal yolculuğunuz için adım adım rehber, dualar ve hazırlıklar.',
    imageUrl: 'assets/kabe.jpg',
  };

  rows: ContentRow[] = [
    {
      title: 'KÂBE',

      items: [
        {
          title: 'Kâbe',
          imageUrl: 'assets/data/video-cart/kabe.jpeg',
          route: ['/location', '1'],
          watchUrl: 'https://www.youtube.com/watch?v=y_ohCSTTW4g&t=1s',
          duration: '28:26',
        },
        {
          title: 'Kâbenin Çevresi',
          imageUrl: 'assets/data/video-cart/kabe-cevre.png',
          route: ['/location', '1'],
          watchUrl: 'https://youtu.be/xictyBC0ZFw?si=_ayhHWPoIOoIfIp6',
          duration: '20:37',
        },
        {
          title: 'Mekke',
          imageUrl: 'assets/data/video-cart/mekke.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=W-z3ilgAV8k',
          duration: '18:43',
        },
        {
          title: 'Hacerü`l Esved',
          imageUrl: 'assets/data/video-cart/hacerul-esved.png',
          route: ['/location', '6'],
          watchUrl: 'https://www.youtube.com/watch?v=ul4obOv3l8c',
          duration: '5:48',
        },
        {
          title: 'Mültezem',
          imageUrl: 'assets/data/video-cart/multezem.png',
          route: ['/location', '7'],
          watchUrl: 'https://www.youtube.com/shorts/xGQ5sBYCVsQ',
          duration: '0:16',
        },
        {
          title: 'Makam-ı İbrahim',
          imageUrl: 'assets/data/video-cart/makam-i-ibrahim.png',
          route: ['/location', '8'],
          watchUrl: 'https://www.youtube.com/watch?v=CxbHO8rzpiM',
          duration: '2:37',
        },
        {
          title: 'Mekke (1880)',
          imageUrl: 'assets/data/video-cart/mekke-1880.png',
          route: ['/location', '9'],
          watchUrl: 'https://youtu.be/Ltgy9cKBCtI?si=uFCEVyUhK6b_opMS',
          duration: '8:37',
        },
        {
          title: 'Zemzem',
          imageUrl: 'assets/data/video-cart/zemzem.png',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=csmllN8NZwY',
          duration: '7:36',
        },
        {
          title: 'Umre',
          imageUrl: 'assets/data/video-cart/umre.png',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=U1JhfjEm-xY',
          duration: '41:05',
        },
        {
          title: 'Kadınlar İçin Uygun Saat',
          imageUrl: 'assets/data/video-cart/kadinlar-uygun-saat.png',
          route: ['/location', '1'],
          watchUrl: 'https://www.youtube.com/shorts/ttOsPtQMH3A',
          duration: '0:19',
        },
      ],
    },
    {
      title: 'MEKKE ZİYARET NOKTALARI',

      items: [
        {
          title: 'Hira Mağarası',
          imageUrl: 'assets/data/video-cart/hira-magarasi.png',
          route: ['/location', '5'],
          watchUrl: 'https://www.youtube.com/watch?v=4w3cVQECMMA',
          duration: '6:13',
        },

        {
          title: "Müzdelife ve Meş'arı Haram",
          imageUrl: 'assets/data/video-cart/muzdelife-mesari-haram.png',
          route: ['/location', '4'],
          watchUrl: 'https://www.youtube.com/watch?v=fWu6lsNMu5U',
          duration: '16:27',
        },
        {
          title: "Cennetü'l-Mualla",
          imageUrl: 'assets/data/video-cart/cennetul-mualla.png',
          route: ['/location', '11'],
          watchUrl: 'https://www.youtube.com/watch?v=pLXOHMvXgdQ',
          duration: '12:00',
        },
        {
          title: 'Mescid-i Hayf',
          imageUrl: 'assets/data/video-cart/mescid-i-hayf.png',
          route: ['/location', '15'],
          watchUrl: 'https://www.youtube.com/watch?v=QEZzmllEgDs',
          duration: '3:18',
        },
        {
          title: 'Akabe',
          imageUrl: 'assets/data/video-cart/akabe.png',
          route: ['/location', '16'],
          watchUrl: 'https://www.youtube.com/watch?v=xuq21doNkJg',
          duration: '15:22',
        },
        {
          title: 'Efendimizin Doğduğu Ev',
          imageUrl: 'assets/data/video-cart/efendimizin-dogdugu-ev.png',
          route: ['/location', '12'],
          watchUrl: 'https://www.youtube.com/watch?v=nbgWkKzg0sM',
          duration: '12:49',
        },
        {
          title: 'Cirane Mescidi',
          imageUrl: 'assets/data/video-cart/cirane-mescidi.png',
          route: ['/location', '19'],
          watchUrl: 'https://www.youtube.com/watch?v=crPiNyNTBgU&t=154s',
          duration: '17:16',
        },
        {
          title: 'Mina',
          imageUrl: 'assets/data/video-cart/mina.png',
          route: ['/location', '2'],
          watchUrl: 'https://www.youtube.com/watch?v=1BtvcvwDSnY',
          duration: '19:30',
        },
        {
          title: 'Sevr Mağarası',
          imageUrl: 'assets/data/video-cart/sevr-magarasi.png',
          route: ['/location', '14'],
          watchUrl: 'https://www.youtube.com/watch?v=XWg8NCwg-dE&t=666s',
          duration: '15:06',
        },
        {
          title: 'Arafat Yapay Zeka',
          imageUrl: 'assets/data/video-cart/arafat-yapay-zeka.png',
          route: ['/location', '3'],
          watchUrl: 'https://www.youtube.com/watch?v=_8h8GP6yFlg',
          duration: '25:24',
        },
        {
          title: 'Arafat',
          imageUrl: 'assets/data/video-cart/arafat.png',
          route: ['/location', '3'],
          watchUrl: 'https://www.youtube.com/watch?v=UotSoX79jCs',
          duration: '9:53',
        },
        {
          title: 'Cin Mescidi',
          imageUrl: 'assets/data/video-cart/cin-mescidi.png',
          route: ['/location', '13'],
          watchUrl: 'https://www.youtube.com/watch?v=0Q2w6Ytj-ZA',
          duration: '5:37',
        },
        {
          title: 'Hudeybiye',
          imageUrl: 'assets/data/video-cart/hudeybiye.png',
          route: ['/location', '20'],
          watchUrl: 'https://www.youtube.com/watch?v=L1gvKf9obK8',
          duration: '28:14',
        },
        // {
        //   title: 'Mescid-i Haram',
        //   imageUrl: YT('4w3cVQECMMA'),
        //   route: ['/location', '1'],
        // },
        {
          title: 'Safa ve Merve',
          imageUrl: 'assets/data/video-cart/safa-ve-merve.png',
          route: ['/location', '10'],
          watchUrl: 'https://www.youtube.com/watch?v=e65PFGJEZac',
          duration: '10:10',
        },
        {
          title: "Meş'aru'l-Haram",
          imageUrl: 'assets/data/video-cart/mesarul-haram.png',
          route: ['/location', '17'],
          watchUrl: 'https://www.youtube.com/watch?v=ySRDnHzfv0w',
          duration: '3:47',
        },
      ],
    },
    // {
    //   title: 'MEKKE-MEDİNE YOLCULUĞU',
    //   items: [
    //     {
    //       title: 'Reci Olayı',
    //       imageUrl: YT('GTZs2OHLSbA'),
    //       route: ['/harita'],
    //     },
    //     {
    //       title: 'Usfan',
    //       imageUrl: YT('4w3cVQECMMA'),
    //       route: ['/harita'],
    //     },
    //     {
    //       title: 'Mescid-i Feth',
    //       imageUrl: YT('_8h8GP6yFlg'),
    //       route: ['/harita'],
    //     },
    //     {
    //       title: 'Meymune Validemizin Kabri',
    //       imageUrl: YT('KfANUcmZbLg'),
    //       route: ['/harita'],
    //     },
    //   ],
    // },
    {
      title: 'MEDİNE KUTSAL MEKÂNLARI',

      items: [
        {
          title: 'Mescid-i Nebevi ve Hücre-i Saadet',
          imageUrl: 'assets/data/video-cart/mescidi-nebevi-hucrei-saadet.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=3POpzHkrRW8',
          duration: '28:53',
        },
        {
          title: 'Hücre-i Saadet',
          imageUrl: 'assets/data/video-cart/hucrei-saadet.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=b6g4z4Ra-Zs',
          duration: '6:02',
        },
        {
          title: 'Mescid-i Nebevi Çevresi',
          imageUrl: 'assets/data/video-cart/mescidi-nebevi-cevresi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FoP_klbWDxk',
          duration: '21:02',
        },
        {
          title: "Cennetü'l-Baki",
          imageUrl: 'assets/data/video-cart/cennetul-baki.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Mp364suPaMQ',
          duration: '15:27',
        },
        {
          title: 'Kuba Mescidi',
          imageUrl: 'assets/data/video-cart/kuba-mescidi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/amZrr8aC938',
          duration: '0:52',
          videos: [
            {
              label: 'Kuba Mescidi - Video 1',
              url: 'https://www.youtube.com/shorts/amZrr8aC938',
            },
            {
              label: 'Kuba Mescidi - Video 2',
              url: 'https://www.youtube.com/watch?v=K3o-_4mxGxE',
            },
          ],
        },

        {
          title: 'Uhud',
          imageUrl: 'assets/data/video-cart/uhud.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=SsmjpWYuTZA',
          duration: '53:57',
        },
        {
          title: 'Hendek Savaşı',
          imageUrl: 'assets/data/video-cart/hendek.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FiXUZmp50ag',
          duration: '59:15',
        },
        {
          title: 'Cuma Mescidi',
          imageUrl: 'assets/data/video-cart/cuma-mescidi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lNWISF-hQ5g',
          duration: '9:02',
        },
        {
          title: 'Mikat Mescidi',
          imageUrl: 'assets/data/video-cart/mikat-mescidi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=e73AJkWoRQ8',
          duration: '4:48',
        },
        {
          title: 'İslamın İlk Yıllarında Medine (3 Boyutlu)',
          imageUrl: 'assets/data/video-cart/medine-3d.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=To3P-utMW_I',
          duration: '3:06',
        },
        {
          title: 'Mescid-i Fadıh (İçkinin Yasak Edildiği Yer)',
          imageUrl: 'assets/data/video-cart/mescidi-fadih.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=MBl5murv3cc',
          duration: '1:48',
        },
        {
          title: 'Selamlama Kapısı',
          imageUrl: 'assets/data/video-cart/selamlama-kapisi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=BXEvIqzk6MA',
          duration: '9:26',
        },
        {
          title: 'Medine Hakkında Önemli Bilgiler',
          imageUrl: 'assets/data/video-cart/medine-onemli-bilgiler.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Pw6MT-ou9cQ&t=1110s',
          duration: '43:30',
        },
        {
          title: "190 No'lu Otobüs",
          imageUrl: 'assets/data/video-cart/190-no-otobus.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/nkl8BWyokDw',
          duration: '0:50',
          label: 'Nasıl Giderim?',
        },
      ],
    },
    {
      title: 'CİDDE HAVALİMANI',

      items: [
        {
          title: 'Güney Terminali',
          imageUrl: 'assets/data/video-cart/güney terminali.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/tc4tttsyMDc',
          duration: '1:30',
        },
        {
          title: "Havalimanı'na Varış",
          imageUrl: 'assets/data/video-cart/havalimanına varış.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Os5rO3TngqU&t=81s',
          duration: '14:16',
        },
        {
          title: 'Havalimanından Mekke Tren İstasyonuna Geçiş',
          imageUrl: 'assets/data/video-cart/mekke tren istasyonuna geçiş.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=iEn3ePl8_Ik',
          duration: '6:23',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş",
          imageUrl: 'assets/data/video-cart/ciddeden mekkeye geçiş.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
          duration: '15:53',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş (Alternatif)",
          imageUrl: 'assets/data/video-cart/ciddeden mekkeye alternatif.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/MecNuMUNBqY',
          duration: '0:58',
        },
        {
          title: "Cidde'ye Dön",
          imageUrl: 'assets/data/video-cart/ciddeye dön.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=TwiiDcxo4wQ',
          duration: '11:38',
        },
        {
          title: "Jarwal Garajından Cidde'ye",
          imageUrl: 'assets/data/video-cart/jarwal garajı.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lquQC6hLXx8',
          duration: '7:40',
        },
        {
          title: 'Havalimanı Dönüş İşlemleri',
          imageUrl: 'assets/data/video-cart/havalimanı dönüş işlemleri.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=oXKAF5zOefE&t=91s',
          duration: '16:04',
        },
      ],
    },
    {
      title: 'MEDİNE HAVALİMANI',

      items: [
        {
          title: "Otobüs ile Havalimanından Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'assets/data/video-cart/havalimanından mescidi nebeviye.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/K325QMVUgPQ',
          duration: '0:44',
        },
        {
          title: "Mescid-i Nebevi'den Medine Havalimanı'na Dönüş",
          imageUrl: 'assets/data/video-cart/mescidi nebeviden havalimanına.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/sQqKoNd9sP0',
          duration: '0:46',
        },
        {
          title: "Havalimanından Otobüs ile Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'assets/data/video-cart/havalimanından mescidi nebeviye.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/y4YhzHi3GGU',
          duration: '0:44',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'assets/data/video-cart/zemzem alış noktası.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
          duration: '0:59',
        },
      ],
    },
    {
      title: 'HURMA - ZEMZEM ALIŞVERİŞİ',

      items: [
        {
          title: "Medine'de Hurma Nereden Alınır?",
          imageUrl: 'assets/data/video-cart/medinede hurma.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=vbUnheReqQk',
          duration: '26:37',
        },
        
        {
          title: "Mekke'de Hurma Nereden Alınır?",
          imageUrl: 'assets/data/video-cart/mekkede hurma.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=IMwzeTtCPeA',
          duration: '4:54',
        },
        {
          title: 'Hava Alanında Zemzem Nereden Alınır?',
          imageUrl: 'assets/data/video-cart/zemzem nereden alınır.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/ICsAa4DS8fM',
          duration: '0:24',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'assets/data/video-cart/zemzem alış noktası.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
          duration: '0:59',
        },
        {
          title: 'Kâbe Yakınında Süper Market',
          imageUrl: 'assets/data/video-cart/süpermarket.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/GG9w4EVGqlA',
          duration: '0:35',
        },
      ],
    },
    {
      title: 'MEKKE - MEDİNE HATIRALARI',

      items: [
        {
          title: 'Mekke - Medine Hatıraları 1',
          imageUrl: 'assets/data/video-cart/mekke-medine hatıraları 1.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=OjPuBpnOCcU',
          duration: '32:00',
        },
        {
          title: 'Mekke - Medine Hatıraları 2',
          imageUrl: 'assets/data/video-cart/mekke-medine hatıraları 2.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=CwHHFVy_vrM',
          duration: '27:23',
        },
        {
          title: 'Mekke - Medine Hatıraları 3',
          imageUrl: 'assets/data/video-cart/mekke-medine hatıraları 3.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=I5Vsz5gPzYQ',
          duration: '25:58',
        },
        {
          title: 'Mekke - Medine Hatıraları 4',
          imageUrl: 'assets/data/video-cart/mekke-medine hatıraları 4.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=NumM7hzU5dA',
          duration: '30:01',
        },
        {
          title: 'Umre Hatıraları',
          imageUrl: 'assets/data/video-cart/umre hatıraları.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=hPNx7bKbOBs',
          duration: '59:55',
        },
        {
          title: 'Hücre-i Sadete En Yakın Nokta',
          imageUrl: 'assets/data/video-cart/hücrei saadete en yakın nokta.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Ljp1-BuuViI',
          duration: '3:49',
        },
      ],
    },
  ];

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private locationService: LocationService,
    private watchHistory: WatchHistoryService,
    public theme: ThemeService,
    private feed: VideoFeedService,
  ) {
    addIcons({
      compassOutline,
      searchOutline,
      homeOutline,
      downloadOutline,
      personOutline,
      mapOutline,
      chevronDownOutline,
      closeOutline,
      playOutline,
      playCircleOutline,
      checkmarkOutline,
      documentTextOutline,
      bagOutline,
      femaleOutline,
      maleOutline,
      sunnyOutline,
      moonOutline,
      chevronForwardOutline,
    });
    this.loadAllChecklists();
    this.feed.videos = this.rows
      .flatMap(r => r.items)
      .filter(i => !!i.watchUrl)
      .map(i => ({ title: i.title, imageUrl: i.imageUrl, url: i.watchUrl!, duration: i.duration }));
  }

  getWatchEntry(url?: string): WatchEntry | null {
    if (!url) return null;
    return this.watchHistory.getEntry(url);
  }

  goNav(item: string) {
    this.activeNav = item;
    if (item === 'giderim') {
      this.router.navigate(['/harita']);
    }
  }

  playFeatured() {
    this.router.navigate(['/watch'], {
      queryParams: { url: 'https://www.youtube.com/watch?v=gL259RbrDCs' },
    });
  }

  openItem(item: ContentItem) {
    this.sheetItem = item;
    this.sheetOpen = true;
    this.sheetLocation = null;
    const locId = this.extractLocationId(item.route);
    if (locId !== null) this.fetchDetails(locId);
  }

  private extractLocationId(route: string[]): number | null {
    if (route[0] === '/location' && route[1]) return +route[1];
    return null;
  }

  private async fetchDetails(id: number) {
    this.sheetLoading = true;
    const all = await firstValueFrom(this.locationService.getLocations());
    this.sheetLocation = all.find((l) => l.id === id) ?? null;
    this.sheetLoading = false;
  }

  closeSheet() {
    this.sheetOpen = false;
    this.sheetItem = null;
    this.sheetLocation = null;
  }

  playSheetVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
    this.closeSheet();
  }

  playSheet() {
    if (!this.sheetItem) return;
    if (this.sheetItem.watchUrl) {
      this.router.navigate(['/watch'], {
        queryParams: { url: this.sheetItem.watchUrl },
      });
      this.closeSheet();
      return;
    }
    const locId = this.extractLocationId(this.sheetItem.route);
    if (locId !== null && this.sheetLocation?.videos.length) {
      const firstVideo = this.sheetLocation.videos[0];
      this.closeSheet();
      this.router.navigate(['/player', locId, firstVideo.id]);
      return;
    }
    this.router.navigate(this.sheetItem.route);
    this.closeSheet();
  }

  async setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'search') {
      this.router.navigate(['/lokasyonlar']);
      return;
    }
    if (tab === 'explore') {
      this.router.navigate(['/harita']);
      return;
    }
    if (tab === 'notes') {
      this.router.navigate(['/notlarim']);
      return;
    }
    if (tab === 'downloads' || tab === 'profile') {
      const toast = await this.toastCtrl.create({
        message: 'Bu özellik yakında geliyor!',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
      this.activeTab = 'home';
    }
  }
}
