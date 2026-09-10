import { Modal, Pressable, Text, View } from 'react-native';

/**
 * RN's Modal handles the Android back button and the overlay for us.
 * elev-lg is a hairline + ambient shadow — see theme/tokens.ts.
 */
export function Dialog({
  visible,
  title,
  onDismiss,
  children,
  actions,
}: {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable className="flex-1 items-center justify-center bg-scrim px-4" onPress={onDismiss}>
        <Pressable
          className="w-full max-w-[440px] gap-2 rounded-lg border border-elev-lg bg-card p-4"
          onPress={(e) => e.stopPropagation()}>
          <Text className="font-heading text-h4 text-foreground">{title}</Text>
          {children}
          <View className="mt-1.5 flex-row justify-end gap-1.5">{actions}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
