import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  currentStreak,
  bestStreak,
  dayKey,
  dayKeyRange,
  dayPercent,
  formatLockHour,
  type DayLog,
  type Settings,
} from '@/lib/domain';
import { daySummaries, getDayLog, getSettings, listTemplates } from '@/lib/repo';
import type { TemplateWithTasks } from '@/lib/repo';

/**
 * Phase 1 checkpoint screen. Everything below is read from SQLite through the
 * repo layer and reduced by lib/domain — no mock data. Replaced by the real
 * Today screen in Phase 2.
 */
export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [templates, setTemplates] = useState<TemplateWithTasks[]>([]);
  const [today, setToday] = useState<DayLog | null>(null);
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });

  useEffect(() => {
    void (async () => {
      const s = await getSettings();
      const summaries = await daySummaries(dayKeyRange(90));
      setSettings(s);
      setTemplates(await listTemplates());
      setToday(await getDayLog());
      setStreaks({
        current: currentStreak(summaries, s.streakThreshold),
        best: bestStreak(summaries, s.streakThreshold),
      });
    })();
  }, []);

  if (!settings) return <View className="flex-1 bg-background" />;

  const percent = today ? Math.round(dayPercent(today.tasks)) : 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <Text className="mb-0.5 text-meta uppercase tracking-[0.08em] text-subtle">
        {dayKey()}
      </Text>
      <Text className="mb-6 font-heading text-h2 text-foreground">PRX</Text>

      <View className="mb-card-gap items-center gap-1.5 rounded-md border border-muted bg-card px-4 py-6">
        <Text className="font-heading text-display leading-none text-foreground">
          {streaks.current}
        </Text>
        <Text className="text-sm text-muted-foreground">
          day streak · best {streaks.best}
        </Text>
      </View>

      <View className="mb-card-gap gap-2.5 rounded-md border border-muted bg-card p-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-heading text-card-title text-foreground">Today</Text>
          <Text className="font-heading text-h4 text-primary">{percent}%</Text>
        </View>
        <View className="h-2 overflow-hidden rounded-pill bg-track">
          <View className="h-full rounded-pill bg-primary" style={{ width: `${percent}%` }} />
        </View>
        <Text className="text-sm text-muted-foreground">
          {today ? `${today.tasks.length} tasks planned` : 'No plan yet for today'}
        </Text>
      </View>

      <View className="mb-card-gap gap-1 rounded-md border border-muted bg-card p-2">
        <Text className="mb-1 font-heading text-card-title text-foreground">
          Templates ({templates.length})
        </Text>
        {templates.map((t) => (
          <View key={t.id} className="flex-row justify-between border-b border-line py-2">
            <Text className="text-body text-foreground">{t.name}</Text>
            <Text className="text-meta text-subtle">{t.tasks.length} tasks</Text>
          </View>
        ))}
        {templates.length === 0 && (
          <Text className="text-sm text-muted-foreground">Seeding…</Text>
        )}
      </View>

      <View className="mb-card-gap gap-1 rounded-md border border-muted bg-card p-2">
        <Text className="mb-1 font-heading text-card-title text-foreground">Settings</Text>
        <Text className="text-sm text-muted-foreground">
          Streak goal {settings.streakThreshold}% · lock{' '}
          {formatLockHour(settings.planLockHour)} · {settings.unitSystem}
        </Text>
      </View>

      <Link href="/tokens" asChild>
        <Text className="self-start rounded-md border border-primary px-3 py-1.5 font-heading text-[14px] text-primary">
          Token reference
        </Text>
      </Link>
    </ScrollView>
  );
}
