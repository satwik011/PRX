import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '@/theme/tokens';

export function Input({ className, ...rest }: TextInputProps & { className?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.faint}
      selectionColor={colors.primary}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={[
        'min-h-9 w-full rounded-md border bg-card px-2.5 py-1.5 text-[14px] text-foreground',
        focused ? 'border-primary' : 'border-line',
        className ?? '',
      ].join(' ')}
      {...rest}
    />
  );
}
