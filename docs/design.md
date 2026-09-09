# Design decisions — Nocturne → React Native

> **Current token values live in `.claude/rules/tokens.md`.** That file is the single source
> of truth for anything the app uses. This document holds the *why*, plus the parts of the
> Nocturne system the app doesn't use. If a value appears in both, tokens.md wins — and that
> is a bug to fix, not a fact to work around.

Source: the Claude Design mockup `Gym Tracker.dc.html`, design system **Nocturne**.
Target frame 390 × 844. **Dark only** — Nocturne has no light palette, so there is no theme
switcher to build.

## Decisions

### Spacing was rounded to a 4pt grid

Nocturne's scale is deck-scaled off a 2px base with a 1.4× multiplier, producing
2.8 / 5.6 / 8.4 / 11.2 / 16.8 / 22.4px. React Native can't hint sub-pixel values cleanly,
so the app uses 3 / 6 / 8 / 12 / 16 / 24.

This is a deliberate divergence. Recording it here so it doesn't read as drift later and
get "corrected" back to the CSS values.

### Elevation became borders

React Native has no `box-shadow` with a spread ring. Nocturne's three shadows are
ring-plus-ambient; each splits into a border plus a platform shadow.

The important consequence: **`elev-sm` is a hairline, not a shadow.** Every card in the app
uses it. Adding a drop shadow to cards is the single fastest way to make the build look
unlike the design, which is why it's item 1 on the gotcha list.

### Primary buttons stayed outlined

Nocturne's `.btn-primary` is accent text on an accent 1px border with a transparent fill —
a tinted ghost, not a filled button. It looks like a mistake next to most design systems.
It isn't. Keep it.

### Weights are kg

The mockup hardcodes `lb`. Shipping kg-only; the `unit_system` column and per-task `unit`
string exist so the toggle is a settings change later, not a migration.

## The parts of Nocturne the app doesn't use

Kept here so nobody re-derives them, and so it's clear the omissions were deliberate.

### Unused ramp steps

Only ~16 of Nocturne's 40 colors reach the app. The full ramps below are the **original
Nocturne export, frozen** — a historical record, not a live reference. If the app's palette
is ever retuned, retune `tokens.md` and leave this table alone.

| | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| neutral | `#f3f5fe` | `#e4e7f5` | `#cfd3e5` | `#b2b6ca` | `#9397ab` | `#75798c` | `#595d6c` | `#3f424d` | `#292b31` |
| accent | `#f5f4ff` | `#e7e5fe` | `#d2cefd` | `#b5abfc` | `#968ae0` | `#796cbf` | `#5d5294` | `#423a6a` | `#2b2741` |
| accent-2 | `#f5f4ff` | `#e7e5fe` | `#d2cefd` | `#b5afe8` | `#9690c9` | `#7972a9` | `#5c5783` | `#423e5d` | `#2b293a` |

Steps 100–300 are a light-theme reserve. If a light theme ever happens, they're the basis.

### Deck-only colors — never interface colors

`--color-section #262a60` · `--color-section-glow #353b80` · `--color-section-ghost #4c5397`

Nocturne uses these as slide-divider grounds in presentation contexts. They exist in the
CSS and must not reach the app.

### Classes not ported

| Class | Why |
|---|---|
| `.table` + row gradient rules | History and PR lists are card rows, not tables |
| `.nav`, `.nav-brand` | Desktop top nav; the app uses the bottom tab bar |
| `.lighten` (`mix-blend-mode`) | Decorative; no RN equivalent |
| `textarea.input` | No multiline field in v1 |

## NativeWind setup

`global.css` defines the aliases as HSL triplets under `:root`; `tailwind.config.js` maps
them via `hsl(var(--x))` and extends `borderRadius`, `spacing`, `fontFamily` and `fontSize`.
The values are in `.claude/rules/tokens.md`; the config is generated from them, and
`theme/tokens.ts` re-exports them for the places NativeWind can't reach (chart props,
`Progress.Bar` colors, `dayComponent` styles).

Pin **NativeWind v4**. v5 is pre-release and documented as not for production.

## Source

Design system tokens, component CSS and screen markup were extracted from the bundled
`Gym Progress Tracker.html` export. The domain logic in `.claude/rules/domain.md` is lifted
verbatim from that file's `DCLogic` class — it describes what the mockup actually does, not
a reconstruction.
