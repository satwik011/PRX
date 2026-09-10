# Component contracts

Before building anything, check this list. If it is here, use it — do not build a parallel
version. If you add a shared component, add it here in the same change.

Shared → `components/app/`. Used exactly once → `features/<screen>/`.

## Primitives — `components/ui/` (react-native-reusables, owned and restyled once)

`Button` (variants `primary` / `secondary` / `ghost`, sizes `default` / `icon`, `full` prop) ·
`Input` · `Label` · `Card` (+ `CardHeader` / `CardTitle` / `CardContent`) · `Dialog` ·
`Checkbox` · `RadioGroup` · `Progress` · `Badge` · `Separator` · `Text` · `Skeleton`

Restyle once against `tokens.md`, then never touch again.

## App components — `components/app/`

| Component | Props | Used by |
|---|---|---|
| `ScreenHeader` | `eyebrow?, title` | all 5 tabs |
| `SectionCard` | `title?, action?, gap?, children` | all 5 tabs |
| `ProgressBar` | `percent, height=7, trackColor?, fillColor?` | Dashboard, Today ×2, task rows |
| `StatCard` | `icon, value, caption` | Dashboard (streak) |
| `TaskCard` | `task, locked, onChange` — dispatches on `task.type` | Today |
| `CheckTaskRow` | `task, onToggle` | TaskCard |
| `NumericTaskRow` | `task, onIncrement, onDecrement` | TaskCard |
| `PRTaskRow` | `task, previousBest, onChangeWeight, onChangeReps` | TaskCard |
| `Stepper` | `onDec, onInc, disabled` | NumericTaskRow |
| `TemplateChipRow` | `templates, activeId, disabled, onSelect` | Today |
| `SegmentedControl` | `options, value, onChange` | History, Settings ×2, Add-task |
| `WeekBarChart` | `days: {label, percent, isToday}[], threshold` | Dashboard |
| `CalendarHeatmap` | `days, threshold, rangeDays` | History |
| `HeatmapLegend` | — | History |
| `HistoryRow` | `label, sublabel, percent, threshold` | History |
| `PRGroupCard` | `name, bestLabel, history[]` | PRs |
| `TemplateCard` | `template, onOpen, onDuplicate` | Templates library |
| `TaskEditorRow` | `task, onChange, onDelete` | Template detail |
| `TagPill` | `variant: accent \| accent-2 \| neutral \| outline` | Today (New PR) |
| `FadedRule` | `inset=48` | History, PRs |
| `EmptyState` | `icon, title, body, action?` | History, PRs, Today, Templates |
| `OfflineBanner` | — (reads sync store) | app shell |
| `TabBar` | 5 items | `(tabs)/_layout` |
| `AuthFormLayout` | `icon?, title, subtitle, children, footer` | Login, Register |
| `FormField` | `label, error?, children` | Login, Register, Add-task |

## Screens → composition

| Screen | Composed of |
|---|---|
| Login | `AuthFormLayout`, `FormField`, `Input`, `Button` |
| Register | `AuthFormLayout`, `FormField` ×3, `Input`, `Button` |
| Dashboard | `ScreenHeader`, `StatCard`, `SectionCard` ×2, `ProgressBar`, `Button`, `WeekBarChart` |
| Today | `ScreenHeader`, `TemplateChipRow`, `SectionCard`, `ProgressBar`, `TaskCard` ×n, `Button`, `Dialog` |
| History | `ScreenHeader`, `SegmentedControl`, `SectionCard` ×2, `CalendarHeatmap`, `HeatmapLegend`, `FadedRule`, `HistoryRow` ×n |
| PRs | `ScreenHeader`, `PRGroupCard` ×n, `EmptyState` |
| Settings | `ScreenHeader`, `SectionCard` ×3, `SegmentedControl` ×2, `Separator`, `Button` |
| Templates | `ScreenHeader`, `TemplateCard` ×n, `Button`, `EmptyState` |
| Template detail | `ScreenHeader`, `TemplateEditor`, `TaskEditorRow` ×n, `Button` |

Templates and Template detail are pushed routes under `settings/`, **not new tabs.**
The tab bar stays at exactly 5 items.

## Composite specs

Values that live nowhere else.

**Task card** — `Card` + `elev-sm`, gap 10. Three bodies:
- *check* — row gap 12, whole row tappable: checkbox + name. Done dims the name.
- *numeric* — name left, `{value} / {target} {unit}` right (12px `muted-foreground`); below,
  `[−] [ProgressBar flex:1] [+]` gap 10, buttons are `Button size="icon"`.
- *pr* — name left (+ `TagPill` "New PR" when applicable), `best {n} kg` right
  (11px `muted-foreground`); below, two `FormField`s side by side gap 8 flex 1:
  "Weight (kg)" and "Reps", both numeric inputs.

**Streak card** — centered, padding `22 / 16`, gap 6, `elev-sm`. Flame icon 34×34 primary,
count at `display`, then `{n} day streak · best {m}` at `sm`.

**Week bar chart** — 7 columns, container height 88, bar 16×60 at 100%, pill radius,
`muted` track behind each. Height = `max(6, percent)`. Color: `>= threshold` → primary,
`> 0` → warning, else `muted`. Label 10px, gap 6; today's label is primary, rest `faint`.
See `libraries.md` for the gifted-charts props.

**Heatmap cell** — `aspectRatio: 1`, radius 5, centered 10px digit, `lineHeight: 1`.
Hit → primary bg, `primary-foreground` text, weight 600. Partial → warning bg,
`warning-foreground` text, weight 600. Missed → `muted` bg, `subtle` text, weight 400.
Future → transparent, `elev-md-border` text. Today → `borderWidth: 1.5` primary.

**Legend** — below a `FadedRule`: three 10×10 radius-3 swatches (`muted` "missed",
warning "partial", primary "hit goal"), 11px `muted-foreground` labels.

**Tab bar** — row, `borderTopWidth: 1` border, padding `8 / 4 / 10`, 5 equal items.
22×22 stroke-1.5 lucide icon over a 10px label. Active primary, inactive `faint`.
Icons: home, check-square, calendar, trophy, settings.
