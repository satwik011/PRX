import { drizzle, type SQLJsDatabase } from 'drizzle-orm/sql-js';
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';

import * as schema from './schema';
import { loadSnapshot, saveSnapshot } from './persist.web';

/**
 * Web database. Metro resolves this over client.ts when bundling for web.
 *
 * sql.js is SQLite compiled to single-threaded WASM, so unlike expo-sqlite's web
 * build it needs no SharedArrayBuffer and therefore no cross-origin isolation —
 * no COOP/COEP headers on the dev server or the host, and it works in Safari.
 *
 * The trade is that the database lives in memory and is persisted by writing the
 * whole file to IndexedDB. At this data size that is a rounding error.
 */

type Drizzle = SQLJsDatabase<typeof schema>;

let instance: Drizzle | null = null;
let raw: SqlJsDatabase | null = null;

/**
 * Repo modules import `db` at module scope but only call it inside async
 * functions, so a proxy lets initialisation stay async without changing a single
 * call site. Touching it before init is a programming error, not a race.
 */
const WRITES = new Set(['insert', 'update', 'delete']);

export const db = new Proxy({} as Drizzle, {
  get(_target, prop, receiver) {
    if (!instance) {
      throw new Error('Database used before initDatabase() finished. Await it in the root layout.');
    }
    const value = Reflect.get(instance, prop, receiver);

    /**
     * sql.js holds the database in memory, so a write is not durable until the
     * file is exported to IndexedDB. Rather than making every repo function
     * remember to persist — a rule that would be forgotten exactly once, silently,
     * and cost someone their history — the persist is attached here.
     *
     * Drizzle's builders are thenables, so hooking `then` fires the save AFTER the
     * statement actually executes. Scheduling it when the builder is merely created
     * would race the write it is meant to capture.
     */
    if (typeof value === 'function' && WRITES.has(prop as string)) {
      return (...args: unknown[]) => {
        const builder = (value as (...a: unknown[]) => Record<string, unknown>).apply(
          instance,
          args,
        );
        const originalThen = builder.then as
          | ((onOk?: (v: unknown) => unknown, onErr?: (e: unknown) => unknown) => unknown)
          | undefined;

        if (typeof originalThen === 'function') {
          builder.then = (onOk?: (v: unknown) => unknown, onErr?: (e: unknown) => unknown) =>
            originalThen.call(
              builder,
              (result: unknown) => {
                schedulePersist();
                return onOk ? onOk(result) : result;
              },
              onErr,
            );
        }
        return builder;
      };
    }

    return value;
  },
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced so a burst of task updates costs one write, not ten. */
export function schedulePersist(): void {
  if (!raw) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void persistNow(), 400);
}

export async function persistNow(): Promise<void> {
  if (!raw) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await saveSnapshot(raw.export());
}

export async function initDatabase(): Promise<void> {
  if (instance) return;

  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
  const snapshot = await loadSnapshot();
  raw = snapshot ? new SQL.Database(snapshot) : new SQL.Database();
  instance = drizzle(raw, { schema });

  // A closed tab must not lose the last few seconds of logging.
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => void persistNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void persistNow();
    });
  }
}

/** Exposed for the migrator; not for application code. */
export function rawDatabase(): SqlJsDatabase {
  if (!raw) throw new Error('Database not initialised');
  return raw;
}
