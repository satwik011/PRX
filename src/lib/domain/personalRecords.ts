import type { DayLog, PRGroup, PRHistoryEntry } from './types';

/**
 * Personal records are DERIVED, never stored — storing them would create a
 * second source of truth that drifts. See .claude/rules/data.md invariant 2.
 *
 * Groups every logged PR task with weight > 0 by name; best = max weight.
 */
export function personalRecords(logs: DayLog[], historyLimit = 4): PRGroup[] {
  const groups = new Map<string, { unit: string; entries: PRHistoryEntry[] }>();

  for (const log of logs) {
    for (const task of log.tasks) {
      if (task.type !== 'pr' || task.weight <= 0) continue;
      const group = groups.get(task.name) ?? { unit: task.unit, entries: [] };
      group.entries.push({ day: log.day, weight: task.weight, reps: task.reps });
      groups.set(task.name, group);
    }
  }

  return [...groups.entries()].map(([name, { unit, entries }]) => {
    const byDayDesc = [...entries].sort((a, b) => b.day.localeCompare(a.day));
    const best = entries.reduce((a, b) => (b.weight > a.weight ? b : a));
    return { name, unit, best, history: byDayDesc.slice(0, historyLimit) };
  });
}

/**
 * True when today's weight beats the best ever recorded for that exercise on
 * any OTHER day. Strictly greater — equalling your best is not a new PR.
 */
export function isNewPR(
  name: string,
  weight: number,
  logs: DayLog[],
  todayKey: string,
): boolean {
  if (weight <= 0) return false;

  let bestBefore = 0;
  for (const log of logs) {
    if (log.day === todayKey) continue;
    for (const task of log.tasks) {
      if (task.type === 'pr' && task.name === name && task.weight > bestBefore) {
        bestBefore = task.weight;
      }
    }
  }
  return weight > bestBefore;
}
