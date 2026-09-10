import { Pressable, ScrollView, Text } from 'react-native';
import type { TemplateWithTasks } from '@/lib/repo';

export function TemplateChipRow({
  templates,
  activeId,
  disabled,
  onSelect,
}: {
  templates: TemplateWithTasks[];
  activeId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pb-1">
      {templates.map((template) => {
        const active = template.id === activeId;
        return (
          <Pressable
            key={template.id}
            disabled={disabled}
            onPress={() => onSelect(template.id)}
            className={[
              'rounded-pill border px-3 py-1.5',
              active ? 'border-primary bg-primary/10' : 'border-line',
              disabled ? 'opacity-45' : '',
            ].join(' ')}>
            <Text className={`text-[13px] ${active ? 'text-primary' : 'text-foreground'}`}>
              {template.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
