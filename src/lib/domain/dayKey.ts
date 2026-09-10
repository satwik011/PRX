/**
 * The day key is the device's LOCAL calendar date — never UTC.
 *
 * `toISOString().slice(0, 10)` is a trap: it converts to UTC first, so in
 * IST (+05:30) every log before 05:30 local would be filed under the previous
 * day. The original mockup had this bug.
 *
 * Decision (see .claude/rules/domain.md): midnight is midnight. A session
 * logged at 00:30 belongs to the new day. No 4 AM offset.
 */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Shift a day key by whole days, staying in local time. */
export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/** Inclusive list of day keys ending at `end`, `count` entries long, oldest first. */
export function dayKeyRange(count: number, end: string = dayKey()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) keys.push(addDaysToKey(end, -i));
  return keys;
}
