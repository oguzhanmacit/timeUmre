import { Injectable } from '@angular/core';

const STORAGE_KEY = 'tu_watch_history';

export interface WatchEntry {
  seconds: number;
  completed: boolean;
  updatedAt?: number;
  duration?: number;
  dismissed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WatchHistoryService {
  private store: Record<string, WatchEntry> = {};

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.store = JSON.parse(raw);
    } catch {}
  }

  getEntry(url: string): WatchEntry | null {
    return this.store[this.key(url)] ?? null;
  }

  recordSeconds(url: string, seconds: number, duration?: number): void {
    const k = this.key(url);
    const prev = this.store[k] ?? { seconds: 0, completed: false };
    if (seconds > prev.seconds) {
      this.store[k] = {
        ...prev,
        seconds: Math.floor(seconds),
        updatedAt: Date.now(),
        ...(duration && duration > 0 ? { duration: Math.floor(duration) } : {}),
      };
      this.persist();
    }
  }

  markCompleted(url: string): void {
    const k = this.key(url);
    this.store[k] = { seconds: this.store[k]?.seconds ?? 0, completed: true, updatedAt: Date.now() };
    this.persist();
  }

  dismiss(url: string): void {
    const k = this.key(url);
    const prev = this.store[k] ?? { seconds: 0, completed: false };
    this.store[k] = { ...prev, dismissed: true };
    this.persist();
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

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {}
  }
}
