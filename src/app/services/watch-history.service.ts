import { Injectable, Signal, effect, signal } from '@angular/core';
import { collection, doc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { firestore } from './firebase-app';
import { AuthService } from './auth.service';

export interface WatchEntry {
  seconds: number;
  completed: boolean;
  updatedAt?: number;
  duration?: number;
}

/**
 * Firestore'a bağlı: `users/{uid}/watchHistory/{docId}`. `key()` ile üretilen normalize
 * anahtar ham URL içerebildiğinden (YouTube olmayan linkler) Firestore doc ID'sinde
 * yasak olan "/" karakteri `encodeURIComponent` ile temizlenir. API senkron kalır;
 * bkz. video-notes.service.ts'teki cache/optimistic-write açıklaması — aynı desen.
 */
@Injectable({ providedIn: 'root' })
export class WatchHistoryService {
  private readonly cache = signal<Record<string, WatchEntry>>({});
  readonly entries: Signal<Record<string, WatchEntry>> = this.cache.asReadonly();

  private unsubscribe: Unsubscribe | null = null;

  constructor(private readonly auth: AuthService) {
    effect(() => {
      const uid = this.auth.user()?.uid ?? null;
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.cache.set({});
      if (!uid) return;

      this.unsubscribe = onSnapshot(
        collection(firestore, 'users', uid, 'watchHistory'),
        snap => {
          const next: Record<string, WatchEntry> = {};
          snap.forEach(d => {
            next[decodeURIComponent(d.id)] = d.data() as WatchEntry;
          });
          this.cache.set(next);
        },
        e => console.warn('[WatchHistory] Dinleyici hatası:', e.code),
      );
    }, { allowSignalWrites: true });
  }

  getEntry(url: string): WatchEntry | null {
    return this.cache()[this.key(url)] ?? null;
  }

  recordSeconds(url: string, seconds: number, duration?: number): void {
    const k = this.key(url);
    const prev = this.cache()[k] ?? { seconds: 0, completed: false };
    if (seconds <= prev.seconds) return;

    const next: WatchEntry = {
      ...prev,
      seconds: Math.floor(seconds),
      updatedAt: Date.now(),
      ...(duration && duration > 0 ? { duration: Math.floor(duration) } : {}),
    };
    this.cache.update(map => ({ ...map, [k]: next }));
    this.persist(k, next);
  }

  markCompleted(url: string): void {
    const k = this.key(url);
    const next: WatchEntry = {
      seconds: this.cache()[k]?.seconds ?? 0,
      completed: true,
      updatedAt: Date.now(),
    };
    this.cache.update(map => ({ ...map, [k]: next }));
    this.persist(k, next);
  }

  private persist(key: string, entry: WatchEntry): void {
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    setDoc(doc(firestore, 'users', uid, 'watchHistory', encodeURIComponent(key)), entry).catch(e =>
      console.error('[WatchHistory] Kaydetme başarısız:', e),
    );
  }

  private key(url: string): string {
    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');
      if (host === 'youtu.be') return `yt_${u.pathname.slice(1).split('/')[0]}`;
      if (host === 'youtube.com') {
        const m = u.pathname.match(/^\/(embed|shorts)\/([^/?&]+)/);
        if (m) return `yt_${m[2]}`;
        const v = u.searchParams.get('v');
        if (v) return `yt_${v}`;
      }
    } catch {}
    return url;
  }
}
