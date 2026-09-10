import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  dayKey,
  dayPercent,
  isPlanLocked,
  DEFAULT_SETTINGS,
  type DayLog,
  type NewTask,
  type Settings,
  type Task,
} from '@/lib/domain';
import { PLAN_LOCK_ENABLED } from '@/lib/config';
import {
  addTask as repoAddTask,
  applyTemplate,
  getDayLog,
  getSettings,
  listDayLogsUpTo,
  listTemplates,
  taskToColumns,
  updateTask,
  type TemplateWithTasks,
} from '@/lib/repo';

/**
 * Today's plan, held in local state and mirrored into SQLite on every change.
 *
 * State updates first so the header percent moves within a frame; the write is
 * fire-and-forget because SQLite is the source of truth and it is local — there
 * is no round trip to fail. See .claude/rules/data.md.
 */
export function useToday() {
  const day = dayKey();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [templates, setTemplates] = useState<TemplateWithTasks[]>([]);
  const [log, setLog] = useState<DayLog | null>(null);
  /** Best weight per exercise on any day but today — drives the New PR badge. */
  const [previousBests, setPreviousBests] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const [nextSettings, nextTemplates, nextLog, history] = await Promise.all([
      getSettings(),
      listTemplates(),
      getDayLog(day),
      listDayLogsUpTo(day),
    ]);

    const bests: Record<string, number> = {};
    for (const entry of history) {
      if (entry.day === day) continue;
      for (const task of entry.tasks) {
        if (task.type === 'pr' && task.weight > (bests[task.name] ?? 0)) {
          bests[task.name] = task.weight;
        }
      }
    }

    setSettings(nextSettings);
    setTemplates(nextTemplates);
    setLog(nextLog);
    setPreviousBests(bests);
    setReady(true);
  }, [day]);

  useEffect(() => {
    void load();
  }, [load]);

  const locked = PLAN_LOCK_ENABLED && isPlanLocked(Boolean(log), settings);
  const percent = useMemo(() => Math.round(dayPercent(log?.tasks ?? [])), [log]);

  const selectTemplate = useCallback(
    async (templateId: string) => {
      if (locked) return;
      setLog(await applyTemplate(templateId, day));
      setTemplates(await listTemplates());
    },
    [day, locked],
  );

  const changeTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setLog((current) => {
      if (!current) return current;
      const tasks = current.tasks.map((t) => (t.id === taskId ? ({ ...t, ...patch } as Task) : t));
      const updated = tasks.find((t) => t.id === taskId);
      if (updated) void updateTask(taskId, taskToColumns(updated));
      return { ...current, tasks };
    });
  }, []);

  const addTask = useCallback(
    async (draft: NewTask) => {
      if (locked) return;
      await repoAddTask(day, draft);
      setLog(await getDayLog(day));
    },
    [day, locked],
  );

  return {
    ready,
    day,
    settings,
    templates,
    log,
    locked,
    percent,
    previousBests,
    selectTemplate,
    changeTask,
    addTask,
    reload: load,
  };
}
