import type { NewTask, TaskType } from './types';

/** A template task as stored — the blueprint, not a logged task. */
export interface TemplateTaskDef {
  id: string;
  name: string;
  type: TaskType;
  target: number | null;
  unit: string | null;
  sort: number;
}

export interface Template {
  id: string;
  name: string;
  isSeed: boolean;
  copiedFrom: string | null;
  lastUsedOn: string | null;
  tasks: TemplateTaskDef[];
}

export interface MaterializedTask {
  /** Provenance only. Never a live link — see .claude/rules/data.md invariant 1. */
  sourceTaskId: string;
  task: NewTask;
}

/**
 * Turns a template's tasks into a day's tasks.
 *
 * This is a COPY, not a reference: every value is read out of the def and
 * written into a fresh object. That is the single thing standing between
 * "edit a template" and "silently rewrite last Tuesday", so it lives here as a
 * pure function with tests rather than buried in a repo method.
 */
export function materializeTemplate(defs: TemplateTaskDef[]): MaterializedTask[] {
  return [...defs]
    .sort((a, b) => a.sort - b.sort)
    .map((def) => {
      if (def.type === 'check') {
        return {
          sourceTaskId: def.id,
          task: { name: def.name, type: 'check' as const, done: false },
        };
      }
      if (def.type === 'numeric') {
        return {
          sourceTaskId: def.id,
          task: {
            name: def.name,
            type: 'numeric' as const,
            target: def.target ?? 0,
            value: 0,
            unit: def.unit ?? '',
          },
        };
      }
      return {
        sourceTaskId: def.id,
        task: { name: def.name, type: 'pr' as const, weight: 0, reps: 0, unit: def.unit ?? 'kg' },
      };
    });
}
