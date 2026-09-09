# Libraries — pinned versions and exact props

Do not add a dependency that is not here without asking.

## Install (Expo paths — not the bare-RN ones the docs show)

```bash
npx expo install react-native-gifted-charts react-native-svg expo-linear-gradient
npx expo install react-native-calendars react-native-progress
npx expo install expo-sqlite expo-secure-store
```

`react-native-gifted-charts` documents `react-native-linear-gradient`. On Expo use
**`expo-linear-gradient`** instead — installing the bare one will break the build.

## Pins

| Package | Constraint |
|---|---|
| `nativewind` | **v4** — v5 is pre-release and documented as not for production |
| `react-native-reusables` | copy-paste, not a dependency; components live in `components/ui/` |

## react-native-progress — progress bars

```tsx
import * as Progress from 'react-native-progress';

<Progress.Bar
  progress={percent / 100}   // 0–1, NOT 0–100
  width={null}               // null = flex to parent; a number pins it
  height={8}                 // 8 dashboard, 7 elsewhere
  borderWidth={0}            // REQUIRED — defaults to a 1px border we don't want
  borderRadius={999}
  unfilledColor={muted}
  color={primary}
  animated
/>
```

## react-native-gifted-charts — week bar chart

```tsx
<BarChart
  data={days.map(d => ({
    value: Math.max(6, d.percent),
    frontColor: d.percent >= threshold ? primary : d.percent > 0 ? warning : muted,
    labelComponent: () => (
      <Text style={{ fontSize: 10, color: d.isToday ? primary : faint }}>{d.label}</Text>
    ),
  }))}
  height={60}
  maxValue={100}
  barWidth={16}
  barBorderRadius={8}        // ≥ barWidth/2 for the pill
  spacing={(containerWidth - 7 * 16) / 8}
  initialSpacing={0}
  hideRules
  hideYAxisText
  hideAxesAndRules
  yAxisThickness={0}
  xAxisThickness={0}
  isAnimated
  animationDuration={400}
/>
```

Prop names that get hallucinated: it is `frontColor` (not `color`), `barBorderRadius`
(not `borderRadius`), `labelComponent` (not `renderLabel`).

**gifted-charts has no unfilled track.** Render 7 absolutely-positioned 16×60 radius-999
`muted` pills behind the chart. The track is part of the design — do not skip it.

## react-native-calendars — history heatmap

`<Calendar>` for week/month, `<CalendarList horizontal pastScrollRange={3} />` for 90 days.
The library owns the month grid, leading blanks and weekday headers; `dayComponent` owns the look.

```tsx
<Calendar
  theme={{
    calendarBackground: card,          // REQUIRED — library defaults to WHITE
    textSectionTitleColor: faint,
    monthTextColor: foreground,
    arrowColor: primary,
    textDayHeaderFontSize: 10,
  }}
  dayComponent={({ date, state }) => <HeatCell date={date} state={state} />}
  hideExtraDays
  firstDay={0}                          // Sunday — matches the design's S M T W T F S
/>
```

Cell spec is in `components.md`.

## expo-linear-gradient — `<FadedRule />`

Nocturne's rule fades to transparent over 48px at each end:

```tsx
<LinearGradient
  colors={['transparent', border, border, 'transparent']}
  locations={[0, 48 / width, 1 - 48 / width, 1]}
  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
  style={{ height: 1 }}
/>
```

Freestanding rules fade. Box outlines, in-control separators and in-card row separators
stay **solid**.

## Deliberately not used

| Package | Why |
|---|---|
| `victory-native` | needs Skia + Reanimated + Gesture Handler; you compose charts from primitives |
| `react-native-chart-kit` | largely unmaintained; its `ContributionGraph` can't render day-number cells |
| any charting for progress bars | `Progress.Bar` is one line |
| a chart lib for the tab bar / rules | plain `View` and `LinearGradient` |
