import { Text, View } from 'react-native';

export function HistoryRow({
  label,
  sublabel,
  percent,
  threshold,
}: {
  label: string;
  sublabel: string;
  percent: number;
  threshold: number;
}) {
  const tone =
    percent >= threshold ? 'text-primary' : percent > 0 ? 'text-warning' : 'text-muted-foreground';

  return (
    <View className="flex-row items-center justify-between border-b border-line py-2">
      <View>
        <Text className="text-sm text-foreground">{label}</Text>
        <Text className="text-meta text-subtle">{sublabel}</Text>
      </View>
      <Text className={`font-heading text-[15px] ${tone}`}>{percent}%</Text>
    </View>
  );
}
