/** Shared domain types. Storage-agnostic on purpose — see .claude/rules/data.md. */

export type TaskType = 'check' | 'numeric' | 'pr';

interface TaskBase {
  id: string;
  name: string;
  sort: number;
}

export interface CheckTask extends TaskBase {
  type: 'check';
  done: boolean;
}

export interface NumericTask extends TaskBase {
  type: 'numeric';
  target: number;
  value: number;
  unit: string;
}

export interface PRTask extends TaskBase {
  type: 'pr';
  weight: number;
  reps: number;
  unit: string;
}

export type Task = CheckTask | NumericTask | PRTask;

/**
 * `Omit<Union, K>` collapses a union down to its SHARED keys — so
 * `Omit<Task, 'id'>` loses `done`, `target` and `weight` entirely. Distributing
 * over the union first keeps each member's own fields.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** A task before it has been persisted: no id, and sort is assigned on insert. */
export type NewTask = DistributiveOmit<Task, 'id' | 'sort'>;

export interface DayLog {
  id: string;
  /** Local calendar date, YYYY-MM-DD. See dayKey(). */
  day: string;
  templateId: string | null;
  /** Epoch ms, or null while the plan is still editable. */
  lockedAt: number | null;
  tasks: Task[];
}

export interface Settings {
  /** Percent a day must reach to count toward the streak. 70 | 80 | 90. */
  streakThreshold: number;
  /** Local hour the day's plan freezes. 7 | 8 | 9. */
  planLockHour: number;
  unitSystem: 'kg' | 'lb';
}

export const DEFAULT_SETTINGS: Settings = {
  streakThreshold: 80,
  planLockHour: 8,
  unitSystem: 'kg',
};

/** One day reduced to its completion percent — what the streak functions consume. */
export interface DaySummary {
  day: string;
  percent: number;
}

export interface PRHistoryEntry {
  day: string;
  weight: number;
  reps: number;
}

export interface PRGroup {
  name: string;
  unit: string;
  best: PRHistoryEntry;
  /** Newest first. */
  history: PRHistoryEntry[];
}
