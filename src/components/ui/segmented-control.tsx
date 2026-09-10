import { Pressable, Text, View } from 'react-native';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View
      className={`flex-row self-start overflow-hidden rounded-md border border-line ${className ?? ''}`}>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={[
              'px-3 py-1.5',
              i > 0 ? 'border-l border-line' : '',
              selected ? 'bg-primary/10' : '',
            ].join(' ')}>
            <Text className={`text-[13px] ${selected ? 'text-primary' : 'text-foreground'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
