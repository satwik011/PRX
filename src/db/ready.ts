import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../drizzle/migrations';
import { db } from './client';

export interface DatabaseReady {
  success: boolean;
  error?: Error;
}

/** Native: expo-sqlite's migrator runs against the on-device file. */
export function useDatabaseReady(): DatabaseReady {
  const { success, error } = useMigrations(db, migrations);
  return { success, error: error ?? undefined };
}

/** No-op on native — expo-sqlite writes straight to disk. */
export function persistNow(): Promise<void> {
  return Promise.resolve();
}
