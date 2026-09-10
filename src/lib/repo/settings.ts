import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { LOCAL_USER_ID, userSettings } from '@/db/schema';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/domain';

/** Always returns a row — created on first read so callers never handle null. */
export async function getSettings(): Promise<Settings> {
  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, LOCAL_USER_ID));

  if (!row) {
    await db.insert(userSettings).values({
      userId: LOCAL_USER_ID,
      ...DEFAULT_SETTINGS,
      updatedAt: Date.now(),
    });
    return DEFAULT_SETTINGS;
  }

  return {
    streakThreshold: row.streakThreshold,
    planLockHour: row.planLockHour,
    unitSystem: row.unitSystem,
  };
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await getSettings(); // guarantees the row exists
  await db
    .update(userSettings)
    .set({ ...patch, updatedAt: Date.now() })
    .where(eq(userSettings.userId, LOCAL_USER_ID));
}
