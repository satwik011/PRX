/**
 * The whole SQLite file lives in IndexedDB as one blob.
 *
 * A year of training is ~0.4 MB, so reading and writing the entire database is
 * cheap — and it avoids maintaining a second schema in IndexedDB object stores.
 */
const DB_NAME = 'prx-storage';
const STORE = 'sqlite';
const KEY = 'prx.db';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSnapshot(): Promise<Uint8Array | null> {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const request = idb.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value instanceof Uint8Array ? value : value ? new Uint8Array(value) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSnapshot(bytes: Uint8Array): Promise<void> {
  const idb = await open();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(bytes, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
