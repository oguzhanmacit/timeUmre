import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    addIcons({ personCircleOutline, mailOutline, lockClosedOutline });
  }

  async register(): Promise<void> {
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMsg.set('Tüm alanları doldurun.');
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg.set('Şifre en az 6 karakter olmalı.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      // Misafir (anonim) oturum açıkken kayıt olunursa linkGuestToEmail ile mevcut
      // uid (ve altındaki notlar/geçmiş/checklist) korunur; hiç oturum yoksa
      // (ilk girişteki login ekranından gelindiyse) sıfırdan hesap açılır.
      if (this.auth.user()?.isAnonymous) {
        await this.auth.linkGuestToEmail(this.email.trim(), this.password, this.name.trim());
      } else {
        await this.auth.registerWithEmail(this.email.trim(), this.password, this.name.trim());
      }
      this.router.navigate(['/']);
    } catch (e) {
      this.errorMsg.set(this.friendlyError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private friendlyError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('email-already-in-use')) return 'Bu e-posta zaten kayıtlı.';
    if (code.includes('invalid-email')) return 'Geçersiz e-posta adresi.';
    if (code.includes('weak-password')) return 'Şifre çok zayıf.';
    if (code.includes('network-request-failed')) return 'İnternet bağlantısı yok.';
    return 'Kayıt olunamadı, lütfen tekrar deneyin.';
  }
}
