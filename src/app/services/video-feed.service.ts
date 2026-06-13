import { Injectable } from '@angular/core';

export interface FeedVideo {
  title: string;
  imageUrl: string;
  url: string;
  duration?: string;
}

@Injectable({ providedIn: 'root' })
export class VideoFeedService {
  videos: FeedVideo[] = [];
}
