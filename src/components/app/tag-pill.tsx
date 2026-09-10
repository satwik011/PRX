import { Text, View } from 'react-native';

const VARIANTS = {
  accent: 'bg-tag-bg',
  neutral: 'bg-muted',
  outline: 'border border-primary',
} as const;

const LABELS = {
  accent: 'text-tag-fg',
  neutral: 'text-foreground',
  outline: 'text-primary',
} as const;

export function TagPill({
  label,
  variant = 'accent',
}: {
  label: string;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <View className={`rounded-[6px] px-2.5 py-0.5 ${VARIANTS[variant]}`}>
      <Text className={`text-meta ${LABELS[variant]}`}>{label}</Text>
    </View>
  );
}
