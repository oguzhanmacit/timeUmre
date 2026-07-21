import { Injectable, Signal, effect, signal } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './firebase-app';
import { AuthService } from './auth.service';

export interface VideoNote {
  id: string;
  url: string;
  title: string;
  note: string;
  second: number;
  savedAt: number;
}

/**
 * Firestore'a bağlı: `users/{uid}/notes/{noteId}`. Mevcut senkron API (getAll/getByUrl/
 * saveNote/deleteNote) korunur — okuma bir in-memory cache'ten yapılır, cache Firestore
 * onSnapshot ile arka planda güncel tutulur. Yazma optimistic: cache anında güncellenir,
 * Firestore yazımı arkada beklenmeden yapılır (localStorage'daki "anlık" his korunur).
 */
@Injectable({ providedIn: 'root' })
export class VideoNotesService {
  private readonly cache = signal<VideoNote[]>([]);
  /** Component'ler `effect()` ile buna abone olup kendi `load()`'unu tekrar tetikleyebilir. */
  readonly notes: Signal<VideoNote[]> = this.cache.asReadonly();

  private unsubscribe: Unsubscribe | null = null;

  constructor(private readonly auth: AuthService) {
    effect(() => {
      const uid = this.auth.user()?.uid ?? null;
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.cache.set([]);
      if (!uid) return;

      this.unsubscribe = onSnapshot(
        collection(firestore, 'users', uid, 'notes'),
        snap => {
          this.cache.set(
            snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<VideoNote, 'id'>) })),
          );
        },
        // Oturum geçişlerinde (logout/link) eski dinleyici yetkisiz kalıp hata
        // fırlatabilir; dinleyici zaten hemen kapatıldığından sessizce loglanır.
        e => console.warn('[VideoNotes] Dinleyici hatası:', e.code),
      );
    }, { allowSignalWrites: true });
  }

  getAll(): VideoNote[] {
    return [...this.cache()].sort((a, b) => b.savedAt - a.savedAt);
  }

  getByUrl(url: string): VideoNote[] {
    return this.cache()
      .filter(n => n.url === url)
      .sort((a, b) => a.second - b.second);
  }

  saveNote(url: string, title: string, note: string, second: number): void {
    if (!note.trim()) return;
    const uid = this.auth.user()?.uid;
    if (!uid) return;

    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const entry: VideoNote = { id, url, title, note, second, savedAt: Date.now() };
    this.cache.update(list => [...list, entry]);

    setDoc(doc(firestore, 'users', uid, 'notes', id), {
      url,
      title,
      note,
      second,
      savedAt: entry.savedAt,
      createdAt: serverTimestamp(),
    }).catch(e => console.error('[VideoNotes] Kaydetme başarısız:', e));
  }

  deleteNote(id: string): void {
    const uid = this.auth.user()?.uid;
    this.cache.update(list => list.filter(n => n.id !== id));
    if (!uid) return;
    deleteDoc(doc(firestore, 'users', uid, 'notes', id)).catch(e =>
      console.error('[VideoNotes] Silme başarısız:', e),
    );
  }
}
