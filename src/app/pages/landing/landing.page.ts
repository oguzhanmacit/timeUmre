import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  effect,
} from '@angular/core';
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
  chevronBackOutline,
  closeOutline,
  playOutline,
  playCircleOutline,
  checkmarkOutline,
  documentTextOutline,
  bagOutline,
  femaleOutline,
  maleOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { LocationService } from '../../services/location.service';
import {
  WatchHistoryService,
  WatchEntry,
} from '../../services/watch-history.service';
import { UmreLocation } from '../../models/location.model';
import { VideoFeedService } from '../../services/video-feed.service';
import { AuthService } from '../../services/auth.service';
import { RouteChecklistService } from '../../services/route-checklist.service';

interface ContentItem {
  title: string;
  imageUrl: string;
  route: string[];
  watchUrl?: string;
  videos?: { label: string; url: string }[];
  duration?: string;
  label?: string;
  type?: string;
  description?: string;
}
interface ContentRow {
  title: string;
  items: ContentItem[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnDestroy {
  activeTab = 'home';

  private scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;

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
  /** users/{uid}/checklists/{id} altında sabit doküman ID'leri (RouteChecklistService paylaşılır). */
  private static readonly CHECKLIST_IDS = {
    umre: 'story-umre-adimlari',
    resmi: 'story-resmi-islemler',
    bavul: 'story-bavul',
  } as const;
  private checklistId = '';
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

  /** Firestore snapshot'ından (RouteChecklistService cache'i) items dizisine checked durumunu uygular. */
  private syncChecklistFromDb(
    items: { checked: boolean }[],
    checklistId: string,
  ): void {
    const state = this.checklistService.getChecklistState(checklistId);
    items.forEach((item, i) => {
      item.checked = state[`item:${i}`] ?? false;
    });
  }
  private syncAllChecklistsFromDb(): void {
    this.syncChecklistFromDb(this.umreItems2, LandingPage.CHECKLIST_IDS.umre);
    this.syncChecklistFromDb(this.resmiItems, LandingPage.CHECKLIST_IDS.resmi);
    this.syncChecklistFromDb(this.bavulItems, LandingPage.CHECKLIST_IDS.bavul);
  }

  openUmreChecklist() {
    this.checklistItems = this.umreItems2;
    this.checklistTitle = 'Umre Adımları';
    this.checklistId = LandingPage.CHECKLIST_IDS.umre;
    this.checklistSequential = true;
    this.checklistOpen = true;
  }
  openResmiChecklist() {
    this.checklistItems = this.resmiItems;
    this.checklistTitle = 'Resmi İşlemler';
    this.checklistId = LandingPage.CHECKLIST_IDS.resmi;
    this.checklistSequential = false;
    this.checklistOpen = true;
  }
  openBavulChecklist() {
    this.checklistItems = this.bavulItems;
    this.checklistTitle = 'Bavul';
    this.checklistId = LandingPage.CHECKLIST_IDS.bavul;
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
          this.checklistService.updateChecklistItem(this.checklistId, 'item', i, false);
        }
      } else {
        item.checked = false;
        this.checklistService.updateChecklistItem(this.checklistId, 'item', index, false);
      }
    } else {
      item.checked = true;
      this.checklistService.updateChecklistItem(this.checklistId, 'item', index, true);
    }
  }

  sheetOpen = false;
  sheetItem: ContentItem | null = null;
  sheetLocation: UmreLocation | null = null;
  sheetLoading = false;
  activeSheetTab: 'main' | 'detaylar' = 'main';

  bgUrl(url: string): string {
    return `url("${url}")`;
  }

  /** Fare kullanıcıları için satır oklarıyla yatay kaydırma (görünür genişliğin %80'i kadar). */
  scrollRow(el: HTMLElement, dir: number): void {
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  /**
   * Satır ucuna gelindiğinde o yöndeki oku gizlemek için wrapper'a durum sınıfları
   * basar. Hover'a girişte (ilk durum) ve her scroll'da çağrılır.
   */
  updateRowArrows(el: HTMLElement): void {
    const wrap = el.parentElement;
    if (!wrap) return;
    wrap.classList.toggle('rs-can-left', el.scrollLeft > 4);
    wrap.classList.toggle(
      'rs-can-right',
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    );
  }

  ytThumb(url: string): string {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]{11})/,
    );
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
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

  featured = {
    title: 'UMRE YOLCULUĞU:',
    subtitle: 'KUTSAL TOPRAKLARA ADIM ADIM',
    description: 'Kutsal yolculuğunuz için adım adım rehber.',
    imageUrl: 'assets/kabe.jpg',
  };

  rows: ContentRow[] = [
    {
      title: 'KÂBE',

      items: [
        {
          title: 'Kâbe',
          imageUrl: 'assets/images/video-card/kabe.jpeg',
          route: ['/location', '1'],
          duration: '28:26',
        },
        {
          title: 'Kâbenin Çevresi',
          imageUrl: 'assets/images/video-card/Kabenin çevresi.jpg',
          route: ['/location', '1'],
          watchUrl: 'https://youtu.be/xictyBC0ZFw?si=_ayhHWPoIOoIfIp6',
          duration: '20:37',
        },
        {
          title: 'Mekke',
          imageUrl: 'assets/images/video-card/mekke.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=W-z3ilgAV8k',
          duration: '18:43',
        },
        {
          title: 'Hacerü`l Esved',
          imageUrl: 'assets/images/video-card/Hacerul esved.jpg',
          route: ['/location', '6'],
          watchUrl: 'https://www.youtube.com/watch?v=ul4obOv3l8c',
          duration: '5:43',
        },
        {
          title: 'Mültezem',
          imageUrl: 'assets/images/video-card/mültezem.jpeg',
          route: ['/location', '7'],
          watchUrl: 'https://www.youtube.com/shorts/xGQ5sBYCVsQ',
          duration: '0:16',
        },
        {
          title: 'Makam-ı İbrahim',
          imageUrl: 'assets/images/video-card/makamı ibrahim.jpg',
          route: ['/location', '8'],
          watchUrl: 'https://www.youtube.com/watch?v=CxbHO8rzpiM',
          duration: '2:37',
        },
        {
          title: 'Mekke (1880)',
          imageUrl: 'assets/images/video-card/mekke 1880.jpg',
          route: ['/location', '9'],
          watchUrl: 'https://youtu.be/Ltgy9cKBCtI?si=uFCEVyUhK6b_opMS',
          duration: '8:37',
        },
        {
          title: 'Zemzem',
          imageUrl: 'assets/images/video-card/zemzem.jpg',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=csmllN8NZwY',
          duration: '7:36',
        },
        {
          title: 'Umre',
          imageUrl: 'assets/images/video-card/umre.jpg',
          route: ['/location', '9'],
          watchUrl: 'https://www.youtube.com/watch?v=U1JhfjEm-xY',
          duration: '41:05',
        },
        {
          title: 'Kadınlar İçin Uygun Saat',
          imageUrl: 'assets/images/video-card/kadınlar için.jpg',
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
          imageUrl: 'assets/images/video-card/hira mağarası.jpg',
          route: ['/location', '5'],
          duration: '06:13',
        },

        {
          title: "Müzdelife ve Meş'arı Haram",
          imageUrl: 'assets/images/video-card/meşarı haram.jpg',
          route: ['/location', '4'],
          watchUrl: 'https://www.youtube.com/watch?v=fWu6lsNMu5U',
          duration: '16:27',
        },
        {
          title: "Cennetü'l-Mualla",
          imageUrl: 'assets/images/video-card/cennet-ul-mualla-b.jpg',
          route: ['/location', '11'],
          watchUrl: 'https://www.youtube.com/watch?v=pLXOHMvXgdQ',
          duration: '12:00',
        },
        {
          title: 'Mescid-i Hayf',
          imageUrl: 'assets/images/video-card/Hayf-Mescidi.jpeg',
          route: ['/location', '15'],
          watchUrl: 'https://www.youtube.com/watch?v=QEZzmllEgDs',
          duration: '3:18',
        },
        {
          title: 'Akabe',
          imageUrl: 'assets/images/video-card/akabe.jpg',
          route: ['/location', '16'],
          watchUrl: 'https://www.youtube.com/watch?v=xuq21doNkJg',
          duration: '15:22',
        },
        {
          title: 'Efendimizin Doğduğu Ev',
          imageUrl: 'assets/images/video-card/Efendimizin Doğduğu Ev.jpg',
          route: ['/location', '12'],
          watchUrl: 'https://www.youtube.com/watch?v=nbgWkKzg0sM',
          duration: '12:49',
        },
        {
          title: 'Cirane Mescidi',
          imageUrl: 'assets/images/video-card/mescid-i-cirane-b.jpg',
          route: ['/location', '19'],
          watchUrl: 'https://www.youtube.com/watch?v=crPiNyNTBgU&t=154s',
          duration: '17:16',
        },
        {
          title: 'Mina',
          imageUrl: 'assets/images/video-card/mina.png',
          route: ['/location', '2'],
          watchUrl: 'https://www.youtube.com/watch?v=1BtvcvwDSnY',
          duration: '19:30',
        },
        {
          title: 'Sevr Mağarası',
          imageUrl: 'assets/images/video-card/sevr mağarası.jpg',
          route: ['/location', '14'],
          watchUrl: 'https://www.youtube.com/watch?v=XWg8NCwg-dE&t=666s',
          duration: '15:06',
        },
        {
          title: 'Arafat Yapay Zeka',
          imageUrl: 'assets/images/video-card/arafat yapay zeka.jpg',
          route: ['/location', '3'],
          duration: '25:24',
        },
        {
          title: 'Arafat',
          imageUrl: 'assets/images/video-card/arafat.jpg',
          route: ['/location', '3'],
          watchUrl: 'https://www.youtube.com/watch?v=UotSoX79jCs',
          duration: '9:53',
        },
        {
          title: 'Cin Mescidi',
          imageUrl: 'assets/images/video-card/mescid-i-cin-a_m.jpg',
          route: ['/location', '13'],
          watchUrl: 'https://www.youtube.com/watch?v=0Q2w6Ytj-ZA',
          duration: '5:37',
        },
        {
          title: 'Hudeybiye',
          imageUrl: 'assets/images/video-card/hudeybiye-e.jpg',
          route: ['/location', '20'],
          watchUrl: 'https://www.youtube.com/watch?v=L1gvKf9obK8',
          duration: '28:14',
        },

        {
          title: 'Safa ve Merve',
          imageUrl: 'assets/images/video-card/Safa ve Merve.jpg',
          route: ['/location', '10'],
          watchUrl: 'https://www.youtube.com/watch?v=e65PFGJEZac',
          duration: '10:10',
        },
        {
          title: "Meş'aru'l-Haram",
          imageUrl: 'assets/images/video-card/MESHAIRI-HARAM.jpg',
          route: ['/location', '17'],
          watchUrl: 'https://www.youtube.com/watch?v=ySRDnHzfv0w',
          duration: '3:47',
        },
      ],
    },

    {
      title: 'MEDİNE KUTSAL MEKÂNLARI',

      items: [
        {
          title: 'Mescid-i Nebevi ve Hücre-i Saadet',
          imageUrl: 'assets/images/video-card/mescidi nebevi.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=3POpzHkrRW8',
          duration: '28:53',
        },
        {
          title: 'Hücre-i Saadet',
          imageUrl: 'assets/images/video-card/Hücre-i Saadet.webp',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=b6g4z4Ra-Zs',
          duration: '6:02',
        },
        {
          title: 'Mescid-i Nebevi Çevresi',
          imageUrl: 'assets/images/video-card/mescidi-nebevi çevresi.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FoP_klbWDxk',
          duration: '21:02',
        },
        {
          title: "Cennetü'l-Baki",
          imageUrl: "assets/images/video-card/Cennetü'l-Baki.jpg",
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Mp364suPaMQ',
          duration: '15:27',
        },
        {
          title: 'Kuba Mescidi',
          imageUrl: 'assets/images/video-card/Kuba Mescidi.jpg',
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
          imageUrl: 'assets/images/video-card/Uhud.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=SsmjpWYuTZA',
          duration: '53:57',
        },
        {
          title: 'Hendek Savaşı',
          imageUrl: 'assets/images/video-card/Hendek.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=FiXUZmp50ag',
          duration: '59:15',
        },
        {
          title: 'Cuma Mescidi',
          imageUrl: 'assets/images/video-card/cuma-mescidi.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lNWISF-hQ5g',
        },
        {
          title: 'Mikat Mescidi',
          imageUrl: 'assets/images/video-card/Mikat Mescidi.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=e73AJkWoRQ8',
        },
        {
          title: 'İslamın İlk Yıllarında Medine (3 Boyutlu)',
          imageUrl:
            'assets/images/video-card/İslamın İlk Yıllarında Medine (3 Boyutlu).jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=To3P-utMW_I',
          duration: '3:06',
        },
        {
          title: 'Mescid-i Fadıh (İçkinin Yasak Edildiği Yer)',
          imageUrl: 'assets/images/video-card/mescidi fadıh.webp',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=MBl5murv3cc',
          duration: '1:48',
        },
        {
          title: 'Selamlama Kapısı',
          imageUrl: 'assets/images/video-card/Selamlama Kapısı.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=BXEvIqzk6MA',
          duration: '9:26',
        },
        {
          title: 'Medine Hakkında Önemli Bilgiler',
          imageUrl: 'assets/images/video-card/medine hakkında.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Pw6MT-ou9cQ&t=1110s',
          duration: '43:30',
        },
        {
          title: "190 No'lu Otobüs",
          imageUrl: 'assets/images/video-card/190 nolu otobüs.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/nkl8BWyokDw',
          label: 'Nasıl Giderim?',
          duration: '0:50',
        },
      ],
    },
    {
      title: 'CİDDE HAVALİMANI',

      items: [
        {
          title: 'Güney Terminali (Eski Terminal)',
          imageUrl: 'assets/images/video-card/güney terminali.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/tc4tttsyMDc',
          duration: '1:30',
        },
        {
          title: "Havalimanı'na Varış",
          imageUrl: 'assets/images/video-card/havalimanına varış.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=Os5rO3TngqU&t=81s',
          duration: '14:16',
        },
        {
          title: 'Havalimanından Mekke Tren İstasyonuna Geçiş',
          imageUrl:
            'assets/images/video-card/havalimanından tren istasyonuna geçiş.webp',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=iEn3ePl8_Ik',
          duration: '6:23',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş",
          imageUrl: 'assets/images/video-card/ciddeden mekkeye geçiş.jpeg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=dHXam3UYvW4',
          duration: '15:53',
        },
        {
          title: "Cidde'den Mekke'ye Geçiş (Alternatif)",
          imageUrl: 'assets/images/video-card/alternatif.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/MecNuMUNBqY',
          duration: '0:58',
        },
        {
          title: "Cidde'ye Dön",
          imageUrl: 'assets/images/video-card/ciddeye dön.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=TwiiDcxo4wQ',
        },
        {
          title: "Jarwal Garajından Cidde'ye",
          imageUrl: 'assets/images/video-card/jarwal garajı.png',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=lquQC6hLXx8',
        },
        {
          title: 'Havalimanı Dönüş İşlemleri',
          imageUrl: 'assets/images/video-card/havalimanı dönüş işlemleri.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=oXKAF5zOefE&t=91s',
        },
        {
          title: 'Cidde Havalimanında yerel sim kart ve e-sim nerden alınır',
          imageUrl: 'https://img.youtube.com/vi/MgE6LL8ICDg/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/MgE6LL8ICDg',
        },
      ],
    },
    {
      title: 'MEDİNE HAVALİMANI',

      items: [
        {
          title: "Otobüs ile Havalimanından Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'assets/images/video-card/otobüs ile mescidi nebeviye.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/K325QMVUgPQ',
        },
        {
          title: "Mescid-i Nebevi'den Medine Havalimanı'na Dönüş",
          imageUrl:
            'assets/images/video-card/mescidi nebiden medine havalimanına.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/sQqKoNd9sP0',
        },
        {
          title: "Havalimanından Otobüs ile Mescid-i Nebevi'ye Ulaşım",
          imageUrl: 'assets/images/video-card/otobüs ile mescidi nebeviye.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/y4YhzHi3GGU',
          duration: '0:44',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'assets/images/video-card/zemzem noktası.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
          duration: '0:59',
        },
      ],
    },
    {
      title: 'HURMA-ZEMZEM ALIŞVERİŞİ',

      items: [
        {
          title: "Medine'de Hurma Nereden Alınır?",
          imageUrl: 'assets/images/video-card/medine hurma.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=vbUnheReqQk',
          duration: '26:37',
        },
        {
          title: "Mekke'de Hurma Nereden Alınır?",
          imageUrl: 'assets/images/video-card/mekke hurma.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=IMwzeTtCPeA',
          duration: '4:54',
        },
        {
          title: 'Hava Alanında Zemzem Nereden Alınır?',
          imageUrl: 'assets/images/video-card/havaalanında zemzem nerden.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/ICsAa4DS8fM',
          duration: '0:24',
        },
        {
          title: 'Havalimanına Ulaşım ve Zemzem Alış Noktası',
          imageUrl: 'assets/images/video-card/zemzem noktası.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/caG0I8jXDxs',
          duration: '0:59',
        },
        {
          title: 'Kâbe Yakınında Süper Market',
          imageUrl: 'assets/images/video-card/süpermarket.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/GG9w4EVGqlA',
          duration: '0:35',
        },
        {
          title: "Medine'de Süper Market",
          imageUrl: 'https://img.youtube.com/vi/CqP8d8eh2_I/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/CqP8d8eh2_I',
        },
        {
          title: 'Medine de Türk Restoranı',
          imageUrl: 'https://img.youtube.com/vi/C8aQR9A75yk/hqdefault.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/shorts/C8aQR9A75yk',
        },
      ],
    },
    {
      title: 'MEKKE - MEDİNE HATIRALARI',

      items: [
        {
          title: 'Mahmut Sami Kirazoğlu Hatıraları',
          imageUrl: 'https://img.youtube.com/vi/OjPuBpnOCcU/hqdefault.jpg',
          route: ['/harita'],
          type: 'Hatıra Serisi',
          description:
            "Mahmut Sami Kirazoğlu'nun Mekke ve Medine hatıralarından oluşan bu video listesi, kutsal topraklarda yaşanan manevi atmosferi, ziyaret edilen mübarek mekânları ve umre yolculuğunun kalpte bıraktığı izleri samimi bir anlatımla sunar. Mekke ve Medine'ye dair hatıralar, ziyaret noktaları, ibadet bilinci ve yolculuk tecrübeleri üzerinden izleyiciye hem bilgilendirici hem de duygusal bir rehberlik sağlar.",
          videos: [
            {
              label: 'Mekke - Medine Hatıraları 1',
              url: 'https://www.youtube.com/watch?v=OjPuBpnOCcU',
            },
            {
              label: 'Mekke - Medine Hatıraları 2',
              url: 'https://www.youtube.com/watch?v=CwHHFVy_vrM',
            },
            {
              label: 'Mekke - Medine Hatıraları 3',
              url: 'https://www.youtube.com/watch?v=I5Vsz5gPzYQ',
            },
            {
              label: 'Mekke - Medine Hatıraları 4',
              url: 'https://www.youtube.com/watch?v=NumM7hzU5dA',
            },
          ],
        },

        {
          title: 'Umre Hatıraları',
          imageUrl: 'assets/images/video-card/umre hatıraları.jpg',
          route: ['/harita'],
          watchUrl: 'https://www.youtube.com/watch?v=hPNx7bKbOBs',
          duration: '59:55',
        },
        {
          title: 'Hücre-i Sadete En Yakın Nokta',
          imageUrl:
            'assets/images/video-card/hücrei saadete en yakın nokta.jpg',
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
    private feed: VideoFeedService,
    private auth: AuthService,
    private checklistService: RouteChecklistService,
    private readonly zone: NgZone,
    private readonly hostEl: ElementRef<HTMLElement>,
  ) {
    // Kart hover büyümesi (scale) scroll sırasında imlecin altındaki hedefi
    // sürekli değiştirip wheel kaydırmalarını aralıklı yutuyordu; scroll boyunca
    // hover efektini kapatan sınıf zone dışında yönetilir (CD tetiklemez).
    this.zone.runOutsideAngular(() => {
      this.hostEl.nativeElement.addEventListener(
        'ionScroll',
        this.onContentScroll,
        {
          passive: true,
        },
      );
    });
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
      chevronForwardOutline,
      chevronBackOutline,
    });
    // Story checklist'leri (Umre Adımları/Resmi İşlemler/Bavul) Firestore'dan
    // asenkron gelir; snapshot güncellenince story rozetleri ve açık modal tazelenir.
    effect(() => {
      this.checklistService.states();
      this.syncAllChecklistsFromDb();
    });
    // İzleme geçmişi Firestore'dan asenkron gelir; snapshot güncellenince
    // kart ilerleme çubukları (getWatchFillPct/getWatchEntry) tazelenir.
    effect(() => {
      this.watchHistory.entries();
    });
    this.feed.videos = this.rows
      .flatMap((r) => r.items)
      .filter((i) => !!i.watchUrl)
      .map((i) => ({
        title: i.title,
        imageUrl: i.imageUrl,
        url: i.watchUrl!,
        duration: i.duration,
      }));
  }

  /** ionScroll host'a kabarcıklanır; sınıf sadece bu sayfanın kartlarını etkiler. */
  private readonly onContentScroll = (): void => {
    const el = this.hostEl.nativeElement;
    el.classList.add('nf-scrolling');
    if (this.scrollIdleTimer) clearTimeout(this.scrollIdleTimer);
    this.scrollIdleTimer = setTimeout(
      () => el.classList.remove('nf-scrolling'),
      140,
    );
  };

  ngOnDestroy(): void {
    this.hostEl.nativeElement.removeEventListener(
      'ionScroll',
      this.onContentScroll,
    );
    if (this.scrollIdleTimer) clearTimeout(this.scrollIdleTimer);
  }

  getWatchEntry(url?: string): WatchEntry | null {
    if (!url) return null;
    return this.watchHistory.getEntry(url);
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
    // "İzle" sekmesi kaldırıldı: tekli videoda oynatma artık hero'daki merkezi
    // butonla yapılıyor, bu yüzden sekme doğrudan Detaylar'la açılır. Çoklu
    // videoda "Videolar" sekmesi (bölüm listesi) varlığını koruyor.
    this.activeSheetTab = item.videos?.length ? 'main' : 'detaylar';
    const locId = this.extractLocationId(item.route);
    if (locId !== null) this.fetchDetails(locId);
  }

  setSheetTab(tab: 'main' | 'detaylar') {
    this.activeSheetTab = tab;
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
    this.activeSheetTab = 'main';
  }

  playSheetVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
    this.closeSheet();
  }

  /** Hero'nun ortasındaki tek oynat butonu: çoklu videoda ilk bölümü, tekli videoda kendisini oynatır. */
  playHero(): void {
    if (!this.sheetItem) return;
    if (this.sheetItem.videos?.length) {
      this.playSheetVideo(this.sheetItem.videos[0].url);
      return;
    }
    this.playSheet();
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
    if (tab === 'profile') {
      // Header'daki hesap simgesiyle aynı kural: misafir login'e gider.
      this.router.navigate([this.auth.accountRoute]);
      return;
    }
    if (tab === 'downloads') {
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
