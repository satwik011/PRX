import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/app/screen-header';
import { SectionCard } from '@/components/app/section-card';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { formatLockHour } from '@/lib/domain';
import { useHistory } from '@/hooks/use-history';
import { clearDevHistory, seedDevHistory } from '@/lib/dev/seedHistory';
import { updateSettings } from '@/lib/repo';

const THRESHOLDS = [
  { value: 70, label: '70%' },
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
];

const LOCK_HOURS = [
  { value: 7, label: '7 AM' },
  { value: 8, label: '8 AM' },
  { value: 9, label: '9 AM' },
];

/** Phase 5 adds the template library. This is the settings that already exist. */
export default function Settings() {
  const { ready, settings, reload } = useHistory(7);

  if (!ready) return <View className="flex-1 bg-background" />;

  const set = async (patch: Parameters<typeof updateSettings>[0]) => {
    await updateSettings(patch);
    await reload();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <ScreenHeader title="Settings" />

      <SectionCard className="mb-card-gap" title="Streak goal">
        <Text className="text-sm text-muted-foreground">
          A day counts toward your streak once it crosses this percent complete.
        </Text>
        <SegmentedControl
          options={THRESHOLDS}
          value={settings.streakThreshold}
          onChange={(v) => void set({ streakThreshold: v })}
        />
      </SectionCard>

      <SectionCard className="mb-card-gap" title="Plan lock time">
        <Text className="text-sm text-muted-foreground">
          Template and task changes are blocked after {formatLockHour(settings.planLockHour)};
          logging progress stays open all day. Disabled in development builds.
        </Text>
        <SegmentedControl
          options={LOCK_HOURS}
          value={settings.planLockHour}
          onChange={(v) => void set({ planLockHour: v })}
        />
      </SectionCard>

      <SectionCard className="mb-card-gap" title="Units">
        <Text className="text-sm text-muted-foreground">
          Weights are recorded in {settings.unitSystem}. A kg/lb toggle arrives later.
        </Text>
      </SectionCard>

      {__DEV__ ? (
        <SectionCard className="mb-card-gap" title="Development">
          <Text className="text-sm text-muted-foreground">
            Fake history so the heatmap, streak and PR screens have something to show.
            Never runs in a release build.
          </Text>
          <View className="flex-row gap-2">
            <Button
              label="Seed 4 weeks"
              onPress={async () => {
                await seedDevHistory();
                await reload();
              }}
            />
            <Button
              label="Clear history"
              onPress={async () => {
                await clearDevHistory();
                await reload();
              }}
            />
          </View>
        </SectionCard>
      ) : null}

      <Button variant="ghost" full label="Token reference" onPress={() => router.push('/tokens')} />
    </ScrollView>
  );
}
