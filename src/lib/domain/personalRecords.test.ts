import { describe, expect, it } from 'vitest';
import { isNewPR, personalRecords } from './personalRecords';
import type { DayLog, PRTask } from './types';

const prTask = (name: string, weight: number, reps = 5): PRTask =>
  ({ id: `${name}-${weight}`, name, sort: 0, type: 'pr', weight, reps, unit: 'kg' });

const log = (day: string, ...tasks: PRTask[]): DayLog =>
  ({ id: day, day, templateId: null, lockedAt: null, tasks });

const history: DayLog[] = [
  log('2026-09-01', prTask('Bench Press', 75), prTask('Squat', 100)),
  log('2026-09-03', prTask('Bench Press', 80)),
  log('2026-09-05', prTask('Bench Press', 77.5), prTask('Squat', 102.5)),
];

describe('personalRecords', () => {
  it('groups by exercise name', () => {
    const groups = personalRecords(history);
    expect(groups.map((g) => g.name).sort()).toEqual(['Bench Press', 'Squat']);
  });

  it('best is the max weight, not the most recent', () => {
    const bench = personalRecords(history).find((g) => g.name === 'Bench Press')!;
    expect(bench.best.weight).toBe(80);
    expect(bench.best.day).toBe('2026-09-03');
  });

  it('history is newest first', () => {
    const bench = personalRecords(history).find((g) => g.name === 'Bench Press')!;
    expect(bench.history.map((h) => h.day)).toEqual(['2026-09-05', '2026-09-03', '2026-09-01']);
  });

  it('ignores unlogged PR tasks', () => {
    const groups = personalRecords([log('2026-09-07', prTask('Deadlift', 0))]);
    expect(groups).toEqual([]);
  });

  it('caps history length', () => {
    const many = [1, 2, 3, 4, 5, 6].map((n) => log(`2026-09-0${n}`, prTask('Row', 50 + n)));
    expect(personalRecords(many, 4).find((g) => g.name === 'Row')!.history).toHaveLength(4);
  });
});

describe('isNewPR', () => {
  const today = '2026-09-10';
  const withToday = [...history, log(today, prTask('Bench Press', 82.5))];

  it('is true when today beats every other day', () => {
    expect(isNewPR('Bench Press', 82.5, withToday, today)).toBe(true);
  });

  it('is false when equalling the previous best', () => {
    expect(isNewPR('Bench Press', 80, withToday, today)).toBe(false);
  });

  it('is false below the previous best', () => {
    expect(isNewPR('Bench Press', 70, withToday, today)).toBe(false);
  });

  it('ignores today when working out the previous best', () => {
    // Today's own 82.5 must not count as the bar to beat.
    expect(isNewPR('Bench Press', 81, withToday, today)).toBe(true);
  });

  it('is true for a brand-new exercise', () => {
    expect(isNewPR('Overhead Press', 40, withToday, today)).toBe(true);
  });

  it('is false for zero weight', () => {
    expect(isNewPR('Bench Press', 0, withToday, today)).toBe(false);
  });
});
