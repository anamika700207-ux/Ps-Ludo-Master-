// IndexedDB Storage Engine for Custom Player Audio Files
// Allows persistent offline storage of MP3, WAV, M4A, AAC, and other audio files
// without the strict 5MB limitation of localStorage.

export interface CustomTrack {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // MIME type e.g. 'audio/mpeg'
  duration?: number; // estimated or probed duration in seconds
  addedAt: number; // timestamp
  blob: Blob;
}

const DB_NAME = 'ps_ludo_custom_music_db';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('addedAt', 'addedAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });
}

/**
 * Retrieves all saved custom music tracks ordered by addition date
 */
export async function getAllCustomTracks(): Promise<CustomTrack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const tracks = (request.result as CustomTrack[]) || [];
        // Sort descending by addedAt
        tracks.sort((a, b) => b.addedAt - a.addedAt);
        resolve(tracks);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch tracks.'));
      };
    });
  } catch (err) {
    console.error('Error fetching custom tracks:', err);
    return [];
  }
}

/**
 * Saves a new custom music track into IndexedDB
 */
export async function saveCustomTrack(track: CustomTrack): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(track);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save track.'));
    };
  });
}

/**
 * Deletes a track by ID from IndexedDB
 */
export async function deleteCustomTrack(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to delete track.'));
    };
  });
}

/**
 * Clears all tracks from IndexedDB
 */
export async function clearAllCustomTracks(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to clear tracks.'));
    };
  });
}

/**
 * Probes audio file duration by creating a temporary Audio element
 */
export function probeAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tempAudio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      tempAudio.src = objectUrl;

      const cleanup = () => {
        tempAudio.removeEventListener('loadedmetadata', onLoaded);
        tempAudio.removeEventListener('error', onError);
        URL.revokeObjectURL(objectUrl);
      };

      const onLoaded = () => {
        const dur = tempAudio.duration && isFinite(tempAudio.duration) ? tempAudio.duration : 0;
        cleanup();
        resolve(dur);
      };

      const onError = () => {
        cleanup();
        resolve(0);
      };

      tempAudio.addEventListener('loadedmetadata', onLoaded);
      tempAudio.addEventListener('error', onError);

      // Timeout fallback in case metadata doesn't fire
      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 4000);
    } catch {
      resolve(0);
    }
  });
}

/**
 * Format bytes into human readable KB / MB
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
