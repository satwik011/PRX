# Design tokens

Nocturne, dark only. **Never invent a value** — if it is not here, ask.

Styling is **Uniwind + Tailwind v4**, which is CSS-first: there is no `tailwind.config.js`.
The tokens live in an `@theme` block in `src/global.css`, and this file is the source of
truth for that block. Change both together.

For anything that cannot take a `className` — chart props, `Progress.Bar` colors,
`react-native-calendars` `theme`, SVG fills — import from `src/theme/tokens.ts`.

## Colors — use the class, not the hex

| Class | Hex | Use |
|---|---|---|
| `bg-background` | `#161826` | screen ground |
| `text-foreground` | `#e9e9ed` | primary text |
| `bg-card` | `#232532` | cards, inputs, dialogs |
| `bg-primary` / `text-primary` / `border-primary` | `#9184d9` | accent: progress fill, active tab, links |
| `text-primary-foreground` | `#161826` | ink on accent fills |
| `bg-secondary` | `#a7a1db` | second accent |
| `bg-muted` / `border-muted` | `#3f424d` | card hairline, empty heatmap cells, tag bg |
| `bg-track` | `#3f424d` | progress-bar track (same value, different intent) |
| `text-muted-foreground` | `#b2b6ca` | secondary body text (13px) |
| `text-subtle` | `#9397ab` | eyebrows, tertiary text |
| `text-faint` | `#75798c` | inactive tabs, weekday headers, footnotes |
| `border-line` | `rgba(233,233,237,.16)` | hairlines, row separators |
| `bg-warning` | `#dc932e` | **partial** day |
| `text-warning-foreground` | `#211a08` | ink on amber |
| `text-destructive` | `#f97770` | auth errors |
| `bg-tag-bg` / `text-tag-fg` | `#423a6a` / `#f5f4ff` | "New PR" badge |
| `border-elev-md` | `#595d6c` | elev-md hairline |
| `border-elev-lg` | `#9397ab` | elev-lg hairline |

There is **no success color.** A completed day is `primary`. Never green.
Full 100→900 ramps and the deck-only `--color-section*` values are in `docs/design.md`;
they are not used in the app.

## Type

Inter 400 / 500 / 600, loaded in `src/app/_layout.tsx`.

Family classes are **`font-sans` (400), `font-heading` (500), `font-strong` (600)**.
They are *not* named `medium` / `semibold` — those collide with Tailwind's own
font-weight utilities.

| Class | Size / LH | Family | Color | Use |
|---|---|---|---|---|
| `text-display` | 44 / 44 | heading | foreground | streak count (add `leading-none`) |
| `text-h2` | 32 / 36 | heading | foreground | screen titles |
| `text-h4` | 20 / 22 | heading | foreground | dialog title, stat numerals |
| `text-card-title` | 17 / 20 | heading | foreground | card headings |
| `text-body` | 15 / 23 | sans | foreground | task names, form values |
| `text-sm` | 13 / 18 | sans | muted-foreground | card descriptions, quote (italic) |
| `text-label` | 12 / 16 | sans | foreground/70 | form labels |
| `text-meta` | 11 / 14 | sans | subtle | "best 80 kg", legend, tags |
| `text-micro` | 10 / 12 | sans | faint | tab labels, weekday headers, calendar digits |

Eyebrow = `text-meta uppercase tracking-[0.08em] text-subtle`.
Card kicker = `font-heading text-micro uppercase tracking-[0.1em] text-primary`.

## Spacing

**The numeric scale is Tailwind's default 4px grid** — `p-2` is 8px, as everywhere else.
Nocturne's deck-scaled values map onto it almost exactly:

| Nocturne | 2.8 | 5.6 | 8.4 | 11.2 | 16.8 | 22.4 |
|---|---|---|---|---|---|---|
| Class | `1` (4) | `1.5` (6) | `2` (8) | `3` (12) | `4` (16) | `6` (24) |

Only the smallest step differs, by 1px. Fighting Tailwind's scale to recover that pixel
would cost the entire standard utility vocabulary.

Nocturne's fixed layout values are **named** tokens:

| Class | Value |
|---|---|
| `px-screen` | 18 |
| `pt-screen-top` | 58 |
| `gap-card-gap` / `mb-card-gap` | 14 |
| `gap-task-gap` | 10 |

Screen bottom padding is `pb-3` (12).

## Radius

`rounded-sm` 4 · `rounded-md` 8 (buttons, inputs, cards) · `rounded-lg` 14 (dialogs) ·
`rounded-pill` 999 (progress bars, week bars, chips). Heatmap cells use `rounded-sm`;
tags use `rounded-[6px]`.

## Elevation

| Token | Classes / style |
|---|---|
| `elev-sm` | `border border-muted` — **no shadow**. Every card uses this. |
| `elev-md` | `border border-elev-md` + `elevation.md` from `theme/tokens.ts` |
| `elev-lg` | `border border-elev-lg` + `elevation.lg` — dialogs only |

## Button variants

| Variant | Classes |
|---|---|
| `primary` | `border border-primary` + `text-primary`, **transparent fill** |
| `secondary` | `border border-line` + `text-foreground` |
| `ghost` | `text-primary`, `px-1` |
| `icon` | `h-9 w-9 p-0` |
| disabled | `opacity-45` |

Base: `flex-row items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-heading text-[14px]`.

---

## ⚠️ Gotcha list — check every one before calling UI work done

Each item visibly breaks the design if you get it wrong. Verified rendering correctly in
the Phase 0 spike (commit `0e1b0c7`).

1. **Cards are `border border-muted` with NO shadow.** `elev-sm` is a hairline.
2. **Primary buttons are OUTLINED, not filled.**
3. `Progress.Bar` needs `borderWidth={0}` — the library defaults to a 1px border.
4. `Progress.Bar` needs `width={null}` to flex; a number pins it.
5. `react-native-calendars` defaults to a **white** background. Set `theme.calendarBackground`.
6. Week bars need a `bg-track` pill behind them — gifted-charts has no unfilled track.
7. Partial days are **amber**, never green, never red.
8. Three distinct muted text weights (`muted-foreground` / `subtle` / `faint`). Do not collapse them.
9. Progress tracks are `bg-track`; fills are `bg-primary`; both `rounded-pill`.
10. `<FadedRule />` fades over 48px at each end. In-card row separators are **solid**.
11. Eyebrows are `text-meta uppercase tracking-[0.08em] text-subtle`.
12. Streak numeral is `font-heading text-display leading-none`.
13. Nothing uses `--color-section*`.
14. Never use `font-medium` / `font-semibold` for a family — they are weight utilities.
    The families are `font-heading` and `font-strong`.
