import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircleOutline } from 'ionicons/icons';

interface VideoListState {
  title?: string;
  videos?: { label: string; url: string }[];
}

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './video-list.page.html',
  styleUrls: ['./video-list.page.scss'],
})
export class VideoListPage implements OnInit {
  title = '';
  videos: { label: string; url: string }[] = [];

  constructor(private readonly router: Router) {
    addIcons({ playCircleOutline });
  }

  ngOnInit() {
    const state = history.state as VideoListState;
    this.title = state?.title ?? '';
    this.videos = state?.videos ?? [];
  }

  playVideo(url: string) {
    this.router.navigate(['/watch'], { queryParams: { url } });
  }

  ytThumb(url: string): string {
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]{11})/,
    );
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
  }
}
