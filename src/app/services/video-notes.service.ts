import { Injectable } from '@angular/core';

export interface VideoNote {
  id: string;
  url: string;
  title: string;
  note: string;
  second: number;
  savedAt: number;
}

const STORAGE_KEY = 'tu_video_notes';

@Injectable({ providedIn: 'root' })
export class VideoNotesService {

  private load(): VideoNote[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(notes: VideoNote[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  getAll(): VideoNote[] {
    return this.load().sort((a, b) => b.savedAt - a.savedAt);
  }

  getByUrl(url: string): VideoNote[] {
    return this.load()
      .filter(n => n.url === url)
      .sort((a, b) => a.second - b.second);
  }

  saveNote(url: string, title: string, note: string, second: number): void {
    if (!note.trim()) return;
    const notes = this.load();
    notes.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      url, title, note, second, savedAt: Date.now(),
    });
    this.persist(notes);
  }

  deleteNote(id: string): void {
    this.persist(this.load().filter(n => n.id !== id));
  }
}
