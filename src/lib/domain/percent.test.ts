import { describe, expect, it } from 'vitest';
import { dayPercent, qualifies, taskPercent } from './percent';
import type { CheckTask, NumericTask, PRTask, Task } from './types';

const check = (done: boolean): CheckTask => ({ id: 'c', name: 'Warm-up', sort: 0, type: 'check', done });
const numeric = (value: number, target: number): NumericTask =>
  ({ id: 'n', name: 'Push-ups', sort: 0, type: 'numeric', value, target, unit: 'sets' });
const pr = (weight: number): PRTask =>
  ({ id: 'p', name: 'Bench Press', sort: 0, type: 'pr', weight, reps: 5, unit: 'kg' });

describe('taskPercent', () => {
  it('check is all or nothing', () => {
    expect(taskPercent(check(true))).toBe(100);
    expect(taskPercent(check(false))).toBe(0);
  });

  it('numeric is proportional to target', () => {
    expect(taskPercent(numeric(0, 4))).toBe(0);
    expect(taskPercent(numeric(2, 4))).toBe(50);
    expect(taskPercent(numeric(4, 4))).toBe(100);
  });

  it('numeric caps at 100 when you overshoot', () => {
    expect(taskPercent(numeric(9, 4))).toBe(100);
  });

  it('numeric with a zero target is 0, not Infinity', () => {
    expect(taskPercent(numeric(3, 0))).toBe(0);
  });

  it('pr counts the moment any weight is logged', () => {
    expect(taskPercent(pr(0))).toBe(0);
    expect(taskPercent(pr(60))).toBe(100);
    expect(taskPercent(pr(200))).toBe(100);
  });
});

describe('dayPercent', () => {
  it('is the unweighted mean', () => {
    const tasks: Task[] = [check(true), numeric(2, 4), pr(0)];
    expect(dayPercent(tasks)).toBeCloseTo(50);
  });

  it('treats an empty day as 0, not 100', () => {
    expect(dayPercent([])).toBe(0);
  });

  it('does not weight a 4-task day differently from a 3-task day', () => {
    expect(dayPercent([check(true), check(false)])).toBe(50);
    expect(dayPercent([check(true), check(true), check(false), check(false)])).toBe(50);
  });
});

describe('qualifies', () => {
  it('rounds before comparing', () => {
    expect(qualifies(79.6, 80)).toBe(true); // rounds to 80
    expect(qualifies(79.4, 80)).toBe(false);
  });

  it('is inclusive at the threshold', () => {
    expect(qualifies(80, 80)).toBe(true);
  });
});
