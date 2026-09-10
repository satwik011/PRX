import { describe, expect, it } from 'vitest';
import { formatLockHour, isPlanLocked } from './planLock';
import { DEFAULT_SETTINGS } from './types';

const at = (hour: number) => new Date(2026, 8, 10, hour, 0);
const s = DEFAULT_SETTINGS; // planLockHour 8

describe('isPlanLocked', () => {
  it('is open before the lock hour', () => {
    expect(isPlanLocked(true, s, at(7))).toBe(false);
  });

  it('locks exactly on the hour', () => {
    expect(isPlanLocked(true, s, at(8))).toBe(true);
  });

  it('stays locked for the rest of the day', () => {
    expect(isPlanLocked(true, s, at(23))).toBe(true);
  });

  it('never locks a day that has no log yet', () => {
    expect(isPlanLocked(false, s, at(23))).toBe(false);
  });

  it('respects a different lock hour', () => {
    expect(isPlanLocked(true, { ...s, planLockHour: 9 }, at(8))).toBe(false);
  });
});

describe('formatLockHour', () => {
  it('formats morning hours', () => {
    expect(formatLockHour(7)).toBe('7 AM');
    expect(formatLockHour(9)).toBe('9 AM');
  });

  it('handles noon and midnight', () => {
    expect(formatLockHour(12)).toBe('12 PM');
    expect(formatLockHour(0)).toBe('12 AM');
  });
});
