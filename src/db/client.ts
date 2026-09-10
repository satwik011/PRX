import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

/**
 * The one SQLite handle for the app. Nothing outside lib/repo/ should import
 * this — screens and hooks go through the repository. See CLAUDE.md rule 2.
 */
export const sqlite = openDatabaseSync('prx.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
