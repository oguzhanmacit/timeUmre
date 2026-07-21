import { Injectable } from '@angular/core';

export interface UmreStepItem {
  label: string;
  videoUrl?: string;
}

export interface GiderimItem {
  id: string;
  label: string;
  videoUrl?: string;
  videos?: { label: string; url: string }[];
  route?: string[];
}

export interface VideoSet {
  title: string;
  videos: { label: string; url: string }[];
}

/** Umre adımları + "nasıl giderim" içerikleri — global header ve ana sayfa (devam et listesi) arasında paylaşılan tek kaynak. */
@Injectable({ providedIn: 'root' })
export class UmreContentService {
  readonly umreItems: UmreStepItem[] = [
    { label: 'İhram', videoUrl: 'https://www.youtube.com/shorts/-zzyB2FZKpA' },
    {
      label: 'İhram Namazı-Niyet-Telbiye',
      videoUrl: 'https://www.youtube.com/shorts/GHaB3maYk_A',
    },
    {
      label: 'İhram Yasakları',
      videoUrl: 'https://www.youtube.com/watch?v=1M4EOX-uPns',
    },
    {
      label: 'Harem Bölgesine Giriş',
      videoUrl: 'https://www.youtube.com/watch?v=GhpPyRqoysI',
    },
    {
      label: 'Tavaf-Tavaf Namazı',
      videoUrl: 'https://www.youtube.com/watch?v=9cuzcnhh86k',
    },
    { label: 'Say', videoUrl: 'https://www.youtube.com/shorts/GMJoRtuNzGo' },
    {
      label: 'Tıraş Olup İhramdan Çıkış',
      videoUrl: 'https://www.youtube.com/shorts/-QOOrPt7bxo',
    },
  ];

  readonly giderimItems: GiderimItem[] = [
    {
      id: 'rota',
      label: 'Rota Rehberi',
      route: ['/umrah-routes'],
    },
    {
      id: 'vize',
      label: 'Vize',
      videos: [
        {
          label: 'Vize',
          url: 'https://www.youtube.com/watch?v=s9dvUYCZhFo&t=3s',
        },
        {
          label: 'Kapıda Vize (Alternatif)',
          url: 'https://www.youtube.com/watch?v=QVr2nPEq0V4',
        },
      ],
    },
    {
      id: 'tren',
      label: 'Hızlı Tren',
      videoUrl: 'https://www.youtube.com/watch?v=kKVuT_joVLI',
    },
    {
      id: 'nusuk',
      label: 'Ravza Randevusu (Nusuk)',
      videoUrl: 'https://www.youtube.com/watch?v=3WdFmS_vmP0',
    },
  ];

  /** video-list sayfası listeyi URL'deki ?set= anahtarından bununla çözer (deep-link/yenileme güvenli). */
  getVideoSet(key: string): VideoSet | null {
    if (key === 'umre') {
      return {
        title: 'Umre',
        videos: this.umreItems
          .filter((item) => item.videoUrl)
          .map((item) => ({ label: item.label, url: item.videoUrl! })),
      };
    }
    const item = this.giderimItems.find((g) => g.id === key);
    if (!item) return null;
    const videos =
      item.videos ??
      (item.videoUrl ? [{ label: item.label, url: item.videoUrl }] : []);
    return videos.length ? { title: item.label, videos } : null;
  }
}
