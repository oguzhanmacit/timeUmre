import { Injectable } from '@angular/core';
import * as L from 'leaflet';

const DB_NAME    = 'TimeUmreMapCache';
const DB_VERSION = 1;
const TILE_STORE = 'tiles';
const MAX_BYTES  = 50 * 1024 * 1024; // 50 MB

// Mekke kutsal alanları bounding box (~10×10 km)
const MECCA_BOUNDS = {
  minLat: 21.37, maxLat: 21.47,
  minLng: 39.78, maxLng: 39.88,
};
const ZOOM_LEVELS = [13, 14, 15, 16, 17];
const SUBS = ['a', 'b', 'c'];

interface TileRecord {
  url:       string;
  data:      ArrayBuffer;
  size:      number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class MapCacheService {
  private db:       IDBDatabase | null = null;
  private usedBytes = 0;
  isPreloading      = false;

  async init(): Promise<void> {
    this.db        = await this.openDb();
    this.usedBytes = await this.calcUsedBytes();
  }

  // ── Public API ───────────────────────────────────────────

  /** Tile'ı IndexedDB'den al; yoksa ağdan fetch edip kaydet. */
  async getTile(url: string): Promise<Blob | null> {
    if (!this.db) return null;
    const key = this.normalize(url);

    const hit = await this.getRecord(key);
    if (hit) return new Blob([hit.data], { type: 'image/png' });

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      await this.save(key, buf);
      return new Blob([buf], { type: 'image/png' });
    } catch {
      return null;
    }
  }

  /**
   * Mekke bölgesi tile'larını arka planda indir (zoom 13–17).
   * @param onProgress 0–100 arası yüzde callback'i
   */
  async preloadMecca(onProgress?: (pct: number) => void): Promise<void> {
    if (!this.db || this.isPreloading) return;
    this.isPreloading = true;

    const urls  = this.buildUrls();
    const BATCH = 4; // eş zamanlı istek limiti
    let   done  = 0;

    for (let i = 0; i < urls.length; i += BATCH) {
      await Promise.all(
        urls.slice(i, i + BATCH).map(async url => {
          if (this.usedBytes >= MAX_BYTES) await this.evictOldest();
          const key = this.normalize(url);
          if (!(await this.getRecord(key))) {
            try {
              const res = await fetch(url);
              if (res.ok) await this.save(key, await res.arrayBuffer());
            } catch { /* offline — atla */ }
          }
          onProgress?.(Math.round((++done / urls.length) * 100));
        })
      );
    }

    this.isPreloading = false;
  }

  /** Kullanılan cache boyutu (MB). */
  get sizeMB(): string { return (this.usedBytes / 1024 / 1024).toFixed(1); }

  /** Maksimum cache boyutu (MB). */
  get maxMB(): number { return MAX_BYTES / 1024 / 1024; }

  /** Tüm cache'i sil. */
  async clear(): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(TILE_STORE, 'readwrite');
    tx.objectStore(TILE_STORE).clear();
    await this.txDone(tx);
    this.usedBytes = 0;
  }

  /**
   * Cache destekli Leaflet TileLayer döner.
   * L.tileLayer(...) yerine bunu kullan.
   */
  createLayer(urlTemplate: string, options?: L.TileLayerOptions): L.TileLayer {
    const svc = this;

    class CachedLayer extends L.TileLayer {
      override createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
        const img = document.createElement('img');
        img.alt   = '';
        const url = this.getTileUrl(coords);

        svc.getTile(url)
          .then(blob => {
            if (blob) {
              // Cache hit: blob URL → revokeObjectURL sonrası temizle
              const blobUrl = URL.createObjectURL(blob);
              img.onload  = () => { URL.revokeObjectURL(blobUrl); done(undefined, img); };
              img.onerror = () => done(new Error('tile'), img);
              img.src = blobUrl;
            } else {
              // Cache miss (offline veya hata): doğrudan ağ URL'i
              img.onload  = () => done(undefined, img);
              img.onerror = () => done(new Error('tile'), img);
              img.src = url;
            }
          })
          .catch(() => {
            img.onload  = () => done(undefined, img);
            img.onerror = () => done(new Error('tile'), img);
            img.src = url;
          });

        return img;
      }
    }

    return new CachedLayer(urlTemplate, options);
  }

  // ── Private ──────────────────────────────────────────────

  /** Mekke bounding box için tüm tile URL'lerini üretir. */
  private buildUrls(): string[] {
    const urls: string[] = [];
    for (const z of ZOOM_LEVELS) {
      const [xA, yA] = this.toTile(MECCA_BOUNDS.minLat, MECCA_BOUNDS.minLng, z);
      const [xB, yB] = this.toTile(MECCA_BOUNDS.maxLat, MECCA_BOUNDS.maxLng, z);
      const x0 = Math.min(xA, xB), x1 = Math.max(xA, xB);
      const y0 = Math.min(yA, yB), y1 = Math.max(yA, yB);
      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          const s = SUBS[(x + y) % SUBS.length];
          urls.push(`https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
        }
      }
    }
    return urls;
  }

  /** Lat/Lng → Slippy Map tile (x, y) */
  private toTile(lat: number, lng: number, z: number): [number, number] {
    const n = 2 ** z;
    const x = Math.floor((lng + 180) / 360 * n);
    const r = (lat * Math.PI) / 180;
    const y = Math.floor(
      (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n
    );
    return [x, y];
  }

  /** a/b/c subdomain'i normalize et → aynı tile için tek cache kaydı. */
  private normalize(url: string): string {
    return url.replace(
      /https:\/\/[abc]\.tile\.openstreetmap/,
      'https://a.tile.openstreetmap'
    );
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(TILE_STORE)) {
          const store = db.createObjectStore(TILE_STORE, { keyPath: 'url' });
          store.createIndex('ts', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  private getRecord(url: string): Promise<TileRecord | null> {
    return new Promise(resolve => {
      const req = this.db!
        .transaction(TILE_STORE, 'readonly')
        .objectStore(TILE_STORE)
        .get(url);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  }

  private async save(url: string, data: ArrayBuffer): Promise<void> {
    if (!this.db) return;
    const rec: TileRecord = { url, data, size: data.byteLength, timestamp: Date.now() };
    const tx = this.db.transaction(TILE_STORE, 'readwrite');
    tx.objectStore(TILE_STORE).put(rec);
    await this.txDone(tx);
    this.usedBytes += data.byteLength;
  }

  /** En eski tile'ı sil (LRU eviction). */
  private evictOldest(): Promise<void> {
    return new Promise(resolve => {
      const req = this.db!
        .transaction(TILE_STORE, 'readwrite')
        .objectStore(TILE_STORE)
        .index('ts')
        .openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          this.usedBytes -= (cursor.value as TileRecord).size;
          cursor.delete();
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  }

  private calcUsedBytes(): Promise<number> {
    return new Promise(resolve => {
      const req = this.db!
        .transaction(TILE_STORE, 'readonly')
        .objectStore(TILE_STORE)
        .getAll();
      req.onsuccess = () =>
        resolve((req.result as TileRecord[]).reduce((s, r) => s + r.size, 0));
      req.onerror = () => resolve(0);
    });
  }

  private txDone(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }
}
