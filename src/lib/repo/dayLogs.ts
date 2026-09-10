import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import { LOCAL_USER_ID, dayLogs, dayLogTasks, templates } from '@/db/schema';
import { dayKey, dayPercent, materializeTemplate,
  type DayLog,
  type DaySummary,
  type NewTask,
  type Task,
} from '@/lib/domain';
import { id } from '@/lib/id';
import { rowToTask, taskToColumns } from './mappers';
import { getTemplate } from './templates';

async function loadTasks(dayLogId: string) {
  const rows = await db
    .select()
    .from(dayLogTasks)
    .where(eq(dayLogTasks.dayLogId, dayLogId))
    .orderBy(asc(dayLogTasks.sort));
  return rows.map(rowToTask);
}

/**
 * Tasks for many day logs in ONE query, grouped by log id.
 *
 * The previous version looped and queried per day — 365 round trips for a year,
 * re-run on every tab focus. Invisible on SQLite at small sizes, a real stall at
 * a year, and worse again on IndexedDB in the web build.
 */
async function loadTasksFor(dayLogIds: string[]): Promise<Map<string, Task[]>> {
  const grouped = new Map<string, Task[]>();
  if (!dayLogIds.length) return grouped;

  const rows = await db
    .select()
    .from(dayLogTasks)
    .where(inArray(dayLogTasks.dayLogId, dayLogIds))
    .orderBy(asc(dayLogTasks.sort));

  for (const row of rows) {
    const list = grouped.get(row.dayLogId) ?? [];
    list.push(rowToTask(row));
    grouped.set(row.dayLogId, list);
  }
  return grouped;
}

function toDayLog(row: typeof dayLogs.$inferSelect, tasks: Task[]): DayLog {
  return {
    id: row.id,
    day: row.day,
    templateId: row.templateId,
    lockedAt: row.lockedAt,
    tasks,
  };
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
  const template = await getTemplate(templateId);
  if (!template) throw new Error(`No template ${templateId}`);
  const materialized = materializeTemplate(template.tasks);

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

  if (materialized.length) {
    await db.insert(dayLogTasks).values(
      materialized.map(({ sourceTaskId, task }, sort) => ({
        id: id(),
        dayLogId,
        sourceTaskId,
        ...taskToColumns({ ...task, id: id(), sort } as Task),
        updatedAt: now,
      })),
    );
  }

  await db.update(templates).set({ lastUsedOn: day }).where(eq(templates.id, templateId));

  return (await getDayLog(day))!;
}

/** Create today's log if it does not exist yet. Returns it either way. */
export async function ensureDayLog(day: string = dayKey()): Promise<DayLog> {
  const existing = await getDayLog(day);
  if (existing) return existing;

  const now = Date.now();
  await db.insert(dayLogs).values({
    id: id(),
    userId: LOCAL_USER_ID,
    day,
    templateId: null,
    lockedAt: null,
    updatedAt: now,
  });
  return (await getDayLog(day))!;
}

/** Append an ad-hoc task to a day. sourceTaskId stays null — it came from no template. */
export async function addTask(day: string, draft: NewTask): Promise<Task> {
  const log = await ensureDayLog(day);
  const task = { ...draft, id: id(), sort: log.tasks.length } as Task;
  await db.insert(dayLogTasks).values({
    id: task.id,
    dayLogId: log.id,
    sourceTaskId: null,
    ...taskToColumns(task),
    updatedAt: Date.now(),
  });
  return task;
}

/**
 * Persist one task. Takes a domain Task, not a column patch — column mapping is
 * the repository's business, and callers must never import `taskToColumns`.
 */
export async function updateTask(task: Task): Promise<void> {
  await db
    .update(dayLogTasks)
    .set({ ...taskToColumns(task), updatedAt: Date.now() })
    .where(eq(dayLogTasks.id, task.id));
}

export async function listDayLogs(from: string, to: string): Promise<DayLog[]> {
  const rows = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, LOCAL_USER_ID), gte(dayLogs.day, from), lte(dayLogs.day, to)))
    .orderBy(asc(dayLogs.day));

  const tasks = await loadTasksFor(rows.map((r) => r.id));
  return rows.map((row) => toDayLog(row, tasks.get(row.id) ?? []));
}

/**
 * One entry per day in the range, including days with no log (percent 0) —
 * the streak functions need an unbroken oldest-first sequence.
 */
/** Every log on or before `day`, oldest first. Used to derive PRs and bests. */
export async function listDayLogsUpTo(day: string = dayKey()): Promise<DayLog[]> {
  const rows = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, LOCAL_USER_ID), lte(dayLogs.day, day)))
    .orderBy(asc(dayLogs.day));

  const tasks = await loadTasksFor(rows.map((r) => r.id));
  return rows.map((row) => toDayLog(row, tasks.get(row.id) ?? []));
}

export async function daySummaries(days: string[]): Promise<DaySummary[]> {
  if (!days.length) return [];
  const logs = await listDayLogs(days[0], days[days.length - 1]);
  const byDay = new Map(logs.map((l) => [l.day, l]));
  return days.map((day) => ({
    day,
    percent: byDay.has(day) ? dayPercent(byDay.get(day)!.tasks) : 0,
  }));
}
