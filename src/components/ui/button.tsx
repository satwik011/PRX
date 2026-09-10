import { Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'default' | 'icon';

const CONTAINER: Record<Variant, string> = {
  // Primary is OUTLINED, not filled — tokens.md gotcha #2.
  primary: 'border border-primary',
  secondary: 'border border-line',
  ghost: 'px-1',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-primary',
  secondary: 'text-foreground',
  ghost: 'text-primary',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function Button({
  label,
  variant = 'secondary',
  size = 'default',
  full,
  disabled,
  className,
  ...rest
}: ButtonProps & { className?: string }) {
  const sizing = size === 'icon' ? 'h-9 w-9' : 'px-3 py-1.5';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={[
        'flex-row items-center justify-center gap-1.5 rounded-md',
        sizing,
        CONTAINER[variant],
        full ? 'w-full' : '',
        disabled ? 'opacity-45' : '',
        className ?? '',
      ].join(' ')}
      {...rest}>
      <Text className={`font-heading text-[14px] ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  );
}
