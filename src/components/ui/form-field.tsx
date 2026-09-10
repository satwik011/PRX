import { Text, View } from 'react-native';

export function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={className}>
      <Text className="mb-1 text-label text-foreground/70">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-meta text-destructive">{error}</Text> : null}
    </View>
  );
}
