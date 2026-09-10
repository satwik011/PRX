import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CalendarHeatmap, HeatmapLegend } from '@/components/app/calendar-heatmap';
import { EmptyState } from '@/components/app/empty-state';
import { HistoryRow } from '@/components/app/history-row';
import { ScreenHeader } from '@/components/app/screen-header';
import { SectionCard } from '@/components/app/section-card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useHistory, type Range } from '@/hooks/use-history';

const RANGES = [
  { value: 7 as Range, label: 'Week' },
  { value: 30 as Range, label: 'Month' },
  { value: 90 as Range, label: '90 days' },
];

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function History() {
  const [range, setRange] = useState<Range>(30);
  const { ready, settings, summaries, logs, templateNames, todayKey } = useHistory(range);

  const logged = useMemo(() => new Map(logs.map((l) => [l.day, l])), [logs]);

  const recent = useMemo(
    () =>
      [...summaries]
        .reverse()
        .slice(0, 8)
        .map((s) => {
          const [y, m, d] = s.day.split('-').map(Number);
          const log = logged.get(s.day);
          return {
            key: s.day,
            label: s.day === todayKey ? 'Today' : `${DOW[new Date(y, m - 1, d).getDay()]} ${d}`,
            sublabel: log?.templateId ? (templateNames[log.templateId] ?? '—') : '—',
            percent: Math.round(s.percent),
          };
        }),
    [summaries, logged, templateNames, todayKey],
  );

  if (!ready) return <View className="flex-1 bg-background" />;

  const hasAny = logs.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <ScreenHeader eyebrow={`Last ${range} days`} title="History" />

      <SegmentedControl
        className="mb-card-gap"
        options={RANGES}
        value={range}
        onChange={setRange}
      />

      {hasAny ? (
        <>
          <SectionCard className="mb-card-gap">
            <CalendarHeatmap
              days={summaries}
              threshold={settings.streakThreshold}
              todayKey={todayKey}
            />
            <HeatmapLegend />
          </SectionCard>

          <SectionCard title="Daily log">
            <View>
              {recent.map((row) => (
                <HistoryRow
                  key={row.key}
                  label={row.label}
                  sublabel={row.sublabel}
                  percent={row.percent}
                  threshold={settings.streakThreshold}
                />
              ))}
            </View>
          </SectionCard>
        </>
      ) : (
        <EmptyState
          title="Nothing logged yet"
          body="Pick a template on Today and check something off — it shows up here."
        />
      )}
    </ScrollView>
  );
}
