import { Injectable } from '@angular/core';

const STORAGE_KEY = 'tu_playback_progress';

@Injectable({ providedIn: 'root' })
export class PlaybackProgressService {
  private store: Record<string, number> = {};

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.store = JSON.parse(raw);
    } catch {}
  }

  /** Returns saved position in seconds, or 0 if none. */
  getProgress(locationId: number, videoId: number): number {
    return this.store[`${locationId}_${videoId}`] ?? 0;
  }

  /** Saves position in seconds. */
  saveProgress(locationId: number, videoId: number, seconds: number): void {
    this.store[`${locationId}_${videoId}`] = Math.floor(seconds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {}
  }

  clearProgress(locationId: number, videoId: number): void {
    delete this.store[`${locationId}_${videoId}`];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {}
  }
}
