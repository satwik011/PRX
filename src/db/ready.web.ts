import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { initDatabase, persistNow as persist, rawDatabase } from './client.web';
import type { DatabaseReady } from './ready';

export type { DatabaseReady };

/**
 * Web: boot sql.js, then bring the schema up to date.
 *
 * Drizzle's expo migrator is native-only, so this applies the same generated SQL
 * by hand and tracks progress in `__drizzle_migrations` — the same idea, minus
 * the platform binding. Order comes from the journal, not object key order.
 */
async function migrate(): Promise<void> {
  const raw = rawDatabase();

  raw.run(`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL UNIQUE,
    created_at INTEGER
  )`);

  const applied = new Set<string>();
  const rows = raw.exec('SELECT hash FROM __drizzle_migrations');
  for (const value of rows[0]?.values ?? []) applied.add(String(value[0]));

  for (const entry of migrations.journal.entries) {
    const tag = entry.tag;
    if (applied.has(tag)) continue;

    const sql = (migrations.migrations as Record<string, string>)[
      `m${String(entry.idx).padStart(4, '0')}`
    ];
    if (!sql) throw new Error(`Missing migration SQL for ${tag}`);

    // Drizzle separates statements with this marker.
    for (const statement of sql.split('--> statement-breakpoint')) {
      const trimmed = statement.trim();
      if (trimmed) raw.run(trimmed);
    }

    raw.run('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)', [tag, Date.now()]);
  }
}

export function useDatabaseReady(): DatabaseReady {
  const [state, setState] = useState<DatabaseReady>({ success: false });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await initDatabase();
        await migrate();
        await persist();
        if (!cancelled) setState({ success: true });
      } catch (error) {
        if (!cancelled) setState({ success: false, error: error as Error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function persistNow(): Promise<void> {
  return persist();
}
