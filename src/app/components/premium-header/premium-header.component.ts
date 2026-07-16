import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, compassOutline, searchOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

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
    { id: 'rota', label: 'Adım Adım Rota Rehberi', route: ['/umrah-routes'] },
    { id: 'vize', label: 'Vize İşlemleri' },
    { id: 'tren', label: 'Hızlı Tren İşlemleri' },
    { id: 'nusuk', label: 'Nusuk Uygulaması (Ravza Randevusu)' },
  ];

  /** route içermeyen bir öğe seçildiğinde tetiklenir; navigasyonu üst bileşen üstlenir. */
  @Output() navItemSelect = new EventEmitter<PremiumNavItem>();
  @Output() search = new EventEmitter<string>();

  openDropdownId: string | null = null;
  searchOpen = false;
  mobileMenuOpen = false;
  hidden = false;

  private internalScrolled = false;
  private lastScrollTop = 0;
  private readonly routerSub: Subscription;

  constructor(
    private readonly router: Router,
    private readonly hostEl: ElementRef<HTMLElement>,
  ) {
    addIcons({ compassOutline, chevronDownOutline, searchOutline });
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.closeAll();
        this.setHidden(false);
        this.lastScrollTop = 0;
      }
    });
  }

  get isScrolled(): boolean {
    return this.scrolled ?? this.internalScrolled;
  }

  /** Mobil çekmece için alt menüleri düz bir listeye açar. */
  get flatMobileItems(): PremiumNavItem[] {
    return this.navItems.flatMap(item => (item.children?.length ? item.children : [item]));
  }

  /**
   * Aktif sayfanın `ion-content`'i kendi native shadow DOM'unda scroll yapar; bu yüzden
   * normal "scroll" event'i document'e (composed olmadığı için) hiç yansımaz. Ionic'in
   * bunun için özel olarak dışa açtığı "ionScroll" custom event'i (scrollEvents=true
   * gerektirir) dinleyerek hangi sayfa aktif olursa olsun scroll'u global olarak yakalıyoruz.
   */
  @HostListener('document:ionScroll', ['$event'])
  onIonScroll(event: Event): void {
    const detail = (event as CustomEvent<{ scrollTop: number }>).detail;
    const scrollTop = detail.scrollTop;

    if (this.scrolled === null) {
      const scrolledNext = scrollTop > 40;
      if (scrolledNext !== this.internalScrolled) this.internalScrolled = scrolledNext;
    }

    const menuOpen = this.openDropdownId !== null || this.mobileMenuOpen || this.searchOpen;
    const delta = scrollTop - this.lastScrollTop;
    if (!menuOpen && Math.abs(delta) > 4) {
      if (scrollTop <= this.headerHeight()) {
        this.setHidden(false);
      } else if (delta > 0) {
        this.setHidden(true);
      } else {
        this.setHidden(false);
      }
    }
    this.lastScrollTop = scrollTop;
  }

  /** `hidden` durumunu ve buna bağlı `ion-router-outlet` boşluğunu (styles.scss) senkron tutar. */
  private setHidden(value: boolean): void {
    if (this.hidden === value) return;
    this.hidden = value;
    document.body.classList.toggle('ph-header-hidden', value);
  }

  private headerHeight(): number {
    const raw = getComputedStyle(this.hostEl.nativeElement).getPropertyValue('--app-header-height');
    return parseFloat(raw) || 80;
  }

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

  toggleSearch(event: Event, input?: HTMLInputElement): void {
    event.stopPropagation();
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) input?.focus();
  }

  submitSearch(value: string): void {
    const query = value.trim();
    if (!query) return;
    this.search.emit(query);
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.mobileMenuOpen = !this.mobileMenuOpen;
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

  private closeAll(): void {
    this.openDropdownId = null;
    this.mobileMenuOpen = false;
    this.searchOpen = false;
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    document.body.classList.remove('ph-header-hidden');
  }
}
