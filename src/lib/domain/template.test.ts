import { describe, expect, it } from 'vitest';
import { materializeTemplate, type TemplateTaskDef } from './template';

const def = (over: Partial<TemplateTaskDef> = {}): TemplateTaskDef => ({
  id: 't1',
  name: 'Bench Press',
  type: 'pr',
  target: null,
  unit: 'kg',
  sort: 0,
  ...over,
});

describe('materializeTemplate', () => {
  it('starts a check task unchecked', () => {
    const [{ task }] = materializeTemplate([def({ type: 'check', name: 'Warm-up', unit: null })]);
    expect(task).toEqual({ name: 'Warm-up', type: 'check', done: false });
  });

  it('copies a numeric target and starts at zero', () => {
    const [{ task }] = materializeTemplate([
      def({ type: 'numeric', name: 'Push-ups', target: 3, unit: 'sets' }),
    ]);
    expect(task).toEqual({ name: 'Push-ups', type: 'numeric', target: 3, value: 0, unit: 'sets' });
  });

  it('starts a PR task with no weight logged', () => {
    const [{ task }] = materializeTemplate([def()]);
    expect(task).toEqual({ name: 'Bench Press', type: 'pr', weight: 0, reps: 0, unit: 'kg' });
  });

  it('keeps provenance without linking', () => {
    expect(materializeTemplate([def({ id: 'tt-c1' })])[0].sourceTaskId).toBe('tt-c1');
  });

  it('orders by sort, not array position', () => {
    const names = materializeTemplate([
      def({ id: 'b', name: 'Second', sort: 2 }),
      def({ id: 'a', name: 'First', sort: 1 }),
    ]).map((e) => e.task.name);
    expect(names).toEqual(['First', 'Second']);
  });

  it('does not reorder the caller array', () => {
    const defs = [def({ id: 'b', name: 'Second', sort: 2 }), def({ id: 'a', name: 'First', sort: 1 })];
    materializeTemplate(defs);
    expect(defs.map((d) => d.name)).toEqual(['Second', 'First']);
  });

  /**
   * The invariant that matters: a logged day must not change when its template is
   * edited later. If this fails, history has become mutable.
   */
  it('COPIES values — editing the template afterwards cannot reach the result', () => {
    const defs = [def({ type: 'numeric', name: 'Push-ups', target: 3, unit: 'sets' })];
    const [{ task }] = materializeTemplate(defs);

    defs[0].name = 'Renamed';
    defs[0].target = 99;
    defs[0].unit = 'reps';

    expect(task).toEqual({ name: 'Push-ups', type: 'numeric', target: 3, value: 0, unit: 'sets' });
  });

  it('defaults a missing numeric target to 0 rather than NaN', () => {
    const [{ task }] = materializeTemplate([def({ type: 'numeric', target: null, unit: 'sets' })]);
    expect(task).toMatchObject({ target: 0, value: 0 });
  });
});
