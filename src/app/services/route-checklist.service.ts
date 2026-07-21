import { Injectable, effect, signal } from '@angular/core';
import { deleteDoc, doc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { firestore } from './firebase-app';
import { AuthService } from './auth.service';

/**
 * Firestore'a bağlı: `users/{uid}/checklists/{routeId}` → `{ state: Record<string, boolean> }`.
 * Diğer iki servisten farklı olarak abonelik tüm koleksiyona değil, yalnızca o an sorulan
 * routeId'lere lazy olarak açılır (route-detail sayfası aynı anda tek bir routeId sorar).
 * API senkron kalır; cache/optimistic-write deseni video-notes.service.ts ile aynıdır.
 */
@Injectable({ providedIn: 'root' })
export class RouteChecklistService {
  private readonly cache = signal<Record<string, Record<string, boolean>>>({});
  /** Component'ler effect() ile buna bağlanıp snapshot gelince kendini yeniler. */
  readonly states = this.cache.asReadonly();
  private readonly subscribedRoutes = new Set<string>();
  private unsubscribers: Unsubscribe[] = [];

  constructor(private readonly auth: AuthService) {
    effect(() => {
      const uid = this.auth.user()?.uid ?? null;
      this.unsubscribers.forEach(u => u());
      this.unsubscribers = [];
      this.cache.set({});
      if (!uid) return;
      // uid değişince, daha önce sorulmuş tüm route'lar yeni hesap altında yeniden dinlenir.
      for (const routeId of this.subscribedRoutes) this.subscribe(uid, routeId);
    }, { allowSignalWrites: true });
  }

  private subscribe(uid: string, routeId: string): void {
    const unsub = onSnapshot(
      doc(firestore, 'users', uid, 'checklists', routeId),
      snap => {
        const state = (snap.data()?.['state'] as Record<string, boolean>) ?? {};
        this.cache.update(map => ({ ...map, [routeId]: state }));
      },
      e => console.warn('[RouteChecklist] Dinleyici hatası:', e.code),
    );
    this.unsubscribers.push(unsub);
  }

  getChecklistState(routeId: string): Record<string, boolean> {
    if (!this.subscribedRoutes.has(routeId)) {
      this.subscribedRoutes.add(routeId);
      const uid = this.auth.user()?.uid;
      if (uid) this.subscribe(uid, routeId);
    }
    return this.cache()[routeId] ?? {};
  }

  updateChecklistItem(routeId: string, stepId: string, itemIndex: number, checked: boolean): void {
    const state = { ...this.getChecklistState(routeId), [`${stepId}:${itemIndex}`]: checked };
    this.cache.update(map => ({ ...map, [routeId]: state }));

    const uid = this.auth.user()?.uid;
    if (!uid) return;
    setDoc(doc(firestore, 'users', uid, 'checklists', routeId), { state }).catch(e =>
      console.error('[RouteChecklist] Kaydetme başarısız:', e),
    );
  }

  isChecklistItemChecked(routeId: string, stepId: string, itemIndex: number): boolean {
    return this.getChecklistState(routeId)[`${stepId}:${itemIndex}`] ?? false;
  }

  clearRouteChecklist(routeId: string): void {
    this.cache.update(map => ({ ...map, [routeId]: {} }));
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    deleteDoc(doc(firestore, 'users', uid, 'checklists', routeId)).catch(e =>
      console.error('[RouteChecklist] Silme başarısız:', e),
    );
  }
}
