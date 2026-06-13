import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
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

const YT = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  activeTab = 'home';
  headerScrolled = false;
  activeNav = 'umre';

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
          imageUrl: YT('y_ohCSTTW4g'),
          route: ['/location', '1'],
          duration: '28:26',
        },
        {
          title: 'Kâbenin Çevresi',
          imageUrl: 'https://img.youtube.com/vi/xictyBC0ZFw/hqdefault.jpg',
          route: ['/location', '1'],
          watchUrl: 'https://youtu.be/xictyBC0ZFw?si=_ayhHWPoIOoIfIp6',
          duration: '20:37',
        },
        {
          title: 'Mekke',
          imageUrl: YT('W-z3ilgAV8k'),
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=W-z3ilgAV8k',
          duration: '18:43',
        },
        {
          title: 'Hacerü`l Esved',
          imageUrl: YT('ul4obOv3l8c'),
          route: ['/location', '6'],
          watchUrl: 'https://www.youtube.com/watch?v=ul4obOv3l8c',
          duration: '5:43',
        },
        {
          title: 'Mültezem',
          imageUrl: 'https://img.youtube.com/vi/xGQ5sBYCVsQ/hqdefault.jpg',
          route: ['/location', '7'],
          watchUrl: 'https://www.youtube.com/shorts/xGQ5sBYCVsQ',
          duration: '0:16',
        },
        {
          title: 'Makam-ı İbrahim',
          imageUrl: 'https://img.youtube.com/vi/CxbHO8rzpiM/hqdefault.jpg',
          route: ['/location', '8'],
          watchUrl: 'https://www.youtube.com/watch?v=CxbHO8rzpiM',
          duration: '2:37',
        },
        {
          title: 'Mekke (1880)',
          imageUrl: YT('jkPtKNpXXM8'),
          route: ['/location', '9'],
          watchUrl: 'https://youtu.be/Ltgy9cKBCtI?si=uFCEVyUhK6b_opMS',
          duration: '8:37',
        },
        {
          title: 'Zemzem',
          imageUrl: 'https://img.youtube.com/vi/csmllN8NZwY/hqdefault.jpg',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=csmllN8NZwY',
          duration: '7:36',
        },
        {
          title: 'Umre',
          imageUrl: 'https://img.youtube.com/vi/U1JhfjEm-xY/hqdefault.jpg',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=U1JhfjEm-xY',
          duration: '41:05',
        },
        {
          title: 'Kadınlar İçin Uygun Saat',
          imageUrl: 'https://img.youtube.com/vi/ttOsPtQMH3A/hqdefault.jpg',
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
          imageUrl: YT('4w3cVQECMMA'),
          route: ['/location', '5'],
        },

        {
          title: "Müzdelife ve Meş'arı Haram",
          imageUrl: 'https://img.youtube.com/vi/fWu6lsNMu5U/hqdefault.jpg',
          route: ['/location', '4'],
          watchUrl: 'https://www.youtube.com/watch?v=fWu6lsNMu5U',
        },
        {
          title: "Cennetü'l-Mualla",
          imageUrl: 'https://img.youtube.com/vi/pLXOHMvXgdQ/hqdefault.jpg',
          route: ['/location', '11'],
          watchUrl: 'https://www.youtube.com/watch?v=pLXOHMvXgdQ',
        },
        {
          title: 'Mescid-i Hayf',
          imageUrl: 'https://img.youtube.com/vi/QEZzmllEgDs/hqdefault.jpg',
          route: ['/location', '15'],
          watchUrl: 'https://www.youtube.com/watch?v=QEZzmllEgDs',
        },
        {
          title: 'Akabe',
          imageUrl: 'https://img.youtube.com/vi/xuq21doNkJg/hqdefault.jpg',
          route: ['/location', '16'],
          watchUrl: 'https://www.youtube.com/watch?v=xuq21doNkJg',
        },
        {
          title: 'Efendimizin Doğduğu Ev',
          imageUrl: 'https://img.youtube.com/vi/nbgWkKzg0sM/hqdefault.jpg',
          route: ['/location', '12'],
          watchUrl: 'https://www.youtube.com/watch?v=nbgWkKzg0sM',
        },
        {
          title: 'Cirane Mescidi',
          imageUrl: 'https://img.youtube.com/vi/crPiNyNTBgU/hqdefault.jpg',
          route: ['/location', '19'],
          watchUrl: 'https://www.youtube.com/watch?v=crPiNyNTBgU&t=154s',
        },
        {
          title: 'Mina',
          imageUrl: 'https://img.youtube.com/vi/1BtvcvwDSnY/hqdefault.jpg',
          route: ['/location', '2'],
          watchUrl: 'https://www.youtube.com/watch?v=1BtvcvwDSnY',
        },
        {
          title: 'Sevr Mağarası',
          imageUrl: 'https://img.youtube.com/vi/XWg8NCwg-dE/hqdefault.jpg',
          route: ['/location', '14'],
          watchUrl: 'https://www.youtube.com/watch?v=XWg8NCwg-dE&t=666s',
        },
        {
          title: 'Arafat Yapay Zeka',
          imageUrl: YT('_8h8GP6yFlg'),
          route: ['/location', '3'],
        },
        {
          title: 'Arafat',
          imageUrl: 'https://img.youtube.com/vi/UotSoX79jCs/hqdefault.jpg',
          route: ['/location', '3'],
          watchUrl: 'https://www.youtube.com/watch?v=UotSoX79jCs',
        },
        {
          title: 'Cin Mescidi',
          imageUrl: 'https://img.youtube.com/vi/0Q2w6Ytj-ZA/hqdefault.jpg',
          route: ['/location', '13'],
          watchUrl: 'https://www.youtube.com/watch?v=0Q2w6Ytj-ZA',
        },
        {
          title: 'Hudeybiye',
          imageUrl: 'https://img.youtube.com/vi/L1gvKf9obK8/hqdefault.jpg',
          route: ['/location', '20'],
          watchUrl: 'https://www.youtube.com/watch?v=L1gvKf9obK8',
        },
        // {
        //   title: 'Mescid-i Haram',
        //   imageUrl: YT('4w3cVQECMMA'),
        //   route: ['/location', '1'],
        // },
        {
          title: 'Safa ve Merve',
          imageUrl: 'https://img.youtube.com/vi/e65PFGJEZac/hqdefault.jpg',
          route: ['/location', '10'],
          watchUrl: 'https://www.youtube.com/watch?v=e65PFGJEZac',
        },
        {
          title: "Meş'aru'l-Haram",
          imageUrl: 'https://img.youtube.com/vi/ySRDnHzfv0w/hqdefault.jpg',
          route: ['/location', '17'],
          watchUrl: 'https://www.youtube.com/watch?v=ySRDnHzfv0w',
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
          imageUrl: 'https://img.youtube.com/vi/3POpzHkrRW8/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=3POpzHkrRW8',
        },
        {
          title: 'Hücre-i Saadet',
          imageUrl: YT('b6g4z4Ra-Zs'),
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=b6g4z4Ra-Zs',
        },
        {
          title: 'Mescid-i Nebevi Çevresi',
          imageUrl: 'https://img.youtube.com/vi/FoP_klbWDxk/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FoP_klbWDxk',
        },
        {
          title: "Cennetü'l-Baki",
          imageUrl: 'https://img.youtube.com/vi/Mp364suPaMQ/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Mp364suPaMQ',
        },
        {
          title: 'Kuba Mescidi',
          imageUrl: 'https://img.youtube.com/vi/amZrr8aC938/hqdefault.jpg',
          route: ['/harita'],
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
          imageUrl: 'https://img.youtube.com/vi/SsmjpWYuTZA/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=SsmjpWYuTZA',
        },
        {
          title: 'Hendek Savaşı',
          imageUrl: 'https://img.youtube.com/vi/FiXUZmp50ag/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FiXUZmp50ag',
        },
        {
          title: 'Cuma Mescidi',
          imageUrl: 'https://img.youtube.com/vi/lNWISF-hQ5g/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lNWISF-hQ5g',
        },
        {
          title: 'Mikat Mescidi',
          imageUrl: 'https://img.youtube.com/vi/e73AJkWoRQ8/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=e73AJkWoRQ8',
        },
        {
          title: 'İslamın İlk Yıllarında Medine (3 Boyutlu)',
          imageUrl: 'https://img.youtube.com/vi/To3P-utMW_I/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=To3P-utMW_I',
        },
        {
          title: 'Mescid-i Fadıh (İçkinin Yasak Edildiği Yer)',
          imageUrl: 'https://img.youtube.com/vi/MBl5murv3cc/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=MBl5murv3cc',
        },
        {
          title: 'Selamlama Kapısı',
          imageUrl: YT('BXEvIqzk6MA'),
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=BXEvIqzk6MA',
        },
        {
          title: 'Medine Hakkında Önemli Bilgiler',
          imageUrl: YT('Pw6MT-ou9cQ'),
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Pw6MT-ou9cQ&t=1110s',
        },
        {
          title: "190 No'lu Otobüs",
          imageUrl: 'https://img.youtube.com/vi/nkl8BWyokDw/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/nkl8BWyokDw',
          label: 'Nasıl Giderim?',
        },
      ],
    },
    {
      title: 'CİDDE HAVALİMANI',

      items: [
        {
          title: 'Güney Terminali',
          imageUrl: 'https://img.youtube.com/vi/tc4tttsyMDc/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/tc4tttsyMDc',
        },
        {
          title: "Havalimanı'na Varış",
          imageUrl: 'https://img.youtube.com/vi/Os5rO3TngqU/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Os5rO3TngqU&t=81s',
        },
        {
          title: 'Havalimanından Mekke Tren İstasyonuna Geçiş',
          imageUrl: 'https://img.youtube.com/vi/iEn3ePl8_Ik/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=iEn3ePl8_Ik',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş",
          imageUrl: 'https://img.youtube.com/vi/dHXam3UYvW4/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş (Alternatif)",
          imageUrl: 'https://img.youtube.com/vi/MecNuMUNBqY/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/MecNuMUNBqY',
        },
        {
          title: "Cidde'ye Dön",
          imageUrl: 'https://img.youtube.com/vi/TwiiDcxo4wQ/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=TwiiDcxo4wQ',
        },
        {
          title: "Jarwal Garajından Cidde'ye",
          imageUrl: 'https://img.youtube.com/vi/lquQC6hLXx8/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lquQC6hLXx8',
        },
        {
          title: 'Havalimanı Dönüş İşlemleri',
          imageUrl: 'https://img.youtube.com/vi/oXKAF5zOefE/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=oXKAF5zOefE&t=91s',
        },
      ],
    },
    {
      title: 'MEDİNE HAVALİMANI',

      items: [
        {
          title: "Otobüs ile Havalimanından Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'https://img.youtube.com/vi/K325QMVUgPQ/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/K325QMVUgPQ',
        },
        {
          title: "Mescid-i Nebevi'den Medine Havalimanı'na Dönüş",
          imageUrl: 'https://img.youtube.com/vi/sQqKoNd9sP0/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/sQqKoNd9sP0',
        },
        {
          title: "Havalimanından Otobüs ile Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'https://img.youtube.com/vi/y4YhzHi3GGU/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/y4YhzHi3GGU',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'https://img.youtube.com/vi/caG0I8jXDxs/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
        },
      ],
    },
    {
      title: 'HURMA-ZEMZEM ALIŞVERİŞİ',

      items: [
        {
          title: "Medine'de Hurma Nereden Alınır?",
          imageUrl: 'https://img.youtube.com/vi/vbUnheReqQk/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=vbUnheReqQk',
        },
        {
          title: "Mekke'de Hurma Nereden Alınır?",
          imageUrl: 'https://img.youtube.com/vi/IMwzeTtCPeA/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=IMwzeTtCPeA',
        },
        {
          title: 'Hava Alanında Zemzem Nereden Alınır?',
          imageUrl: 'https://img.youtube.com/vi/ICsAa4DS8fM/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/ICsAa4DS8fM',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'https://img.youtube.com/vi/caG0I8jXDxs/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
        },
        {
          title: 'Kâbe Yakınında Süper Market',
          imageUrl: 'https://img.youtube.com/vi/GG9w4EVGqlA/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/GG9w4EVGqlA',
        },
      ],
    },
    {
      title: 'MEKKE - MEDİNE HATIRALARI',

      items: [
        {
          title: 'Mekke - Medine Hatıraları 1',
          imageUrl: 'https://img.youtube.com/vi/OjPuBpnOCcU/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=OjPuBpnOCcU',
        },
        {
          title: 'Mekke - Medine Hatıraları 2',
          imageUrl: 'https://img.youtube.com/vi/CwHHFVy_vrM/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=CwHHFVy_vrM',
        },
        {
          title: 'Mekke - Medine Hatıraları 3',
          imageUrl: 'https://img.youtube.com/vi/I5Vsz5gPzYQ/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=I5Vsz5gPzYQ',
        },
        {
          title: 'Mekke - Medine Hatıraları 4',
          imageUrl: 'https://img.youtube.com/vi/NumM7hzU5dA/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=NumM7hzU5dA',
        },
        {
          title: 'Umre Hatıraları',
          imageUrl: 'https://img.youtube.com/vi/hPNx7bKbOBs/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=hPNx7bKbOBs',
        },
        {
          title: 'Hücre-i Sadete En Yakın Nokta',
          imageUrl: 'https://img.youtube.com/vi/Ljp1-BuuViI/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Ljp1-BuuViI',
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
