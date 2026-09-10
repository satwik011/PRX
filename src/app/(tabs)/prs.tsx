import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/app/empty-state';
import { PRGroupCard } from '@/components/app/pr-group-card';
import { ScreenHeader } from '@/components/app/screen-header';
import { useHistory } from '@/hooks/use-history';

export default function PRs() {
  const { ready, prs } = useHistory(90);

  if (!ready) return <View className="flex-1 bg-background" />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <ScreenHeader eyebrow="Gym-specific" title="Personal records" />

      {prs.length ? (
        <View className="gap-card-gap">
          {prs.map((group) => (
            <PRGroupCard key={group.name} group={group} />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No personal records yet"
          body="Log a weight against a PR task and it will appear here."
        />
      )}
    </ScrollView>
  );
}
