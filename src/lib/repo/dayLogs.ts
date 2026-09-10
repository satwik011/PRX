import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import { LOCAL_USER_ID, dayLogs, dayLogTasks } from '@/db/schema';
import { dayKey, dayPercent, type DayLog, type DaySummary } from '@/lib/domain';
import { id } from '@/lib/id';
import { rowToTask, taskToColumns } from './mappers';
import { listTemplates } from './templates';

async function loadTasks(dayLogId: string) {
  const rows = await db
    .select()
    .from(dayLogTasks)
    .where(eq(dayLogTasks.dayLogId, dayLogId))
    .orderBy(asc(dayLogTasks.sort));
  return rows.map(rowToTask);
}

export async function getDayLog(day: string = dayKey()): Promise<DayLog | null> {
  const [row] = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, LOCAL_USER_ID), eq(dayLogs.day, day)));
  if (!row) return null;

  return {
    id: row.id,
    day: row.day,
    templateId: row.templateId,
    lockedAt: row.lockedAt,
    tasks: await loadTasks(row.id),
  };
}

/**
 * Materialises a template into a day as a SNAPSHOT — name/type/target/unit are
 * COPIED, not referenced. Editing the template later must not touch this day.
 * See .claude/rules/data.md invariant 1.
 *
 * Replaces any existing plan for that day.
 */
export async function applyTemplate(templateId: string, day: string = dayKey()): Promise<DayLog> {
  const template = (await listTemplates()).find((t) => t.id === templateId);
  if (!template) throw new Error(`No template ${templateId}`);

  const now = Date.now();
  const existing = await getDayLog(day);
  const dayLogId = existing?.id ?? id();

  if (existing) {
    await db.delete(dayLogTasks).where(eq(dayLogTasks.dayLogId, dayLogId));
    await db
      .update(dayLogs)
      .set({ templateId, updatedAt: now })
      .where(eq(dayLogs.id, dayLogId));
  } else {
    await db.insert(dayLogs).values({
      id: dayLogId,
      userId: LOCAL_USER_ID,
      day,
      templateId,
      lockedAt: null,
      updatedAt: now,
    });
  }

  await db.insert(dayLogTasks).values(
    template.tasks.map((task, sort) => ({
      id: id(),
      dayLogId,
      sourceTaskId: task.id,
      name: task.name,
      type: task.type,
      sort,
      done: task.type === 'check' ? false : null,
      target: task.type === 'numeric' ? task.target : null,
      value: task.type === 'numeric' ? 0 : null,
      unit: task.unit,
      weight: task.type === 'pr' ? 0 : null,
      reps: task.type === 'pr' ? 0 : null,
      updatedAt: now,
    })),
  );

  await db.update(templates).set({ lastUsedOn: day }).where(eq(templates.id, templateId));

  return (await getDayLog(day))!;
}

/** Patch one task in place. The only write path the Today screen needs. */
export async function updateTask(
  taskId: string,
  patch: Partial<ReturnType<typeof taskToColumns>>,
): Promise<void> {
  await db
    .update(dayLogTasks)
    .set({ ...patch, updatedAt: Date.now() })
    .where(eq(dayLogTasks.id, taskId));
}

export async function listDayLogs(from: string, to: string): Promise<DayLog[]> {
  const rows = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, LOCAL_USER_ID), gte(dayLogs.day, from), lte(dayLogs.day, to)))
    .orderBy(asc(dayLogs.day));

  const result: DayLog[] = [];
  for (const row of rows) {
    result.push({
      id: row.id,
      day: row.day,
      templateId: row.templateId,
      lockedAt: row.lockedAt,
      tasks: await loadTasks(row.id),
    });
  }
  return result;
}

/**
 * One entry per day in the range, including days with no log (percent 0) —
 * the streak functions need an unbroken oldest-first sequence.
 */
export async function daySummaries(days: string[]): Promise<DaySummary[]> {
  if (!days.length) return [];
  const logs = await listDayLogs(days[0], days[days.length - 1]);
  const byDay = new Map(logs.map((l) => [l.day, l]));
  return days.map((day) => ({
    day,
    percent: byDay.has(day) ? dayPercent(byDay.get(day)!.tasks) : 0,
  }));
}
