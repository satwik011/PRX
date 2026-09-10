import { View } from 'react-native';

/**
 * Track is muted, fill is primary, both fully pill-rounded — tokens.md gotcha #8.
 *
 * Hand-rolled rather than react-native-progress: this is eight lines of View,
 * and the library's default 1px border is a documented footgun (gotcha #3).
 */
export function ProgressBar({ percent, height = 7 }: { percent: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View className="overflow-hidden rounded-pill bg-track" style={{ height }}>
      <View className="h-full rounded-pill bg-primary" style={{ width: `${clamped}%` }} />
    </View>
  );
}
