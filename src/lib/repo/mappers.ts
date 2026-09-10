import type { Task } from '@/lib/domain';
import type { dayLogTasks } from '@/db/schema';

type Row = typeof dayLogTasks.$inferSelect;

/**
 * SQLite stores every task type in one wide row with nullable columns.
 * This is the single place that narrows a row back into the domain union —
 * do it here, not in screens.
 */
export function rowToTask(row: Row): Task {
  const base = { id: row.id, name: row.name, sort: row.sort };
  switch (row.type) {
    case 'check':
      return { ...base, type: 'check', done: row.done ?? false };
    case 'numeric':
      return {
        ...base,
        type: 'numeric',
        target: row.target ?? 0,
        value: row.value ?? 0,
        unit: row.unit ?? '',
      };
    case 'pr':
      return {
        ...base,
        type: 'pr',
        weight: row.weight ?? 0,
        reps: row.reps ?? 0,
        unit: row.unit ?? 'kg',
      };
  }
}

/** Domain task -> the nullable column set. Unused columns are explicitly null. */
export function taskToColumns(task: Task) {
  return {
    name: task.name,
    type: task.type,
    sort: task.sort,
    done: task.type === 'check' ? task.done : null,
    target: task.type === 'numeric' ? task.target : null,
    value: task.type === 'numeric' ? task.value : null,
    unit: task.type === 'check' ? null : task.unit,
    weight: task.type === 'pr' ? task.weight : null,
    reps: task.type === 'pr' ? task.reps : null,
  };
}
