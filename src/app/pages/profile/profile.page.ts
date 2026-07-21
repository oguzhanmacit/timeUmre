import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline, personCircleOutline, mailOutline, sparklesOutline,
  homeOutline, documentTextOutline, mapOutline, downloadOutline, personOutline,
  giftOutline, copyOutline, checkmarkOutline, callOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  readonly user = this.auth.user;
  readonly referralCode = this.auth.referralCode;
  copied = false;

  /* ── Telefon doğrulama durumu ── */
  phone = '';
  smsCode = '';
  phoneStep = signal<'idle' | 'code'>('idle');
  phoneBusy = signal(false);
  phoneError = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toastCtrl: ToastController,
  ) {
    addIcons({
      logOutOutline, personCircleOutline, mailOutline, sparklesOutline,
      homeOutline, documentTextOutline, mapOutline, downloadOutline, personOutline,
      giftOutline, copyOutline, checkmarkOutline, callOutline, shieldCheckmarkOutline,
    });
  }

  async sendPhoneCode(): Promise<void> {
    if (!this.phone.trim()) {
      this.phoneError.set('Telefon numaranı gir.');
      return;
    }
    this.phoneBusy.set(true);
    this.phoneError.set('');
    try {
      await this.auth.startPhoneVerification(this.phone.trim(), 'pf-recaptcha');
      this.phoneStep.set('code');
    } catch (e) {
      this.phoneError.set(this.friendlyPhoneError(e));
    } finally {
      this.phoneBusy.set(false);
    }
  }

  async verifyPhoneCode(): Promise<void> {
    if (!this.smsCode.trim()) {
      this.phoneError.set('SMS ile gelen kodu gir.');
      return;
    }
    this.phoneBusy.set(true);
    this.phoneError.set('');
    try {
      await this.auth.confirmPhoneCode(this.smsCode.trim());
      this.phoneStep.set('idle');
      this.smsCode = '';
      const toast = await this.toastCtrl.create({
        message: 'Telefon numaran doğrulandı.',
        duration: 2200,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
    } catch (e) {
      this.phoneError.set(this.friendlyPhoneError(e));
    } finally {
      this.phoneBusy.set(false);
    }
  }

  changePhone(): void {
    this.auth.cancelPhoneVerification();
    this.smsCode = '';
    this.phoneError.set('');
    this.phoneStep.set('idle');
  }

  private friendlyPhoneError(e: unknown): string {
    // Ham hata, kullanıcı mesajına çevrilirken kaybolmasın (destek/teşhis için).
    console.error('[Phone] Doğrulama hatası:', e);
    const code = (e as { code?: string })?.code ?? '';
    // Bazı sunucu hataları (örn. SMS bölge politikası) SDK'da auth/internal-error
    // olarak gelir; gerçek neden yalnızca mesaj metninde bulunur.
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('SMS unable to be sent') || msg.includes('region enabled')) {
      return 'Bu ülkeye SMS gönderimi Firebase projesinde kapalı. Console > Authentication > Settings > SMS region policy bölümünden Türkiye (+90) etkinleştirilmeli.';
    }
    if (code.includes('billing-not-enabled') || msg.includes('BILLING_NOT_ENABLED')) {
      return 'SMS gönderimi için Firebase projesinde Blaze (faturalandırma) planı etkin olmalı.';
    }
    if (code.includes('invalid-app-credential') || code.includes('app-not-authorized')) {
      return 'reCAPTCHA doğrulaması reddedildi. Alan adının Firebase yetkili alan adlarında olduğundan emin olun.';
    }
    if (code.includes('credential-already-in-use') || code.includes('account-exists')) {
      return 'Bu telefon numarası zaten başka bir hesaba bağlı.';
    }
    if (code.includes('invalid-phone-number')) {
      return 'Geçersiz numara. Başında ülke koduyla dene (örn. +90 5xx xxx xx xx).';
    }
    if (code.includes('invalid-verification-code')) return 'Kod hatalı, tekrar dene.';
    if (code.includes('code-expired')) return 'Kodun süresi doldu; yeni kod iste.';
    if (code.includes('too-many-requests')) return 'Çok fazla deneme yapıldı, biraz sonra tekrar dene.';
    if (code.includes('operation-not-allowed')) return 'Telefonla doğrulama şu anda kullanılamıyor.';
    if (code.includes('captcha')) return 'Güvenlik doğrulaması başarısız oldu, tekrar dene.';
    if (code.includes('network-request-failed')) return 'İnternet bağlantısı yok.';
    return 'Doğrulama başarısız oldu, lütfen tekrar dene.';
  }

  async copyReferralCode(): Promise<void> {
    const code = this.referralCode();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Kopyalanamadı — kodu elle seçip kopyalayın.',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  async setTab(tab: string): Promise<void> {
    if (tab === 'home') { this.router.navigate(['/']); return; }
    if (tab === 'notes') { this.router.navigate(['/notlarim']); return; }
    if (tab === 'explore') { this.router.navigate(['/harita']); return; }
    if (tab === 'profile') return;
    if (tab === 'downloads') {
      const toast = await this.toastCtrl.create({
        message: 'Bu özellik yakında geliyor!',
        duration: 1800,
        position: 'bottom',
        cssClass: 'nf-toast',
        color: 'dark',
      });
      await toast.present();
    }
  }
}
