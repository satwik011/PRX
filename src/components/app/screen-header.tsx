import { Text, View } from 'react-native';

export function ScreenHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View className="mb-4">
      {eyebrow ? (
        <Text className="mb-0.5 text-meta uppercase tracking-[0.08em] text-subtle">{eyebrow}</Text>
      ) : null}
      <Text className="font-heading text-h2 text-foreground">{title}</Text>
    </View>
  );
}
