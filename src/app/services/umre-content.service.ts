import { Injectable } from '@angular/core';

export interface UmreStepItem {
  label: string;
  videoUrl?: string;
}

export interface GiderimItem {
  label: string;
  videoUrl?: string;
  videos?: { label: string; url: string }[];
  route?: string[];
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
      label: 'Adım Adım Rota Rehberi',
      route: ['/umrah-routes'],
    },
    {
      label: 'Vize İşlemleri',
      videos: [
        {
          label: 'Vize İşlemleri',
          url: 'https://www.youtube.com/watch?v=s9dvUYCZhFo&t=3s',
        },
        {
          label: 'Kapıda Vize (Alternatif)',
          url: 'https://www.youtube.com/watch?v=QVr2nPEq0V4',
        },
      ],
    },
    {
      label: 'Hızlı Tren İşlemleri',
      videoUrl: 'https://www.youtube.com/watch?v=kKVuT_joVLI',
    },
    {
      label: 'Nusuk Uygulaması (Ravza Randevusu)',
      videoUrl: 'https://www.youtube.com/watch?v=3WdFmS_vmP0',
    },
  ];
}
