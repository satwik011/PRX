# PRX

Offline-first gym / habit tracker. React Native + Expo, dark theme only.

- **What we're building:** `docs/PRD.md`
- **Design decisions:** `docs/design.md` · current tokens: `.claude/rules/tokens.md`
- **Data model:** `docs/schema.dbml` (paste into [dbdiagram.io](https://dbdiagram.io))

PRX runs as a **PWA** — that is the primary target. Android native also builds.
Native iOS does not build on this machine (Xcode 16.1 vs Expo SDK 57).

## Setup on a new machine

```bash
git clone <repo-url> PRX && cd PRX
nvm use            # Node 22, per .nvmrc
npm install        # postinstall copies sql-wasm.wasm into public/
npm start -- --web # the main dev loop
```

`prestart` regenerates Drizzle migrations, so `npm start` is preferred over
`npx expo start` — the latter skips npm scripts and the app will fail to boot on a
missing `drizzle/` folder.

## Storage

| | Native | Web |
|---|---|---|
| Engine | expo-sqlite | sql.js (WASM) |
| Persistence | file on disk | whole DB blob in IndexedDB |

Metro picks `.web.ts` automatically. The split stops at `src/db/` — every repo
function, all domain logic and all screens are shared.

Data lives only on the device until Phase 8 adds accounts. **Settings → Backup**
exports a JSON file; that is the only safety net for now.

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

## Windows

The repo is cross-platform. Two things differ.

**What you can build.** iOS builds need macOS + Xcode, so on Windows you get Android,
web, and Expo Go — everything except an iOS native build. The JS is identical, so
day-to-day feature work is unaffected.

**One-time git config**, run inside the clone on the Windows machine:

```powershell
git config core.longpaths true    # node_modules blows past the 260-char limit
git config core.autocrlf false    # .gitattributes already forces LF; let it win
git config core.symlinks true     # some npm packages ship symlinks
```

`core.longpaths` is the one that bites: without it `git checkout` fails partway through
`node_modules`-adjacent paths with "Filename too long", and the error doesn't say why.

**Also enable Windows Developer Mode** (Settings → System → For developers) so symlinks
work without an elevated prompt.

**Node:** `nvm-windows` does not read `.nvmrc`, so run `nvm use 22` explicitly. The
`engines` field in `package.json` will warn on a mismatch either way.

**Android on Windows:** Android Studio + JDK 17, with `ANDROID_HOME` set. Then
`npx expo run:android`.

**Metro is slow on Windows** if your antivirus scans the project. Excluding the repo
folder and `%LOCALAPPDATA%\Temp` from real-time scanning makes a large difference.

## Working across multiple machines

- Node version is pinned in `.nvmrc`; `engines` in `package.json` will warn on a mismatch.
- Line endings are forced to LF by `.gitattributes` on every OS, so a file never shows as
  wholly rewritten just because it was saved on the other machine. `.editorconfig` keeps
  editors in line too.
- **Filenames are case-sensitive in git but not on macOS or Windows.** `import './Button'`
  against a file named `button.tsx` works on both your machines and breaks in CI or on
  Linux. Match the case exactly.
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
