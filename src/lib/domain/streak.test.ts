import { describe, expect, it } from 'vitest';
import { bestStreak, currentStreak } from './streak';
import type { DaySummary } from './types';

/** Oldest first, last entry is today. 100 = hit, 0 = missed. */
const days = (...percents: number[]): DaySummary[] =>
  percents.map((percent, i) => ({ day: `2026-09-${String(i + 1).padStart(2, '0')}`, percent }));

const T = 80;

describe('currentStreak', () => {
  it('counts consecutive qualifying days ending today', () => {
    expect(currentStreak(days(0, 100, 100, 100), T)).toBe(3);
  });

  it('does NOT break when today is still in progress', () => {
    // 12 hit days, then today at 0% because you have not been to the gym yet.
    const seq = days(...Array(12).fill(100), 0);
    expect(currentStreak(seq, T)).toBe(12);
  });

  it('counts today once it qualifies', () => {
    const seq = days(...Array(12).fill(100), 100);
    expect(currentStreak(seq, T)).toBe(13);
  });

  it('still breaks on a missed YESTERDAY even if today is in progress', () => {
    expect(currentStreak(days(100, 100, 0, 0), T)).toBe(0);
  });

  it('is 0 when nothing qualifies', () => {
    expect(currentStreak(days(0, 0, 0), T)).toBe(0);
  });

  it('is 0 for an empty history', () => {
    expect(currentStreak([], T)).toBe(0);
  });

  it('respects a partial day below the threshold', () => {
    expect(currentStreak(days(100, 70, 100), T)).toBe(1);
  });

  it('honours a lower threshold', () => {
    expect(currentStreak(days(100, 70, 100), 70)).toBe(3);
  });
});

describe('bestStreak', () => {
  it('finds the longest run anywhere in the window', () => {
    expect(bestStreak(days(100, 100, 100, 0, 100, 100), T)).toBe(3);
  });

  it('handles a run that ends at the last day', () => {
    expect(bestStreak(days(100, 0, 100, 100, 100, 100), T)).toBe(4);
  });

  it('is 0 when nothing qualifies', () => {
    expect(bestStreak(days(0, 0), T)).toBe(0);
  });
});
