import { Text, View } from 'react-native';

import type { DaySummary } from '@/lib/domain';
import { FadedRule } from '@/components/ui/faded-rule';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Hand-built grid rather than react-native-calendars.
 *
 * The library earns its place when you need month navigation and real calendar
 * semantics. Here the range is "the last N days ending today", which is a flat
 * sequence — the library would fight that, and its dayComponent would still be
 * doing all the drawing. Revisit if month-by-month browsing is ever wanted.
 */
export function CalendarHeatmap({
  days,
  threshold,
  todayKey,
}: {
  days: DaySummary[];
  threshold: number;
  todayKey: string;
}) {
  if (!days.length) return null;

  // Pad so the first cell lands under its real weekday column.
  const [y, m, d] = days[0].day.split('-').map(Number);
  const leading = new Date(y, m - 1, d).getDay();

  return (
    <View className="gap-1">
      <View className="flex-row">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <Text key={i} className="flex-1 text-center text-micro text-faint">
            {initial}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: leading }).map((_, i) => (
          <View key={`pad-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />
        ))}
        {days.map((day) => {
          const hit = Math.round(day.percent) >= threshold;
          const partial = !hit && day.percent > 0;
          const isToday = day.day === todayKey;
          return (
            <View key={day.day} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} className="p-0.5">
              <View
                className={[
                  'flex-1 items-center justify-center rounded-sm',
                  hit ? 'bg-primary' : partial ? 'bg-warning' : 'bg-muted',
                  isToday ? 'border-[1.5px] border-primary' : '',
                ].join(' ')}>
                <Text
                  className={[
                    'text-micro leading-none',
                    hit ? 'font-strong text-primary-foreground' : '',
                    partial ? 'font-strong text-warning-foreground' : '',
                    !hit && !partial ? 'text-subtle' : '',
                  ].join(' ')}>
                  {Number(day.day.slice(8))}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function HeatmapLegend() {
  return (
    <View>
      <FadedRule className="my-1.5" />
      <View className="flex-row items-center gap-1.5">
        <View className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
        <Text className="mr-2 text-meta text-muted-foreground">missed</Text>
        <View className="h-2.5 w-2.5 rounded-[3px] bg-warning" />
        <Text className="mr-2 text-meta text-muted-foreground">partial</Text>
        <View className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
        <Text className="text-meta text-muted-foreground">hit goal</Text>
      </View>
    </View>
  );
}
