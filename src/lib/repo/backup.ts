import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  dayLogs,
  dayLogTasks,
  LOCAL_USER_ID,
  templates,
  templateTasks,
  userSettings,
  weeklySchedule,
} from '@/db/schema';
import type { Settings, Template } from '@/lib/domain';
import { getSchedule, type WeeklySchedule } from './schedule';
import { getSettings } from './settings';
import { listTemplates } from './templates';
import { listDayLogsUpTo } from './dayLogs';
import type { DayLog } from '@/lib/domain';

/**
 * Insurance while the app runs on 7-day free-provisioning builds and there is
 * no server copy. Supabase (Phase 4) replaces the *need* for this, but a manual
 * export stays useful afterwards — it is the only way to get your data out.
 *
 * Domain shapes only: this file is deliberately readable by a human and stable
 * against schema churn, so an old backup still restores after a migration.
 */

export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: 'PRX';
  version: number;
  exportedAt: string;
  settings: Settings;
  schedule: WeeklySchedule;
  templates: Template[];
  dayLogs: DayLog[];
}

export async function buildBackup(): Promise<BackupFile> {
  const [settings, schedule, allTemplates, logs] = await Promise.all([
    getSettings(),
    getSchedule(),
    listTemplates(),
    listDayLogsUpTo(),
  ]);

  return {
    app: 'PRX',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    schedule,
    templates: allTemplates,
    dayLogs: logs,
  };
}

export class BackupError extends Error {}

/** Throws BackupError with a message worth showing the user. */
export function parseBackup(raw: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupError("That file isn't valid JSON.");
  }

  const file = parsed as Partial<BackupFile>;
  if (file?.app !== 'PRX') throw new BackupError("That doesn't look like a PRX backup.");
  if (typeof file.version !== 'number' || file.version > BACKUP_VERSION) {
    throw new BackupError('That backup was made by a newer version of PRX.');
  }
  if (!Array.isArray(file.templates) || !Array.isArray(file.dayLogs)) {
    throw new BackupError('That backup is missing templates or logs.');
  }
  return file as BackupFile;
}

/**
 * REPLACES everything. Not a merge — merging two histories means resolving id
 * collisions and per-day conflicts, which is exactly what Phase 4's sync exists
 * to do properly. Restoring is for a fresh or broken install.
 */
export async function restoreBackup(file: BackupFile): Promise<void> {
  const now = Date.now();

  await db.delete(dayLogTasks);
  await db.delete(dayLogs);
  await db.delete(templateTasks);
  await db.delete(templates);
  await db.delete(weeklySchedule);

  for (const [index, template] of file.templates.entries()) {
    await db.insert(templates).values({
      id: template.id,
      userId: LOCAL_USER_ID,
      name: template.name,
      sort: index,
      isSeed: template.isSeed,
      copiedFrom: template.copiedFrom,
      lastUsedOn: template.lastUsedOn,
      updatedAt: now,
    });
    if (template.tasks.length) {
      await db.insert(templateTasks).values(
        template.tasks.map((task, sort) => ({
          id: task.id,
          templateId: template.id,
          name: task.name,
          type: task.type,
          target: task.target,
          unit: task.unit,
          sort,
          updatedAt: now,
        })),
      );
    }
  }

  for (const log of file.dayLogs) {
    await db.insert(dayLogs).values({
      id: log.id,
      userId: LOCAL_USER_ID,
      day: log.day,
      templateId: log.templateId,
      lockedAt: log.lockedAt,
      updatedAt: now,
    });
    if (log.tasks.length) {
      await db.insert(dayLogTasks).values(
        log.tasks.map((task, sort) => ({
          id: task.id,
          dayLogId: log.id,
          sourceTaskId: null,
          name: task.name,
          type: task.type,
          sort,
          done: task.type === 'check' ? task.done : null,
          target: task.type === 'numeric' ? task.target : null,
          value: task.type === 'numeric' ? task.value : null,
          unit: task.type === 'check' ? null : task.unit,
          weight: task.type === 'pr' ? task.weight : null,
          reps: task.type === 'pr' ? task.reps : null,
          updatedAt: now,
        })),
      );
    }
  }

  for (const [weekday, templateId] of (file.schedule ?? []).entries()) {
    await db
      .insert(weeklySchedule)
      .values({ userId: LOCAL_USER_ID, weekday, templateId, updatedAt: now });
  }

  if (file.settings) {
    await db
      .update(userSettings)
      .set({ ...file.settings, updatedAt: now })
      .where(eq(userSettings.userId, LOCAL_USER_ID));
  }
}
