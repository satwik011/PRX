import { Text, View } from 'react-native';

/** elev-sm is a hairline, never a shadow — tokens.md gotcha #1. */
export function SectionCard({
  title,
  trailing,
  children,
  className,
}: {
  title?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`gap-2.5 rounded-md border border-muted bg-card p-2 ${className ?? ''}`}>
      {title || trailing ? (
        <View className="flex-row items-baseline justify-between">
          {title ? (
            <Text className="font-heading text-card-title text-foreground">{title}</Text>
          ) : null}
          {trailing}
        </View>
      ) : null}
      {children}
    </View>
  );
}
