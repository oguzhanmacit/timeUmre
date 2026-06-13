import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Geolocation } from '@capacitor/geolocation';
import { UmreLocation, UserPosition } from '../models/location.model';

const STORAGE_KEY = 'tu_locations_cache';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly locationsUrl = 'assets/data/locations.json';
  private memoryCache: UmreLocation[] | null = null;

  constructor(private http: HttpClient) {}

  getLocations(): Observable<UmreLocation[]> {
    if (this.memoryCache) return of(this.memoryCache);

    return this.http.get<UmreLocation[]>(this.locationsUrl).pipe(
      tap(data => {
        this.memoryCache = data;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
      }),
      catchError(() => {
        // SW cache atlandıysa localStorage'dan oku
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const data = JSON.parse(stored) as UmreLocation[];
            this.memoryCache = data;
            return of(data);
          }
        } catch {}
        return of([]);
      }),
    );
  }

  async getUserPosition(): Promise<UserPosition> {
    const permission = await Geolocation.requestPermissions();
    if (permission.location !== 'granted') {
      throw new Error('Konum izni verilmedi');
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }

  async watchUserPosition(onUpdate: (pos: UserPosition) => void): Promise<string> {
    const permission = await Geolocation.requestPermissions();
    if (permission.location !== 'granted') {
      throw new Error('Konum izni verilmedi');
    }
    return Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (pos) => {
        if (pos) onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
    );
  }

  async stopWatchingPosition(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
  }

  async getNearbyLocations(radiusMeters = 500): Promise<UmreLocation[]> {
    const [userPos, locations] = await Promise.all([
      this.getUserPosition(),
      firstValueFrom(this.getLocations()),
    ]);
    return locations.filter(loc =>
      this.haversineDistance(userPos.lat, userPos.lng, loc.lat, loc.lng) <= radiusMeters
    );
  }

  distanceBetween(from: UserPosition, to: UmreLocation): number {
    return this.haversineDistance(from.lat, from.lng, to.lat, to.lng);
  }

  formatDistance(meters: number): string {
    return meters < 1000
      ? `${Math.round(meters)} m`
      : `${(meters / 1000).toFixed(1)} km`;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
