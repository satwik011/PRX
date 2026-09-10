import { Copy } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { TagPill } from './tag-pill';
import type { Template } from '@/lib/domain';
import { colors } from '@/theme/tokens';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lastUsedLabel(day: string | null) {
  if (!day) return 'never used';
  const [, m, d] = day.split('-').map(Number);
  return `last used ${MONTHS[m - 1]} ${d}`;
}

export function TemplateCard({
  template,
  onOpen,
  onDuplicate,
}: {
  template: Template;
  onOpen: () => void;
  onDuplicate: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      className="flex-row items-center gap-2 rounded-md border border-muted bg-card p-2">
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="font-heading text-card-title text-foreground">{template.name}</Text>
          {template.isSeed ? <TagPill label="Preset" variant="neutral" /> : null}
        </View>
        <Text className="text-meta text-subtle">
          {template.tasks.length} {template.tasks.length === 1 ? 'task' : 'tasks'} ·{' '}
          {lastUsedLabel(template.lastUsedOn)}
        </Text>
      </View>
      <Pressable
        onPress={onDuplicate}
        hitSlop={10}
        accessibilityLabel={`Duplicate ${template.name}`}
        className="h-9 w-9 items-center justify-center rounded-md border border-line">
        <Copy size={16} color={colors.mutedForeground} strokeWidth={1.5} />
      </Pressable>
    </Pressable>
  );
}
