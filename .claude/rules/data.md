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
7. **`weekly_schedule` drives Today, it does not own it.** When today has no log and its
   weekday names a template, `useToday` materialises that template once. It never fires
   over an existing log, so it cannot overwrite a session in progress or a manual
   override. Changing the schedule never rewrites a logged day.
8. Type-specific columns are nullable on one table by design — a task can be edited into a
   different type, and every query is "all tasks on this day". Do not split into three tables.
9. The quote of the day is **not** in the database. Bundled in `lib/content/quotes.ts`,
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
| `src/lib/repo/schedule.ts` | `getSchedule` / `setScheduleDay` — weekday index (0 = Sunday) to template id |
| `drizzle/` | generated migrations — **commit these**, they are the schema history |

Until auth lands in Phase 4 every row carries `user_id = 'local'` (`LOCAL_USER_ID`).

`daySummaries(days)` returns one entry per day **including days with no log**, because the
streak functions need an unbroken oldest-first sequence — a gap would silently end a streak.

Regenerate migrations after any schema change: `npm run db:generate`.

## Web storage — sql.js over IndexedDB

**PRX ships as a PWA, and web is the primary target.** Native iOS is blocked
(Xcode 16.1 cannot build SDK 57) and TestFlight costs $99/yr, so the browser is
how this reaches phones. Android native still works.

### Why not expo-sqlite's web build

It needs `SharedArrayBuffer`, which requires the page to be cross-origin
isolated: COOP/COEP headers on the dev server *and* the host, no cross-origin
asset ever, and `COEP: credentialless` — which **Safari does not support**.
iOS Safari is the delivery target. Expo also documents its web support as alpha.
Too long a chain to hang the only delivery mechanism on.

`sql.js` is SQLite compiled to **single-threaded** WASM. No SharedArrayBuffer,
no isolation, no headers, works in Safari.

### The split

| | Native | Web |
|---|---|---|
| Engine | expo-sqlite | sql.js (WASM) |
| Drizzle driver | `drizzle-orm/expo-sqlite` | `drizzle-orm/sql-js` |
| Persistence | file on disk | whole DB exported into IndexedDB as one blob |
| Migrations | drizzle expo migrator | applied by hand from the journal, tracked in `__drizzle_migrations` |
| Backup file I/O | expo-sharing + document-picker | Blob download + `<input type=file>` |

| File | Role |
|---|---|
| `src/db/client.ts` / `.web.ts` | the one database handle per platform |
| `src/db/ready.ts` / `.web.ts` | `useDatabaseReady()` — migrations, and boot on web |
| `src/db/persist.web.ts` | IndexedDB blob read/write |
| `src/lib/backup/file.ts` / `.web.ts` | export/import plumbing |

Metro resolves `.web.ts` over `.ts` automatically. **Every repo function, all
business logic and the whole domain layer are shared** — the platform split stops
at `src/db/` and the two backup files. That is what sealing the repo interface
bought.

`sql.js` loads `public/sql-wasm.wasm`, copied there by a `postinstall` script so
it is same-origin and cacheable offline.

### ⚠️ Writes are not durable until persisted

sql.js holds the database in memory. `db` in `client.web.ts` is a Proxy that hooks
the `then` of `insert` / `update` / `delete` builders, so the export to IndexedDB
fires **after** the statement resolves — scheduling it when the builder is created
would race the write it exists to capture. Debounced 400ms, and flushed on
`pagehide` and `visibilitychange`.

**Never call `db.insert` / `update` / `delete` outside `lib/repo`.** That is
precisely how a write escapes the persist hook and vanishes on refresh.
`src/lib/dev/seedHistory.ts` is the one exception, and it is dev-only.

### No COOP/COEP headers — deliberately

Do not add them "for SQLite". Nothing needs them now, and `require-corp` would
break silently the moment any cross-origin asset (a CDN font, an image) is added.
`metro.config.js` carries a comment saying so.

### Still true from before

Supabase remains the one backend for both platforms (Phase 4). The anon key is
public in a web bundle, so **RLS is the entire security boundary** — test every
policy as a non-owner before anyone else gets a link. Browser storage is
evictable, so the local database is a cache: eviction must degrade to a
re-download, never to data loss. Until Supabase lands, Settings → Backup is the
only safety net.

## Debt cleared before Phase 5

~~`listDayLogs` runs one query per day log~~ — **fixed.** Both list functions now
load every day's tasks in one `inArray` query. `listTemplates` got the same
treatment.

~~Two Drizzle types leak past the repo interface~~ — **fixed.** `TemplateWithTasks`
became the domain type `Template`, and `updateTask` now takes a domain `Task`
instead of a column patch. No storage type appears anywhere in `src/hooks`,
`src/components` or `src/app`.

## RLS

Every synced table. `auth.uid() = user_id`; child tables go through the parent:

```sql
using (auth.uid() = (select user_id from day_logs where id = day_log_id))
```

**Enable RLS before inserting a single row.**

## Auth

Supabase email/password. Session in `expo-secure-store` via a **chunking adapter** —
Supabase sessions exceed SecureStore's 2KB limit and will silently fail without it.
