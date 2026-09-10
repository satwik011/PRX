import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { LOCAL_USER_ID, weeklySchedule } from '@/db/schema';

/** weekday index (0 = Sunday) -> template id, or null where unscheduled. */
export type WeeklySchedule = (string | null)[];

const EMPTY: WeeklySchedule = [null, null, null, null, null, null, null];

export async function getSchedule(): Promise<WeeklySchedule> {
  const rows = await db
    .select()
    .from(weeklySchedule)
    .where(eq(weeklySchedule.userId, LOCAL_USER_ID));

  const schedule = [...EMPTY];
  for (const row of rows) {
    if (row.weekday >= 0 && row.weekday <= 6) schedule[row.weekday] = row.templateId;
  }
  return schedule;
}

/** Pass null to clear a day back to manual picking. */
export async function setScheduleDay(weekday: number, templateId: string | null): Promise<void> {
  const now = Date.now();
  const existing = await db
    .select({ weekday: weeklySchedule.weekday })
    .from(weeklySchedule)
    .where(and(eq(weeklySchedule.userId, LOCAL_USER_ID), eq(weeklySchedule.weekday, weekday)));

  if (existing.length) {
    await db
      .update(weeklySchedule)
      .set({ templateId, updatedAt: now })
      .where(and(eq(weeklySchedule.userId, LOCAL_USER_ID), eq(weeklySchedule.weekday, weekday)));
  } else {
    await db
      .insert(weeklySchedule)
      .values({ userId: LOCAL_USER_ID, weekday, templateId, updatedAt: now });
  }
}
