import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

/**
 * Tek Firebase app instance'ı — auth.service.ts ve veri servisleri (video-notes,
 * watch-history, route-checklist) bunu paylaşır. HMR/çoklu import'ta yeniden
 * initialize etmemek için getApps() kontrolü yapılır.
 */
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(environment.firebaseConfig);

/**
 * - experimentalAutoDetectLongPolling: Android WebView (Capacitor) Firestore'un
 *   varsayılan WebChannel akışını çoğu cihazda yutar; otomatik long-polling
 *   tespiti hem WebView'da hem web'de güvenli çalışır.
 * - persistentLocalCache: notlar/izleme geçmişi/checklist çevrimdışı da okunup
 *   yazılabilsin (umre sırasında zayıf bağlantı senaryosu); yazmalar bağlantı
 *   gelince otomatik senkronlanır. Çoklu sekme yöneticisi web'de ikinci sekmenin
 *   hata almasını önler.
 */
export const firestore: Firestore = (() => {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // HMR/çift import: Firestore bu app için zaten başlatılmış — mevcut instance kullanılır.
    return getFirestore(firebaseApp);
  }
})();

if (environment.firebaseConfig.apiKey === 'REPLACE_ME') {
  console.warn(
    '[Firebase] environment.ts içindeki firebaseConfig hâlâ placeholder değerlerle duruyor. ' +
      'Auth/Firestore çağrıları başarısız olacaktır. Firebase Console > Project settings\'ten ' +
      'gerçek config değerlerini src/environments/environment.ts ve environment.prod.ts dosyalarına girin.',
  );
}
