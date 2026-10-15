// IndexedDB based Audio Cache for storing synthesized audio Blobs

const DB_NAME = 'bela_furabar_tts_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';

class AudioCacheManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache = new Map<string, Blob>();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  public async getAudio(chapterId: number, voice: string): Promise<Blob | null> {
    const key = `ch_${chapterId}_voice_${voice}`;
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result instanceof Blob) {
            this.memoryCache.set(key, req.result);
            resolve(req.result);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async saveAudio(chapterId: number, voice: string, blob: Blob): Promise<void> {
    const key = `ch_${chapterId}_voice_${voice}`;
    this.memoryCache.set(key, blob);

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, key);
    } catch (e) {
      console.warn('Failed to persist audio blob to IndexedDB:', e);
    }
  }
}

export const audioCache = new AudioCacheManager();
