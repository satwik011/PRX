# PRX

@AGENTS.md

Offline-first gym / habit tracker. Expo + React Native. Dark theme only.

**The PWA is the primary target.** Native iOS is blocked — Xcode 16.1 cannot build
SDK 57, and TestFlight is $99/yr — so the browser is how this reaches phones.
Android native still works. `npx expo start --web` is the main dev loop.
Design system is **Nocturne**, from a Claude Design mockup — match it exactly.

## Stack

Installed: **Expo SDK 57** · React Native 0.86.3 · React 19.2.3 · expo-router ·
TypeScript 6 strict · Uniwind + Tailwind v4 · expo-sqlite + Drizzle (native) ·
**sql.js + IndexedDB (web)** · date-fns · lucide-react-native · vitest.
Path alias `@/*` → `./src/*`. App code lives in `src/`.

Storage is the only thing that differs per platform, and the split stops at
`src/db/` — see `.claude/rules/data.md`.

Styling: **Uniwind + Tailwind v4**, CSS-first — there is **no `tailwind.config.js`**;
tokens live in the `@theme` block of `src/global.css`. Fonts: Inter 400/500/600.

Not installed, and mostly not wanted — `libraries.md` records what was dropped and
why: react-native-reusables, react-native-progress, react-native-calendars,
react-native-gifted-charts, NativeWind. **Supabase** arrives in Phase 4.

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
   `lib/repo/`. The repository is the only layer that knows about storage — and its
   *exported types* must be domain types too, not Drizzle row types. Two known
   violations are listed in `data.md`; do not add a third.
3. **All reads come from SQLite.** No network in a render path, ever.
4. **All writes go through `lib/repo`.** On web, `db.insert/update/delete` are proxied
   so the database is exported to IndexedDB after each write — a call outside
   `lib/repo` escapes that hook and the write is lost on refresh.
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
npm install             # after any clone / pull touching package.json
npm start -- --web      # PRIMARY dev loop (prestart regenerates migrations)
npm start -- -c         # clear cache; needed after metro.config or global.css changes
npm run typecheck       # tsc --noEmit — run before handing over any change
npm test                # 56 domain tests
npx expo run:android    # native Android still builds
```

`npx expo run:ios` does **not** work on this machine (Xcode 16.1 vs SDK 57).

Native folders `ios/` and `android/` are **generated and gitignored** (Continuous Native
Generation). Never commit them; never hand-edit them — change `app.json` plugins instead.

## Definition of done

Typecheck clean · domain tests pass · checked against the gotcha list at the end of
`tokens.md` · no hardcoded colors or sizes outside `theme/`.
