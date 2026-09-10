# Data, storage and sync

Full ERD: `docs/schema.dbml` (paste into dbdiagram.io). This file is the contract.

## Layering — not negotiable

```
screens (app/) → hooks/ → lib/repo/ → SQLite  |  Supabase
```

- Screens and hooks **never** import the Supabase client or Drizzle.
- `lib/repo/` is the only layer that touches storage.
- **Reads always come from SQLite.** No network in a render path.
- **Writes go to SQLite first**, then append to `outbox`. Never write straight to Supabase.

## Sync

The worker in `lib/sync/` drains `outbox` oldest-first on: app foreground, reconnect
(`netinfo`), and after any mutation while online. Pull on the same triggers:
rows where `updated_at > sync_meta.last_synced_at`, upserted into SQLite.

**Conflict rule: last-write-wins per row on `updated_at`.** Single-user data — no CRDTs,
no merge UI. Do not build one.

Supabase free projects pause after ~1 week idle. Local-first is what makes that invisible;
never add a blocking network call that would expose it.

## Schema

```
profiles         (id uuid pk → auth.users, name, created_at)

user_settings    (user_id uuid pk, streak_threshold int d80, plan_lock_hour int d8,
                  unit_system text d'kg', updated_at)

templates        (id uuid pk, user_id, name, sort, is_seed bool,
                  copied_from uuid null, last_used_on date null,
                  updated_at, deleted_at null)

template_tasks   (id uuid pk, template_id, name, type, target num null,
                  unit text null, sort, updated_at, deleted_at null)

day_logs         (id uuid pk, user_id, day date, template_id uuid null,
                  locked_at null, updated_at, UNIQUE(user_id, day))

day_log_tasks    (id uuid pk, day_log_id, source_task_id uuid null,
                  name, type, sort,
                  done bool null, target num null, value num null,
                  unit text null, weight num null, reps int null,
                  updated_at)
```

Local-only, never synced: `outbox(id, entity, entity_id, op, payload, created_at, attempts)`
and `sync_meta(key, value)`.

`type` ∈ `check | numeric | pr`. SQLite: uuid→text, timestamptz→integer (epoch ms), numeric→real.

## Invariants

1. **`day_log_tasks` is a snapshot.** `name`, `type`, `target`, `unit` are *copied* from
   `template_tasks` when a template is applied. **Never refactor into a join** — that makes
   logged history mutate when a template is edited. `source_task_id` is provenance only.
2. **Personal records are derived**, never stored. `max(weight)` grouped by `name` over
   `type='pr' AND weight > 0`. Postgres view `v_personal_records`; mirror the query in SQLite.
   Adding a `personal_records` table creates a second source of truth that drifts.
3. **Duplicating a template deep-copies its tasks.** The copy is fully independent;
   `copied_from` is provenance only, never a live link.
4. **Seeded templates (`is_seed`) are not locked.** The UI nudges toward duplicating them.
5. **Soft deletes** (`deleted_at`) on templates and template tasks, so deletions sync
   instead of resurrecting.
6. `day` is a **local calendar date**, not a timestamp. One `day_logs` row per user per day.
7. Type-specific columns are nullable on one table by design — a task can be edited into a
   different type, and every query is "all tasks on this day". Do not split into three tables.
8. The quote of the day is **not** in the database. Bundled in `lib/content/quotes.ts`,
   picked by day-of-year.

## Where this lives (Phase 1)

| Module | Holds |
|---|---|
| `src/db/schema.ts` | Drizzle SQLite tables + `LOCAL_USER_ID` |
| `src/db/client.ts` | the one `openDatabaseSync` handle — **import only from `lib/repo/`** |
| `src/lib/repo/mappers.ts` | the single place a wide nullable row narrows into the `Task` union |
| `src/lib/repo/templates.ts` | `seedTemplatesIfEmpty` (idempotent), `listTemplates` |
| `src/lib/repo/dayLogs.ts` | `getDayLog`, `applyTemplate` (snapshot copy), `updateTask`, `listDayLogs`, `daySummaries` |
| `src/lib/repo/settings.ts` | `getSettings` (self-creating), `updateSettings` |
| `drizzle/` | generated migrations — **commit these**, they are the schema history |

Until auth lands in Phase 4 every row carries `user_id = 'local'` (`LOCAL_USER_ID`).

`daySummaries(days)` returns one entry per day **including days with no log**, because the
streak functions need an unbroken oldest-first sequence — a gap would silently end a streak.

Regenerate migrations after any schema change: `npm run db:generate`.

## RLS

Every synced table. `auth.uid() = user_id`; child tables go through the parent:

```sql
using (auth.uid() = (select user_id from day_logs where id = day_log_id))
```

**Enable RLS before inserting a single row.**

## Auth

Supabase email/password. Session in `expo-secure-store` via a **chunking adapter** —
Supabase sessions exceed SecureStore's 2KB limit and will silently fail without it.
