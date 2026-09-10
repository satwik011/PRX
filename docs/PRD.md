# PRD — Gym Progress Tracker

> **Contracts live in `.claude/rules/`** — tokens, component signatures, domain math, schema,
> library props. This document holds product scope, the decisions behind the build, phases
> and open questions. Nothing here is restated there, and nothing there is restated here.

---

## 1. Product

### Problem

Gym progress dies in three places: people forget what they did last session, they can't see
whether they're actually consistent, and they don't know if they're getting stronger.
Existing apps solve one of the three and bury it under social feeds and paywalls.

### What this is

A daily-plan tracker with a gym-shaped core. Pick a day template, the app materialises that
day's task list, you check things off during the session, and it turns that into a
completion percentage, a streak, and a personal-record history.

The task model is deliberately generic — **checklist**, **numeric target**, **PR** — so the
same app works for a rest day (walk 20 min, 8 glasses of water, mobility) as for a lifting
day. Only the PR type is gym-specific.

### Target user

Someone training 3–6× a week who already knows what they want to do and wants the smallest
possible amount of friction between the set and the log. Satwik is user zero.

### v1 does

- Email/password account
- A **template library** — build a day plan once, reuse it forever. Duplicate any template
  to customise it without touching the original or days already logged against it
- Day plans with tasks of three types
- A "today" screen you log against during the session
- **Plan lock** — the day's plan freezes at a configured morning hour, so you can't
  retroactively lower the bar
- Completion %, current streak, best streak, week bars
- Calendar heatmap over 7 / 30 / 90 days, plus a daily log list
- Derived personal records per exercise with history
- Settings: streak threshold, plan lock hour, template management
- Weights in kg
- **Works fully offline** — the gym is a basement

### v1 does not

No social or sharing. No exercise library or form videos. No rest timer. No wearable or
HealthKit integration. No body-weight or measurement tracking. No plate calculator. No
notifications. No light theme. No lb/kg toggle.

---

## 2. Stack decisions

Versions and install commands: `.claude/rules/libraries.md`.

| Concern | Choice | Why |
|---|---|---|
| Runtime | Expo managed + expo-router | File-based routing gives the tab group for free; EAS has a free build queue |
| Styling | Uniwind 1.12 + Tailwind v4 | NativeWind v5 is pre-release and v4 predates RN 0.86. Uniwind is a drop-in for the same className API, verified on SDK 57 |
| Components | react-native-reusables | shadcn-for-RN: you copy the component in and own it. No runtime dep, no theme to fight |
| Server state | TanStack Query | Caching, retry, optimistic task toggles |
| Client state | Zustand | Session + settings only; everything else is query state |
| Local DB | expo-sqlite + Drizzle | Local source of truth, typed queries, migrations |
| Backend | Supabase free | Postgres + Auth + RLS + Realtime in one |
| Charts | react-native-gifted-charts | Declarative props, no Skia. LineChart free for later PR trends |
| Calendar | react-native-calendars | Pure JS, Expo-compatible, actively maintained; `dayComponent` gives full cell control while the library owns the grid math |
| Progress | react-native-progress | One line |

### Free-tier reality

500 MB database · 1 GB storage · 5 GB egress · 50k MAU · 2 active projects ·
**free projects pause after ~1 week of inactivity.**

That last line is the strongest argument for local-first. The user never waits on Supabase
to see their own data, so a pause is invisible and resolves on the next sync. Data volume is
a non-issue: one user logging 6 tasks/day for a year is ~2,200 rows.

### Rejected

| Option | Why not |
|---|---|
| NativeWind (v4 or v5) | v5 is pre-release; v4 predates RN 0.86. Superseded by Uniwind |
| Gluestack UI v2 | Faster to first screen, but opinionated styling we'd fight to match Nocturne's outlined buttons and hairline cards |
| Tamagui | Excellent perf, heavy compiler setup, more than this needs |
| Unistyles 3 / Uniwind | Fastest runtime, fewest prebuilt components — we'd hand-build most primitives |
| Firebase | Generous free tier, but no SQL; a worse fit for the day/task relational model and the derived PR queries |
| No backend at all | The auth screens are already designed and multi-device continuity is worth the cost now |
| Victory Native XL | Needs Skia + Reanimated + Gesture Handler, and you compose charts from primitives — the opposite of "easier" for two simple charts |
| react-native-chart-kit | Its built-in `ContributionGraph` is tempting, but the project is largely unmaintained and can't render day-number cells |
| Hand-built `View` charts | Fewer deps, but you own month-grid math, leading-blank offsets, animation and label layout |

---

## 3. Screens and acceptance

Component composition per screen: `.claude/rules/components.md`.

Common: dark ground, screen padding `58 / 18 / 12`, content scrolls, fixed bottom tab bar.

**Login / Register** — states: idle · submitting · error · offline (submit disabled).
*Accept:* a valid login lands on Dashboard; the session survives a cold start.

