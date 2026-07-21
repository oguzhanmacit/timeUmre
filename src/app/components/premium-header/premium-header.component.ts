import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronDownOutline,
  compassOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService, AppUser } from '../../services/auth.service';

export interface PremiumNavItem {
  id: string;
  label: string;
  route?: string[];
  children?: PremiumNavItem[];
  /** route'u olmayan öğeler seçildiğinde navItemSelect ile birlikte olduğu gibi geri döner. */
  payload?: unknown;
}

@Component({
  selector: 'app-premium-header',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  templateUrl: './premium-header.component.html',
  styleUrls: ['./premium-header.component.scss'],
})
export class PremiumHeaderComponent implements OnDestroy {
  @Input() logoText = 'Umre Rehberi';
  @Input() homeRoute: string[] = ['/'];

  /** Dışarıdan verilirse bu değer kullanılır; null bırakılırsa header aktif sayfanın ion-content scroll'unu kendi dinler. */
  @Input() scrolled: boolean | null = null;

  @Input() navItems: PremiumNavItem[] = [
    {
      id: 'umre',
      label: 'Umre',
      children: [
        { id: 'umre-nedir', label: 'Umre Nedir?' },
        { id: 'umre-nasil', label: 'Umre Nasıl Yapılır?' },
        { id: 'umre-checklist', label: 'Umre Adımları Kontrol Listesi' },
        { id: 'umre-sss', label: 'Sıkça Sorulan Sorular' },
      ],
    },
    { id: 'rota', label: 'Rota Rehberi', route: ['/umrah-routes'] },
    { id: 'vize', label: 'Vize' },
    { id: 'tren', label: 'Hızlı Tren' },
    { id: 'nusuk', label: 'Ravza Randevusu' },
  ];

  /** route içermeyen bir öğe seçildiğinde tetiklenir; navigasyonu üst bileşen üstlenir. */
  @Output() navItemSelect = new EventEmitter<PremiumNavItem>();

  openDropdownId: string | null = null;
  /** Header yalnızca sayfa en tepedeyken görünür; aşağı inildiğinde gizlenir. */
  hidden = false;

  private internalScrolled = false;
  private readonly routerSub: Subscription;

  /** Hesap durumu: giriş açıkken avatar/isim, kapalıyken "Giriş Yap" gösterir. */
  readonly user: Signal<AppUser | null>;

  /** Kalıcı hesap → profil; misafir (anonim) veya oturumsuz → login. */
  get accountRoute(): string {
    return this.authService.accountRoute;
  }

  get accountLabel(): string {
    const u = this.user();
    return u && !u.isAnonymous ? u.displayName || 'Profilim' : 'Giriş Yap';
  }

  constructor(
    private readonly router: Router,
    private readonly hostEl: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    private readonly authService: AuthService,
  ) {
    this.user = this.authService.user;
    addIcons({ compassOutline, chevronDownOutline, personCircleOutline });
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeAll();
        this.hidden = false;
      }
    });
    // Zone dışında dinlenir; aksi halde her scroll karesi tüm uygulamada change
    // detection tetikler. Zone'a yalnızca durum gerçekten değiştiğinde girilir.
    this.zone.runOutsideAngular(() => {
      document.addEventListener('ionScroll', this.onIonScroll, {
        passive: true,
      });
    });
  }

  get isScrolled(): boolean {
    return this.scrolled ?? this.internalScrolled;
  }

  /** Mobil çekmece için alt menüleri düz bir listeye açar. */
  get flatMobileItems(): PremiumNavItem[] {
    return this.navItems.flatMap((item) =>
      item.children?.length ? item.children : [item],
    );
  }

  /**
   * Aktif sayfanın `ion-content`'i kendi native shadow DOM'unda scroll yapar; bu yüzden
   * normal "scroll" event'i document'e (composed olmadığı için) hiç yansımaz. Ionic'in
   * bunun için özel olarak dışa açtığı "ionScroll" custom event'i (scrollEvents=true
   * gerektirir) dinleyerek hangi sayfa aktif olursa olsun scroll'u global olarak yakalıyoruz.
   * Zone dışında çalışır (constructor'daki addEventListener) — arrow function olması
   * this bağlamını korur.
   */
  private readonly onIonScroll = (event: Event): void => {
    const detail = (event as CustomEvent<{ scrollTop: number }>).detail;
    const scrollTop = detail.scrollTop;

    if (this.scrolled === null) {
      const scrolledNext = scrollTop > 40;
      if (scrolledNext !== this.internalScrolled) {
        this.zone.run(() => (this.internalScrolled = scrolledNext));
      }
    }

    // Yalnızca en tepede görünür: yukarı kaydırmak yetmez, sayfanın başına
    // dönülmesi gerekir. Menü açıkken gizlenmez.
    const menuOpen = this.openDropdownId !== null;
    const nextHidden = !menuOpen && scrollTop > 60;
    if (nextHidden !== this.hidden) {
      this.zone.run(() => (this.hidden = nextHidden));
    }
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.hostEl.nativeElement.contains(event.target as Node)) {
      this.closeAll();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  selectItem(item: PremiumNavItem): void {
    this.closeAll();
    if (item.route) {
      this.router.navigate(item.route);
      return;
    }
    this.navItemSelect.emit(item);
  }

  trackById(_index: number, item: PremiumNavItem): string {
    return item.id;
  }

  closeAll(): void {
    this.openDropdownId = null;
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    document.removeEventListener('ionScroll', this.onIonScroll);
  }
}
