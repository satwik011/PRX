# Design tokens

Nocturne, dark only. Never invent a value — if it is not here, ask.
Code references the **alias**, not the raw hex.

## Aliases (use these)

| Alias | Hex | HSL | Use |
|---|---|---|---|
| `background` | `#161826` | `232 27% 12%` | screen ground |
| `foreground` | `#e9e9ed` | `240 10% 92%` | primary text |
| `card` | `#232532` | `232 18% 17%` | cards, inputs, dialogs |
| `primary` | `#9184d9` | `249 53% 68%` | accent: progress fill, active tab, links |
| `primary-foreground` | `#161826` | `232 27% 12%` | ink on accent fills |
| `secondary` | `#a7a1db` | `246 45% 75%` | second accent |
| `muted` / `track` | `#3f424d` | `227 10% 27%` | progress tracks, empty heatmap cells, card hairline, tag bg |
| `muted-foreground` | `#b2b6ca` | `230 18% 75%` | secondary body text (13px) |
| `subtle-foreground` | `#9397ab` | `230 12% 62%` | eyebrows, tertiary text |
| `faint-foreground` | `#75798c` | `230 9% 50%` | inactive tabs, weekday headers, footnotes |
| `border` | `rgba(233,233,237,0.16)` | `240 10% 92% / .16` | hairlines, row separators |
| `warning` | `#dc932e` | `35 71% 52%` | **partial** day |
| `warning-foreground` | `#211a08` | `39 78% 8%` | ink on amber |
| `destructive` | `#f97770` | `3 92% 71%` | auth errors |
| `tag-accent-bg` | `#423a6a` | `250 29% 32%` | "New PR" badge bg |
| `tag-accent-fg` | `#f5f4ff` | `245 100% 98%` | "New PR" badge text |
| `elev-md-border` | `#595d6c` | `227 10% 39%` | elev-md hairline |
| `scrim` | `#292b31` @ 50% | `225 9% 18%` | dialog backdrop |

There is **no success color.** A completed day is `primary`. Never green.
The full 100→900 ramps and the deck-only `--color-section*` values are in
`docs/design.md`; they are not used in the app.

## Type

Inter 400 / 500 / 600 via `@expo-google-fonts/inter`.
Headings: weight 500, `lineHeight` ×1.12, `letterSpacing` −0.015em.

| Name | Size / LH | Weight | Color | Use |
|---|---|---|---|---|
| `display` | 44 / 44 | 500 | foreground | streak count |
| `h2` | 32 / 36 | 500 | foreground | screen titles |
| `h4` | 20 / 22 | 500 | foreground | dialog title |
| `stat` | 18–20 / 22 | 500 | primary | today %, PR best |
| `card-title` | 17 / 20 | 500 | foreground | card headings |
| `body` | 15 / 23 | 400 | foreground | task names, form values |
| `sm` | 13 / 18 | 400 | muted-foreground | card descriptions, quote (italic) |
| `label` | 12 / 16 | 400 | foreground @ 70% | form labels |
| `meta` | 11 / 14 | 400 | subtle-foreground | "best 80 kg", legend, tags |
| `micro` | 10 / 12 | 400 | faint-foreground | tab labels, weekday headers, calendar digits |
| `eyebrow` | 11 / 14 | 500 | subtle-foreground | **UPPERCASE, +0.08em** — date above screen titles |
| `kicker` | 10 / 12 | 500 | primary | **UPPERCASE, +0.1em** — card kickers |

## Spacing

Scale (rounded to 4pt from Nocturne's deck-scaled values — deliberate, do not "fix"):

`1:3` · `2:6` · `3:8` · `4:12` · `6:16` · `8:24`

Fixed layout values, read off the mockup:

| Context | Value |
|---|---|
| Screen padding | `58 / 18 / 12` (top / horizontal / bottom) |
| Auth screen horizontal | 24 |
| Gap between stacked cards | 14 |
| Gap between task cards | 10 |
| Tab bar padding | `8 / 4 / 10` |

## Radius

`sm: 4` · `md: 8` (buttons, inputs, cards) · `lg: 14` (dialogs) · `pill: 999`
(progress bars, week bars, chips) · heatmap cells: `5` · tags: `6`

## Elevation

| Token | Implementation |
|---|---|
| `elev-sm` | `borderWidth: 1, borderColor: muted` — **no shadow**. Every card uses this. |
| `elev-md` | `borderWidth: 1, borderColor: elev-md-border`, iOS `offset {0,6} radius 9 opacity .55`, Android `elevation: 6` |
| `elev-lg` | `borderWidth: 1, borderColor: subtle-foreground`, iOS `offset {0,16} radius 20 opacity .65`, Android `elevation: 16` — dialogs only |

## Button variants

| Variant | Spec |
|---|---|
| `primary` | **accent text + accent 1px border, transparent fill.** Press: accent @12%, active @22% |
| `secondary` | border = `border`. Press: foreground @7%, active @14% |
| `ghost` | accent text, `paddingHorizontal: 3`. Press: accent @10% |
| `icon` | 36 × 36, no padding |
| `disabled` | `opacity: 0.45` |

Base: gap 6, 14/1.2 weight 500, padding `6 / 10`, radius `md`.

---

## ⚠️ Gotcha list — check every one before calling UI work done

These are the things that get built wrong confidently. Each one visibly breaks the design.

1. **Cards are a 1px `muted` border with NO drop shadow.** `elev-sm` is a hairline.
2. **Primary buttons are accent-OUTLINED, not accent-filled.**
3. `Progress.Bar` needs `borderWidth={0}` — the library defaults to a 1px border.
4. `Progress.Bar` needs `width={null}` to flex; a number pins it.
5. `react-native-calendars` defaults to a **white** background. Set `theme.calendarBackground` to `card`.
6. Week bars need a `muted` track pill rendered behind them — gifted-charts has no unfilled track.
7. Partial days are **amber**, never green, never red.
8. Three distinct muted text weights exist (`muted` / `subtle` / `faint`). Do not collapse them into one grey.
9. Progress tracks are `muted`; fills are `primary`; both fully pill-rounded.
10. `<FadedRule />` fades to transparent over 48px at each end. In-card row separators are **solid** — do not fade those.
11. Eyebrow labels are 11px UPPERCASE +0.08em `subtle-foreground`.
12. Streak numeral is 44px weight 500 `lineHeight: 1`.
13. Nothing uses `--color-section*`.
