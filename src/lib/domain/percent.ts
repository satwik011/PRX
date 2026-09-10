import type { Task } from './types';

/** Completion of a single task, 0–100. */
export function taskPercent(task: Task): number {
  switch (task.type) {
    case 'check':
      return task.done ? 100 : 0;
    case 'numeric':
      // Guard against target 0 — otherwise this returns Infinity.
      return task.target ? Math.min(100, (task.value / task.target) * 100) : 0;
    case 'pr':
      return task.weight > 0 ? 100 : 0;
  }
}

/** Unweighted mean of task percents. A day with no tasks is 0, not 100. */
export function dayPercent(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return tasks.reduce((sum, t) => sum + taskPercent(t), 0) / tasks.length;
}

/** Rounded before comparing — 79.6% does not clear an 80 threshold by accident. */
export function qualifies(percent: number, threshold: number): boolean {
  return Math.round(percent) >= threshold;
}
