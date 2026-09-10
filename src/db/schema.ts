import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * SQLite mirror of the Postgres model in docs/schema.dbml.
 * Type mapping: uuid -> text, timestamptz -> integer (epoch ms), numeric -> real,
 * date -> text (YYYY-MM-DD, local).
 *
 * Invariants live in .claude/rules/data.md. The two that constrain this file:
 *   - day_log_tasks is a SNAPSHOT, not a reference. Never refactor into a join.
 *   - personal records are DERIVED. There is deliberately no table for them.
 */

/** Until auth lands in Phase 4, every row belongs to this synthetic user. */
export const LOCAL_USER_ID = 'local';

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey(),
  streakThreshold: integer('streak_threshold').notNull().default(80),
  planLockHour: integer('plan_lock_hour').notNull().default(8),
  unitSystem: text('unit_system', { enum: ['kg', 'lb'] }).notNull().default('kg'),
  updatedAt: integer('updated_at').notNull(),
});

export const templates = sqliteTable(
  'templates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    sort: integer('sort').notNull().default(0),
    isSeed: integer('is_seed', { mode: 'boolean' }).notNull().default(false),
    /** Provenance only — a duplicate is fully independent of its origin. */
    copiedFrom: text('copied_from'),
    lastUsedOn: text('last_used_on'),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (t) => [index('templates_user_sort').on(t.userId, t.sort)],
);

export const templateTasks = sqliteTable(
  'template_tasks',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id').notNull().references(() => templates.id),
    name: text('name').notNull(),
    type: text('type', { enum: ['check', 'numeric', 'pr'] }).notNull(),
    target: real('target'),
    unit: text('unit'),
    sort: integer('sort').notNull().default(0),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (t) => [index('template_tasks_template_sort').on(t.templateId, t.sort)],
);

export const dayLogs = sqliteTable(
  'day_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    /** Local calendar date, YYYY-MM-DD. Never a timestamp. */
    day: text('day').notNull(),
    templateId: text('template_id'),
    lockedAt: integer('locked_at'),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [uniqueIndex('day_logs_user_day').on(t.userId, t.day)],
);

export const dayLogTasks = sqliteTable(
  'day_log_tasks',
  {
    id: text('id').primaryKey(),
    dayLogId: text('day_log_id').notNull().references(() => dayLogs.id),
    /** Provenance only. Null for ad-hoc tasks added on the day. */
    sourceTaskId: text('source_task_id'),
    /** Denormalised on purpose: renaming a template must not rewrite history. */
    name: text('name').notNull(),
    type: text('type', { enum: ['check', 'numeric', 'pr'] }).notNull(),
    sort: integer('sort').notNull().default(0),
    done: integer('done', { mode: 'boolean' }),
    target: real('target'),
    value: real('value'),
    unit: text('unit'),
    weight: real('weight'),
    reps: integer('reps'),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [
    index('day_log_tasks_log_sort').on(t.dayLogId, t.sort),
    index('day_log_tasks_type_name').on(t.type, t.name),
  ],
);

/** Local only — never synced. Every write appends here for the Phase 4 worker. */
export const outbox = sqliteTable('outbox', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  op: text('op', { enum: ['insert', 'update', 'delete'] }).notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
});

/** Local only. e.g. last_synced_at. */
export const syncMeta = sqliteTable('sync_meta', {
  key: text('key').primaryKey(),
  value: text('value'),
});
