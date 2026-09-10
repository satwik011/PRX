import { Text, View } from 'react-native';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="items-center gap-1.5 rounded-md border border-muted bg-card px-4 py-6">
      <Text className="font-heading text-card-title text-foreground">{title}</Text>
      {body ? <Text className="text-center text-sm text-muted-foreground">{body}</Text> : null}
      {action ? <View className="mt-1.5">{action}</View> : null}
    </View>
  );
}
