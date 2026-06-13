import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

@Injectable({ providedIn: 'root' })
export class PrayerTimeService {
  constructor(private http: HttpClient) {}

  getMeccaTimes(): Observable<PrayerTimes | null> {
    const url =
      'https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=SA&method=4';
    return this.http.get<any>(url).pipe(
      map((res) => res?.data?.timings as PrayerTimes),
      catchError(() => of(null)),
    );
  }
}
