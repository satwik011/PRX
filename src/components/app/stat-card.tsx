import { Text, View } from 'react-native';

/** Streak hero. Numeral is text-display with leading-none — gotcha #11. */
export function StatCard({
  icon,
  value,
  caption,
}: {
  icon?: React.ReactNode;
  value: string | number;
  caption: string;
}) {
  return (
    <View className="items-center gap-1.5 rounded-md border border-muted bg-card px-4 py-6">
      {icon}
      <Text className="font-heading text-display leading-none text-foreground">{value}</Text>
      <Text className="text-sm text-muted-foreground">{caption}</Text>
    </View>
  );
}
