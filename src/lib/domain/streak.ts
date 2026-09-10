import { qualifies } from './percent';
import type { DaySummary } from './types';

/**
 * Consecutive qualifying days ending today.
 *
 * The subtle rule: if TODAY does not qualify yet, start from yesterday instead
 * of returning 0. A day still in progress must never break a streak — you open
 * the app at 6am with 0% logged and your 12-day streak is still 12.
 *
 * `days` is oldest-first and the last entry is today.
 */
export function currentStreak(days: DaySummary[], threshold: number): number {
  if (!days.length) return 0;

  let i = days.length - 1;
  if (!qualifies(days[i].percent, threshold)) i--; // today in progress — skip, don't break

  let streak = 0;
  for (; i >= 0; i--) {
    if (!qualifies(days[i].percent, threshold)) break;
    streak++;
  }
  return streak;
}

/** Longest run of qualifying days anywhere in the window. */
export function bestStreak(days: DaySummary[], threshold: number): number {
  let best = 0;
  let run = 0;
  for (const d of days) {
    if (qualifies(d.percent, threshold)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}