**Dashboard** — eyebrow date, "Welcome back, {name}!", quote of the day, streak card,
today card, week card.
*Accept:* streak and week bars recompute locally the instant a task changes on Today — no
refetch, no spinner.

**Today** — select template, toggle check, ± numeric, type weight/reps, add ad-hoc task.
States: no template chosen · locked (chips disabled, add-task replaced by a disabled
"Locked — plan set for 8 AM") · normal.
*Accept:* every mutation writes to SQLite and updates the header percent within one frame;
killing the app mid-session loses nothing.

**History** — range control, heatmap card, daily-log card (last 8 rows).
*Accept:* switching range re-renders from local data with no network call.

**PRs** — one card per exercise: name, best, rule, up to 4 recent entries.
*Accept:* logging a heavier weight today moves that exercise's best immediately.

**Settings** — streak goal, plan lock time, templates (tapping through to the library),
log out.
*Accept:* changing the threshold re-derives streaks everywhere without a restart.

**Templates / Template detail** — list with task count and "last used"; open, duplicate
(deep-copy, opens as "{name} copy"), soft delete. Detail: rename, add/edit/reorder/delete
tasks. Seeded templates carry a quiet "Preset" tag.
*Accept:* editing a template **never** changes a day already logged against it — verify by
editing Chest Day and confirming yesterday's log is byte-identical.
*Accept:* duplicating produces an independent template; editing the copy leaves the original
untouched.

---

## 4. Decisions taken

1. **Units → kg.** Ship kg-only. The `unit_system` column and per-task `unit` string exist,
   so a toggle later is a settings change, not a migration.
2. **Templates are a library, and editable.** Full CRUD in v1 plus **duplicate** —
   deep-copying tasks so you can start from a preset and customise it. This is what stops
   you re-entering the same plan every morning.
3. **Quote of the day → bundled locally.** Static list in `lib/content/quotes.ts` picked by
   day-of-year. No network dependency for decoration. A `quotes` table is deliberately
   absent from v1.
4. **Day key → plain local calendar date.** Midnight is midnight; a 00:30 session belongs
   to the new day. No 4 AM offset, no timezone shifting.
5. **Styling → Uniwind + Tailwind v4**, verified on SDK 57 in the Phase 0 spike.

## 5. Open questions

**Do not guess these.** `.claude/rules/domain.md` flags both of the first two at the point
of implementation.

1. **First open after lock hour.** Open the app at 11 AM with no day log — is the day already
   locked (can't pick a template, so unusable) or does creating the log start it unlocked?
   Proposal: the lock applies only to a day log that already exists; creating one after the
   lock hour locks it immediately.
3. **Account deletion / export.** Needed for App Store review. Cheap now (a Supabase RPC
   plus a settings row), expensive to retrofit.

---

## 6. Phases

| Phase | Scope | Done when |
|---|---|---|
| **0** ✅ | Styling spike: Uniwind + Tailwind v4 + Inter, Nocturne `@theme`, `theme/tokens.ts`, token reference screen | **Done** — commit `0e1b0c7`, verified rendering on device |
| **1** | Data spine, no UI: expo-sqlite + Drizzle, `lib/repo/`, `lib/domain/` + unit tests, seed templates | `npm test` green, especially the streak edge cases |
| **2** | Today screen, full vertical slice: three task types, template chips, progress, add-task dialog, plan lock, real persistence | You log a real session on your phone and it survives a restart |
| **3** | Read screens: Dashboard, History, PRs. Charts land here (gifted-charts, calendars, progress) | Numbers match hand-checked fixtures |
| **4** | Accounts & sync: Supabase, RLS, auth screens, outbox, sync worker | Two devices converge; airplane mode changes nothing |
| **5** | Templates & settings: library CRUD + duplicate, settings screens | Editing a template leaves logged days byte-identical |
| **6** | Polish & ship: gotcha-list pass, empty/offline states, icons, EAS build | The 14-item list in `tokens.md` passes on a real device |

Sync sits deliberately late: the app is fully useful before it, and it is the phase most
likely to consume a week quietly.

---

## Sources

- [React Native Reusables](https://reactnativereusables.com/) · [repo](https://github.com/founded-labs/react-native-reusables)
- [NativeWind v5 — pre-release notice](https://www.nativewind.dev/v5/getting-started/installation)
- [Supabase free-tier limits, 2026](https://uibakery.io/blog/supabase-pricing) · [Auth with React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native) · [Expo: Using Supabase](https://docs.expo.dev/guides/using-supabase/)
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) · [BarChart props](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/BarChart/BarChartProps.md)
- [react-native-calendars](https://github.com/wix/react-native-calendars) · [react-native-progress](https://github.com/oblador/react-native-progress)
- [Best React Native UI component libraries, 2026](https://blog.logrocket.com/best-react-native-ui-component-libraries/)
