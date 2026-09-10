import { ScrollView, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Every screen's scroll container.
 *
 * Top padding comes from the real safe-area inset, not a constant. The previous
 * hardcoded 58px was tuned against an Android status bar; on a notched iPhone it
 * sits too high, and on Dynamic Island models it sits wrong again. Bottom padding
 * clears the tab bar plus the home indicator.
 */
export function ScreenScroll({
  children,
  ...rest
}: { children: React.ReactNode } & ScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
      }}
      keyboardShouldPersistTaps="handled"
      {...rest}>
      {children}
    </ScrollView>
  );
}
