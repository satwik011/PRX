import { Text, View } from 'react-native';

import { FadedRule } from '@/components/ui/faded-rule';
import type { PRGroup } from '@/lib/domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(day: string) {
  const [, m, d] = day.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export function PRGroupCard({ group }: { group: PRGroup }) {
  return (
    <View className="gap-2.5 rounded-md border border-muted bg-card p-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-heading text-card-title text-foreground">{group.name}</Text>
        <Text className="font-heading text-h4 text-primary">
          {group.best.weight} {group.unit} × {group.best.reps}
        </Text>
      </View>

      <FadedRule />

      <View>
        {group.history.map((entry) => (
          <View key={entry.day} className="flex-row justify-between py-0.5">
            <Text className="text-label text-muted-foreground">{shortDate(entry.day)}</Text>
            <Text className="text-label text-muted-foreground">
              {entry.weight} {group.unit} × {entry.reps}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
