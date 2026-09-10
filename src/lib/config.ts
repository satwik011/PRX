/**
 * Build-time switches. Kept out of lib/domain so the domain stays pure and
 * testable — a rule that reads __DEV__ cannot be unit tested.
 */

/**
 * The plan lock freezes today's template and task list at the configured hour.
 * That is correct in production and actively annoying in development, where you
 * are usually picking templates at 3pm.
 *
 * To exercise the locked UI in dev, flip this to `true` temporarily.
 * The rule itself (lib/domain/planLock.ts) is unchanged and still under test.
 */
export const PLAN_LOCK_ENABLED = !__DEV__;
