import { Injectable, signal } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  Auth,
  User,
  ConfirmationResult,
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPhoneNumber,
  EmailAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { firebaseApp, firestore } from './firebase-app';
import { environment } from '../../environments/environment';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  /** SMS ile doğrulanıp hesaba bağlanan numara (E.164, örn. +905xx...); yoksa null. */
  phoneNumber: string | null;
}

/**
 * Uygulama genelinde tek auth kaynağı. Kod tabanında daha önce hiç signal/BehaviorSubject
 * kullanılmadığından (grep ile doğrulandı) Angular 17'nin native signal()'ı tercih edildi —
 * component'ler ekstra RxJS aboneliği olmadan doğrudan `authService.user()` okuyabilir.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth: Auth = getAuth(firebaseApp);

  readonly user = signal<AppUser | null>(null);
  /** İlk auth state çözülene kadar true — guard'lar ve header bu bayrağı bekler. */
  readonly authReady = signal(false);
  /** Kalıcı hesabı (e-posta/Google) olan kullanıcının referans kodu; misafirde null. */
  readonly referralCode = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, async fbUser => {
      // Hiç oturum yoksa otomatik anonim girişe DÜŞÜLMEZ: authGuard kullanıcıyı
      // /auth/login'e yönlendirir ve misafir girişi orada bilinçli bir seçenek
      // olarak sunulur. Mevcut (kalıcı ya da anonim) oturumlar aynen devam eder.
      if (!fbUser) {
        this.user.set(null);
        this.authReady.set(true);
        return;
      }
      this.user.set(this.toAppUser(fbUser));
      this.authReady.set(true);
      this.ensureUserDoc(fbUser);
    });
  }

  /**
   * Hesap simgelerinin ortak hedefi (header ve alt nav): kalıcı hesap profil
   * sayfasına, misafir (anonim) veya oturumsuz kullanıcı giriş ekranına gider.
   */
  get accountRoute(): string {
    const u = this.user();
    return u && !u.isAnonymous ? '/profile' : '/auth/login';
  }

  private toAppUser(u: User): AppUser {
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      isAnonymous: u.isAnonymous,
      phoneNumber: u.phoneNumber,
    };
  }

  /**
   * Her girişte profil alanlarını günceller; doc hiç yoksa createdAt de eklenir.
   * Kalıcı hesaplara (e-posta/Google) ilk seferde bir referans kodu üretilir;
   * mevcutsa aynen korunur.
   */
  private async ensureUserDoc(u: User): Promise<void> {
    const ref = doc(firestore, 'users', u.uid);
    const existing = await getDoc(ref);
    const existingCode = (existing.data()?.['referralCode'] as string | undefined) ?? null;
    const referralCode = u.isAnonymous ? null : existingCode ?? this.generateReferralCode();

    await setDoc(
      ref,
      {
        displayName: u.displayName ?? null,
        email: u.email ?? null,
        photoURL: u.photoURL ?? null,
        phoneNumber: u.phoneNumber ?? null,
        isAnonymous: u.isAnonymous,
        updatedAt: serverTimestamp(),
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        ...(referralCode && referralCode !== existingCode ? { referralCode } : {}),
      },
      { merge: true },
    );
    this.referralCode.set(referralCode);
  }

  /** Karıştırılabilir karakterler (0/O, 1/I/L) hariç 6 haneli kod, örn. UMR-X7K9Q2 */
  private generateReferralCode(): string {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    const rand = new Uint32Array(6);
    crypto.getRandomValues(rand);
    for (let i = 0; i < 6; i++) code += alphabet[rand[i] % alphabet.length];
    return `UMR-${code}`;
  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName });
    await setDoc(
      doc(firestore, 'users', cred.user.uid),
      { displayName, email, isAnonymous: false, createdAt: serverTimestamp() },
      { merge: true },
    );
    this.user.set(this.toAppUser(cred.user));
  }

  // Not: login metodları user sinyalini beklemeden hemen set eder; onAuthStateChanged
  // asenkron tetiklendiğinden, girişten hemen sonraki navigate() sırasında guard'ın
  // user()'ı hâlâ null görüp login'e geri atması (yarış durumu) böylece önlenir.
  async loginWithEmail(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this.user.set(this.toAppUser(cred.user));
  }

  async loginWithGoogle(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Native (Android) akış: @capacitor-firebase/authentication tarayıcı yerine
      // sistem hesap seçiciyi açar, dönen idToken ile JS SDK auth state'i güncellenir.
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) throw new Error('Google girişinden token alınamadı.');
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(this.auth, credential);
      this.user.set(this.toAppUser(cred.user));
    } else {
      const cred = await signInWithPopup(this.auth, new GoogleAuthProvider());
      this.user.set(this.toAppUser(cred.user));
    }
  }

  async loginAsGuest(): Promise<void> {
    const cred = await signInAnonymously(this.auth);
    this.user.set(this.toAppUser(cred.user));
  }

  /** Misafir (anonim) hesabı e-posta/şifre ile kalıcı hesaba dönüştürür; uid ve tüm veri korunur. */
  async linkGuestToEmail(email: string, password: string, displayName: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current || !current.isAnonymous) {
      throw new Error('Bağlanacak bir misafir oturumu yok.');
    }
    const credential = EmailAuthProvider.credential(email, password);
    const linked = await linkWithCredential(current, credential);
    await updateProfile(linked.user, { displayName });
    await setDoc(
      doc(firestore, 'users', linked.user.uid),
      { displayName, email, isAnonymous: false },
      { merge: true },
    );
    this.user.set(this.toAppUser(linked.user));
    // Linkleme aynı uid'de kaldığından onAuthStateChanged tetiklenmez;
    // referans kodu üretimi için doc senkronu burada elle çağrılır.
    await this.ensureUserDoc(linked.user);
  }

  /* ── Telefon doğrulama (isteğe bağlı) ─────────────────────────────────────
     Numara mevcut hesaba "link" edilir; Firebase bir telefon numarasını yalnızca
     TEK hesaba bağlamaya izin verdiğinden (credential-already-in-use hatası),
     doğrulanmış bir numarayla ikinci bir hesap açılamaz. */

  private pendingConfirmation: ConfirmationResult | null = null;
  private pendingVerificationId: string | null = null;
  private recaptcha: RecaptchaVerifier | null = null;

  /**
   * SMS kodu gönderir. Web'de Firebase görünmez reCAPTCHA zorunlu kıldığından
   * `recaptchaContainerId` ile boş bir div'in id'si verilir; native'de (Android)
   * reCAPTCHA gerekmez, kod @capacitor-firebase/authentication ile gönderilir.
   */
  async startPhoneVerification(rawPhone: string, recaptchaContainerId: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current) throw new Error('Önce oturum açılmalı.');
    const phone = this.normalizePhone(rawPhone);
    this.cancelPhoneVerification();

    if (Capacitor.isNativePlatform()) {
      this.pendingVerificationId = await new Promise<string>((resolve, reject) => {
        let handle: PluginListenerHandle | undefined;
        FirebaseAuthentication.addListener('phoneCodeSent', ev => {
          handle?.remove();
          resolve(ev.verificationId);
        }).then(h => (handle = h));
        FirebaseAuthentication.linkWithPhoneNumber({ phoneNumber: phone }).catch(err => {
          handle?.remove();
          reject(err);
        });
      });
    } else {
      // grecaptcha aynı elemente ikinci kez render edilemez ("reCAPTCHA has already
      // been rendered in this element"); başarısız denemeden sonra tekrar kod
      // istenebilmesi için her seferinde konteynerin içine taze bir div açılır.
      // Firebase arka ucu localhost'tan gelen gerçek reCAPTCHA jetonlarını kabul
      // etmeyebiliyor (auth/invalid-app-credential; firebase-js-sdk#8387). Resmî
      // lokal geliştirme yolu: doğrulayıcıyı test modunda baypas etmek — bu modda
      // YALNIZCA Console'da tanımlı test numaraları (Authentication > Sign-in
      // method > Phone > Phone numbers for testing) çalışır. Prod derlemede kapalı.
      if (!environment.production) {
        this.auth.settings.appVerificationDisabledForTesting = true;
      }
      const container = document.getElementById(recaptchaContainerId);
      if (!container) throw new Error(`reCAPTCHA konteyneri bulunamadı: #${recaptchaContainerId}`);
      container.innerHTML = '';
      const slot = document.createElement('div');
      container.appendChild(slot);
      // Görünür (normal) widget kullanılır: invisible modda jeton arka planda erken
      // üretilip istek anında geçersiz düşebiliyor (auth/invalid-app-credential);
      // görünür kutuda jeton kullanıcı çözdüğü anda üretilir ve hemen gönderilir.
      this.recaptcha = new RecaptchaVerifier(this.auth, slot, { size: 'normal', theme: 'dark' });
      this.pendingConfirmation = await linkWithPhoneNumber(current, phone, this.recaptcha);
      container.innerHTML = ''; // jeton alındı; çözülen widget artık gereksiz
    }
  }

  /** SMS ile gelen kodu doğrular ve numarayı hesaba bağlar. */
  async confirmPhoneCode(code: string): Promise<void> {
    const current = this.auth.currentUser;
    if (!current) throw new Error('Önce oturum açılmalı.');

    if (this.pendingConfirmation) {
      await this.pendingConfirmation.confirm(code);
    } else if (this.pendingVerificationId) {
      const credential = PhoneAuthProvider.credential(this.pendingVerificationId, code);
      await linkWithCredential(current, credential);
    } else {
      throw new Error('Önce SMS kodu istenmeli.');
    }
    this.cancelPhoneVerification();

    // Linkleme aynı uid'de kaldığından onAuthStateChanged tetiklenmez; signal ve
    // Firestore doc'u elle senkronlanır.
    const updated = this.auth.currentUser ?? current;
    this.user.set(this.toAppUser(updated));
    await setDoc(
      doc(firestore, 'users', updated.uid),
      { phoneNumber: updated.phoneNumber ?? null, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  /** Bekleyen doğrulamayı ve reCAPTCHA'yı temizler (numara değiştirme / vazgeçme). */
  cancelPhoneVerification(): void {
    this.pendingConfirmation = null;
    this.pendingVerificationId = null;
    try {
      this.recaptcha?.clear();
    } catch {
      // Widget render aşamasında hata almışsa clear() da fırlatabilir; yok sayılır.
    }
    this.recaptcha = null;
  }

  /** Kullanıcı girişini E.164'e çevirir; ülke kodu yoksa Türkiye (+90) varsayılır. */
  private normalizePhone(raw: string): string {
    const cleaned = raw.replace(/[\s().-]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return `+9${cleaned}`; // 05xx... → +905xx...
    if (cleaned.startsWith('5')) return `+90${cleaned}`; // 5xx... → +905xx...
    return `+${cleaned}`;
  }

  async logout(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await signOut(this.auth);
  }
}
