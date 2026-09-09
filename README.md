# PRX

Offline-first gym / habit tracker. React Native + Expo, dark theme only.

- **What we're building:** `docs/PRD.md`
- **Design decisions:** `docs/design.md` · current tokens: `.claude/rules/tokens.md`
- **Data model:** `docs/schema.dbml` (paste into [dbdiagram.io](https://dbdiagram.io))

## Setup on a new machine

```bash
git clone <repo-url> PRX && cd PRX
nvm use            # Node 22, per .nvmrc
npm install
npx expo start     # then press i / a, or scan the QR
```

That's the whole checkout. Nothing else is machine-specific — `ios/` and `android/`
are generated, not committed.

## Local dev build

Native folders are produced by **Continuous Native Generation**: they're gitignored and
regenerated from `app.json` whenever needed.

```bash
npx expo run:ios       # generates ios/ and builds a dev client (macOS + Xcode)
npx expo run:android   # generates android/ and builds (Android Studio + JDK 17)
npx expo prebuild --clean   # force-regenerate both from app.json
```

Never hand-edit `ios/` or `android/` — the next prebuild discards it. Native config
goes in `app.json` under `plugins`.

## Working across multiple PCs

- Node version is pinned in `.nvmrc`; `engines` in `package.json` will warn on a mismatch.
- Line endings are normalised by `.gitattributes`, so no CRLF noise between machines.
- `package-lock.json` **is** committed — always `npm install` (not `npm i <pkg>`) after a
  pull that changes it, so every machine resolves identical versions.
- Native folders are never committed, so they can't drift.
- Commit and push before switching machines; there is no cloud sync of the working tree.

## Scripts

| Command | Does |
|---|---|
| `npm start` | Expo dev server |
| `npm run ios` / `android` / `web` | dev server targeting a platform |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` |
| `npm run reset-project` | clears the starter demo (run once, before real screens) |

## Conventions

`CLAUDE.md` is the entry point for AI-assisted work; it routes to `.claude/rules/*`.
Those files are the source of truth for tokens, component contracts, domain math and
the data model. `docs/` holds rationale and is not read during builds.
