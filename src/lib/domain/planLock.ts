import type { Settings } from './types';

/**
 * A day's plan freezes at the configured morning hour so you cannot
 * retroactively lower the bar. Locked means: no template switching, no adding
 * tasks. Logging progress stays open all day.
 *
 * The lock applies only to a day log that ALREADY EXISTS. Creating one after
 * the lock hour is still an open question (see docs/PRD.md §5) — this function
 * takes `exists` explicitly so the caller cannot fudge it.
 */
export function isPlanLocked(
  exists: boolean,
  settings: Settings,
  now: Date = new Date(),
): boolean {
  if (!exists) return false;
  return now.getHours() >= settings.planLockHour;
}

/** "8 AM" — for the lock banner. */
export function formatLockHour(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
}
