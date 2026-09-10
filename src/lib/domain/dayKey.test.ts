import { describe, expect, it } from 'vitest';
import { addDaysToKey, dayKey, dayKeyRange } from './dayKey';

describe('dayKey', () => {
  it('uses the LOCAL calendar date, not UTC', () => {
    // 00:30 local on 10 Sep. toISOString() would report 09 Sep in any timezone
    // ahead of UTC — the bug the original mockup shipped.
    expect(dayKey(new Date(2026, 8, 10, 0, 30))).toBe('2026-09-10');
  });

  it('treats 23:59 as the same day', () => {
    expect(dayKey(new Date(2026, 8, 10, 23, 59))).toBe('2026-09-10');
  });

  it('rolls at midnight — no 4 AM offset', () => {
    expect(dayKey(new Date(2026, 8, 11, 0, 0))).toBe('2026-09-11');
  });

  it('zero-pads', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDaysToKey', () => {
  it('moves forward and back', () => {
    expect(addDaysToKey('2026-09-10', 1)).toBe('2026-09-11');
    expect(addDaysToKey('2026-09-10', -1)).toBe('2026-09-09');
  });

  it('crosses month boundaries', () => {
    expect(addDaysToKey('2026-09-01', -1)).toBe('2026-08-31');
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('handles a leap day', () => {
    expect(addDaysToKey('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('dayKeyRange', () => {
  it('is oldest-first and ends on the given day', () => {
    expect(dayKeyRange(3, '2026-09-10')).toEqual(['2026-09-08', '2026-09-09', '2026-09-10']);
  });

  it('returns the right length for a 90-day window', () => {
    expect(dayKeyRange(90, '2026-09-10')).toHaveLength(90);
  });
});
