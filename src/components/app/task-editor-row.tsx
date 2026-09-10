import { Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { TaskType, TemplateTaskDef } from '@/lib/domain';
import { colors } from '@/theme/tokens';

const TYPES = [
  { value: 'check' as const, label: 'Check' },
  { value: 'numeric' as const, label: 'Count' },
  { value: 'pr' as const, label: 'PR' },
];

export function TaskEditorRow({
  task,
  onChange,
  onDelete,
}: {
  task: TemplateTaskDef;
  onChange: (patch: Partial<Omit<TemplateTaskDef, 'id'>>) => void;
  onDelete: () => void;
}) {
  return (
    <View className="gap-2 rounded-md border border-muted bg-card p-2">
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            defaultValue={task.name}
            onChangeText={(name) => onChange({ name })}
            placeholder="Exercise or habit"
          />
        </View>
        <Pressable
          onPress={onDelete}
          hitSlop={10}
          accessibilityLabel={`Remove ${task.name}`}
          className="h-9 w-9 items-center justify-center rounded-md border border-line">
          <Trash2 size={16} color={colors.mutedForeground} strokeWidth={1.5} />
        </Pressable>
      </View>

      <SegmentedControl
        options={TYPES}
        value={task.type}
        onChange={(type: TaskType) =>
          onChange({
            type,
            target: type === 'numeric' ? (task.target ?? 3) : null,
            unit: type === 'numeric' ? (task.unit ?? 'sets') : type === 'pr' ? 'kg' : null,
          })
        }
      />

      {task.type === 'numeric' ? (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Text className="mb-1 text-label text-foreground/70">Target</Text>
            <Input
              defaultValue={String(task.target ?? '')}
              keyboardType="number-pad"
              onChangeText={(v) => onChange({ target: Number(v) || 0 })}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-label text-foreground/70">Unit</Text>
            <Input
              defaultValue={task.unit ?? ''}
              onChangeText={(unit) => onChange({ unit })}
              placeholder="sets"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
