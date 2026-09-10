import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { dayLogs, dayLogTasks, LOCAL_USER_ID } from '@/db/schema';
import { addDaysToKey, dayKey } from '@/lib/domain';
import { id } from '@/lib/id';
import { listTemplates } from '@/lib/repo';

/**
 * DEV ONLY. Writes ~4 weeks of plausible history so the heatmap, streak and PR
 * screens have something to render before you have actually trained for a month.
 *
 * Deliberately imports the db directly — this is a throwaway tool, not app code,
 * and routing it through lib/repo would mean adding write paths that exist only
 * to support fake data. Delete this folder before release.
 *
 * Skips today, so it never collides with a real session in progress, and skips
 * any day that already has a log.
 */
export async function seedDevHistory(days = 28): Promise<void> {
  if (!__DEV__) return;

  const templates = await listTemplates();
  if (!templates.length) return;

  const today = dayKey();
  const now = Date.now();

  for (let ago = days; ago >= 1; ago--) {
    const day = addDaysToKey(today, -ago);

    const existing = await db
      .select({ id: dayLogs.id })
      .from(dayLogs)
      .where(and(eq(dayLogs.userId, LOCAL_USER_ID), eq(dayLogs.day, day)));
    if (existing.length) continue;

    const template = templates[ago % templates.length];
    // A believable pattern: mostly hit, one miss a week, occasional partial.
    const outcome = ago % 7 === 3 ? 'miss' : ago % 5 === 0 ? 'partial' : 'hit';
    const ratio = outcome === 'hit' ? 1 : outcome === 'partial' ? 0.5 : 0.15;

    const dayLogId = id();
    await db.insert(dayLogs).values({
      id: dayLogId,
      userId: LOCAL_USER_ID,
      day,
      templateId: template.id,
      lockedAt: null,
      updatedAt: now,
    });

    const hitCount = Math.round(template.tasks.length * ratio);
    await db.insert(dayLogTasks).values(
      template.tasks.map((task, index) => {
        const done = index < hitCount;
        // Weights creep up week over week so the PR screen shows progression.
        const base = task.name === 'Squat' ? 90 : task.name === 'Bench Press' ? 65 : 40;
        const weight = done ? base + Math.floor((days - ago) / 7) * 2.5 : 0;
        return {
          id: id(),
          dayLogId,
          sourceTaskId: task.id,
          name: task.name,
          type: task.type,
          sort: index,
          done: task.type === 'check' ? done : null,
          target: task.type === 'numeric' ? task.target : null,
          value: task.type === 'numeric' ? (done ? (task.target ?? 0) : 0) : null,
          unit: task.unit,
          weight: task.type === 'pr' ? weight : null,
          reps: task.type === 'pr' ? (done ? 5 : 0) : null,
          updatedAt: now,
        };
      }),
    );
  }
}

/** Wipes every logged day. Templates and settings survive. */
export async function clearDevHistory(): Promise<void> {
  if (!__DEV__) return;
  await db.delete(dayLogTasks);
  await db.delete(dayLogs);
}
