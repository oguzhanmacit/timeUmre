import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    addIcons({ logoGoogle, mailOutline, lockClosedOutline, personOutline });
  }

  async loginWithEmail(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.errorMsg.set('E-posta ve şifre gerekli.');
      return;
    }
    await this.run(() => this.auth.loginWithEmail(this.email.trim(), this.password));
  }

  async loginWithGoogle(): Promise<void> {
    await this.run(() => this.auth.loginWithGoogle());
  }

  /** Bilinçli misafir girişi: anonim oturum açılır, veriler auth.uid altında tutulur. */
  async continueAsGuest(): Promise<void> {
    await this.run(() => this.auth.loginAsGuest());
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await fn();
      this.router.navigate(['/']);
    } catch (e) {
      this.errorMsg.set(this.friendlyError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private friendlyError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
      return 'E-posta veya şifre hatalı.';
    }
    if (code.includes('too-many-requests')) return 'Çok fazla deneme yapıldı, biraz sonra tekrar deneyin.';
    if (code.includes('network-request-failed')) return 'İnternet bağlantısı yok.';
    return 'Giriş yapılamadı, lütfen tekrar deneyin.';
  }
}
