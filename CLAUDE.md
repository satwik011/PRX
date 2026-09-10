# PRX

@AGENTS.md

Offline-first gym / habit tracker. React Native + Expo. Dark theme only.
Design system is **Nocturne**, from a Claude Design mockup — match it exactly.

## Stack

Installed: **Expo SDK 57** · React Native 0.86.3 · React 19.2.3 · expo-router ·
TypeScript 6 strict. Path alias `@/*` → `./src/*`. App code lives in `src/`.

Styling: **Uniwind 1.12.0 + Tailwind v4**, verified on SDK 57. NativeWind is not used.
Tailwind v4 is CSS-first — there is **no `tailwind.config.js`**; tokens live in the
`@theme` block of `src/global.css`. Fonts: Inter 400/500/600.

Planned, **not yet installed** — check `libraries.md` before adding any of these:
react-native-reusables · lucide-react-native · TanStack Query · Zustand ·
expo-sqlite + Drizzle · Supabase · react-native-gifted-charts ·
react-native-calendars · react-native-progress · date-fns

## Which rules file to read

Read only what the task needs. Do not read `docs/` — those are for the human.

| Task | Read |
|---|---|
| Any UI work | `.claude/rules/tokens.md` |
| Building or changing a component | `+ components.md` |
| Building a screen | `+ components.md`, `+ domain.md` |
| Charts, calendar, progress bars | `+ libraries.md` |
| Percent / streak / PR / plan-lock logic | `domain.md` |
| Queries, schema, sync, offline | `data.md` |
| Adding a dependency | `libraries.md` |

## Hard rules

1. **Never guess a color, size, or spacing value.** Every one is in `tokens.md`. If it is
   not there, ask — do not invent.
2. **Screens and hooks never import Supabase or Drizzle.** They call a hook; the hook calls
   `lib/repo/`. The repository is the only layer that knows about storage.
3. **All reads come from SQLite.** No network in a render path, ever.
4. **All writes go to SQLite first**, then append to `outbox`. Never write straight to Supabase.
5. **`day_log_tasks` is a snapshot, not a reference.** Task name/type/target/unit are copied
   from the template at apply time. Never refactor this into a join — it would make logged
   history mutable when a template is edited.
6. **Personal records are derived, never stored.** `max(weight)` grouped by task name.
7. **Domain math lives in `lib/domain/` as pure functions** with no I/O, and is unit-tested.
   Never inline percent or streak math in a component.
8. Weights are **kg**. The `unit` column exists but v1 ships kg only.
9. **Everything must run on macOS and Windows.** `package.json` scripts stay
   cross-platform — no `rm -rf`, no `cp`, no `NODE_ENV=x cmd`, no unix-only chaining.
   Use `rimraf` / `cross-env` or a small node script. Import paths must match file
   name casing exactly; both dev machines are case-insensitive and will hide a mistake
   that breaks CI.

## Structure

```
src/app/            expo-router routes; presentational only
src/components/ui/  react-native-reusables primitives (owned, restyled once)
src/components/app/ our reusable components — see components.md
src/features/       screen-local pieces that are used exactly once
src/lib/repo/       the ONLY layer that touches storage
src/lib/domain/     pure functions, unit-tested
src/lib/sync/       outbox + worker
src/lib/content/    bundled static content (quotes, seed templates)
src/db/             Drizzle schema + migrations
src/theme/          tokens.ts, global.css, fonts
```

The template ships a demo app in `src/app/` and `src/components/`. Run
`npm run reset-project` to clear it before building real screens.

New shared component → `components/app/` and add it to `components.md`.
Used once → `features/<screen>/`.

## Commands

```bash
npm install             # after every clone / pull that touches package.json
npx expo start          # dev server
npx expo run:ios        # local dev-client build (generates ios/ via prebuild)
npm run typecheck       # tsc --noEmit
npm run lint
```

Native folders `ios/` and `android/` are **generated and gitignored** (Continuous Native
Generation). Never commit them; never hand-edit them — change `app.json` plugins instead.

## Definition of done

Typecheck clean · domain tests pass · checked against the gotcha list at the end of
`tokens.md` · no hardcoded colors or sizes outside `theme/`.
