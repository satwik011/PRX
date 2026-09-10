import { Text, View } from 'react-native';

export interface WeekDay {
  label: string;
  percent: number;
  isToday: boolean;
}

const BAR_WIDTH = 16;
const TRACK_HEIGHT = 60;
/** Keeps a visible nub on a zero day rather than an empty track. */
const MIN_FILL = 6;

/**
 * Seven columns, one flex row — so the track, the fill and the label are laid
 * out by the same pass and cannot drift apart.
 *
 * This replaced react-native-gifted-charts. The library positions bars with its
 * own spacing/initialSpacing origin, which never aligned with the flexbox track
 * pills drawn behind it (it also reserves y-axis room even when the axis is
 * hidden). Overlaying two independent layout systems was the bug; the chart
 * itself is seven rounded rects.
 */
export function WeekBarChart({ days, threshold }: { days: WeekDay[]; threshold: number }) {
  return (
    <View className="flex-row items-end">
      {days.map((day, i) => {
        const percent = Math.max(0, Math.min(100, day.percent));
        const fill = Math.max(MIN_FILL, percent);
        const tone =
          percent >= threshold ? 'bg-primary' : percent > 0 ? 'bg-warning' : 'bg-muted';

        return (
          <View key={`${day.label}-${i}`} className="flex-1 items-center gap-1.5">
            <View
              className="justify-end overflow-hidden rounded-pill bg-track"
              style={{ width: BAR_WIDTH, height: TRACK_HEIGHT }}>
              <View className={`w-full rounded-pill ${tone}`} style={{ height: `${fill}%` }} />
            </View>
            <Text
              numberOfLines={1}
              className={`text-micro ${day.isToday ? 'text-primary' : 'text-faint'}`}>
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
