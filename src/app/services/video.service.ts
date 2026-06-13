import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type VideoType = 'youtube' | 'local' | 'unknown';

export interface VideoInfo {
  type:       VideoType;
  embedUrl:   string;
  originalUrl: string;
}

/** YouTube video ID formatı: sadece harf, rakam, tire, alt çizgi */
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]+$/;

@Injectable({ providedIn: 'root' })
export class VideoService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Güvenli iframe src döner.
   * - Video ID'yi regex ile doğrular (enjeksiyon önlemi)
   * - URL'yi servis içinde oluşturur, kullanıcı girdisi doğrudan geçmez
   * - bypassSecurityTrustResourceUrl tek bir yerde çağrılır
   */
  getSafeEmbedUrl(url: string, autoplay = false, startTime = 0): SafeResourceUrl | null {
    const id = this.extractYoutubeId(url);
    if (!id || !YOUTUBE_ID_RE.test(id)) return null;
    // If no explicit startTime, extract from the URL's t parameter (e.g. &t=81s)
    if (startTime === 0) startTime = this.extractTimestamp(url);
    let src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`;
    if (autoplay) src += '&autoplay=1';
    if (startTime > 0) src += `&start=${Math.floor(startTime)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  private extractTimestamp(url: string): number {
    try {
      const t = new URL(url).searchParams.get('t');
      if (!t) return 0;
      // Formats: "81s", "1m21s", "1h2m3s", "81"
      const h = t.match(/(\d+)h/);
      const m = t.match(/(\d+)m/);
      const s = t.match(/(\d+)s/);
      if (h || m || s) {
        return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0) + (s ? +s[1] : 0);
      }
      return +t || 0;
    } catch { return 0; }
  }

  /** URL'den VideoInfo üretir. Tanınamayan URL'lerde type='unknown' döner. */
  resolve(url: string): VideoInfo {
    const youtubeId = this.extractYoutubeId(url);
    if (youtubeId) {
      return {
        type:        'youtube',
        embedUrl:    `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
        originalUrl: url,
      };
    }

    if (this.isLocalVideo(url)) {
      return { type: 'local', embedUrl: url, originalUrl: url };
    }

    return { type: 'unknown', embedUrl: url, originalUrl: url };
  }

  /** Geçerli bir embed URL'i döner; tanınamazsa null. */
  getEmbedUrl(url: string): string | null {
    const info = this.resolve(url);
    return info.type !== 'unknown' ? info.embedUrl : null;
  }

  /** YouTube küçük resim URL'i döner; YouTube URL değilse null. */
  getYoutubeThumbnail(url: string, quality: 'default' | 'hq' | 'max' = 'hq'): string | null {
    const id = this.extractYoutubeId(url);
    if (!id) return null;
    const q = quality === 'hq' ? 'hqdefault' : quality === 'max' ? 'maxresdefault' : 'default';
    return `https://img.youtube.com/vi/${id}/${q}.jpg`;
  }

  /** URL'nin video içeriği olup olmadığını kontrol eder. */
  isVideo(url: string): boolean {
    return this.resolve(url).type !== 'unknown';
  }

  // ── Private ──────────────────────────────────────────────

  /**
   * Desteklenen YouTube formatları:
   *   https://www.youtube.com/watch?v=ID
   *   https://youtube.com/watch?v=ID
   *   https://youtu.be/ID
   *   https://www.youtube.com/embed/ID   (zaten embed, ID ayıklanır)
   *   https://www.youtube.com/shorts/ID
   */
  private extractYoutubeId(url: string): string | null {
    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');

      if (host === 'youtu.be') {
        return u.pathname.slice(1) || null;
      }

      if (host === 'youtube.com') {
        // /embed/ID veya /shorts/ID
        const match = u.pathname.match(/^\/(embed|shorts)\/([^/?&]+)/);
        if (match) return match[2];
        // /watch?v=ID
        return u.searchParams.get('v');
      }
    } catch {
      // geçersiz URL — aşağıda null döner
    }
    return null;
  }

  /** Yerel video dosyası (mp4, webm, ogg, mov) */
  private isLocalVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }
}
