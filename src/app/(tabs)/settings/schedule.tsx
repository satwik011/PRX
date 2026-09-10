import { ScreenScroll } from '@/components/app/screen-scroll';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/app/screen-header';
import { Button } from '@/components/ui/button';
import { WEEKDAYS, weekdayOf, dayKey, type Template } from '@/lib/domain';
import { getSchedule, listTemplates, setScheduleDay, type WeeklySchedule } from '@/lib/repo';

const EMPTY: WeeklySchedule = [null, null, null, null, null, null, null];

/**
 * Assign a template to each weekday. Today then loads its own plan — the point
 * of a routine is that Tuesday already knows it is legs.
 */
export default function Schedule() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>(EMPTY);
  const [open, setOpen] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setTemplates(await listTemplates());
        setSchedule(await getSchedule());
      })();
    }, []),
  );

  const assign = async (weekday: number, templateId: string | null) => {
    setSchedule((s) => s.map((v, i) => (i === weekday ? templateId : v)));
    setOpen(null);
    await setScheduleDay(weekday, templateId);
  };

  const today = weekdayOf(dayKey());

  return (
    <ScreenScroll>
      <ScreenHeader eyebrow="Weekly routine" title="Schedule" />

      <Text className="mb-card-gap text-sm text-muted-foreground">
        Today loads its plan automatically. Leave a day unset to pick manually.
      </Text>

      <View className="gap-task-gap">
        {WEEKDAYS.map((name, weekday) => {
          const assigned = templates.find((t) => t.id === schedule[weekday]);
          const isToday = weekday === today;
          const expanded = open === weekday;

          return (
            <View
              key={name}
              className={[
                'rounded-md border bg-card p-2',
                isToday ? 'border-primary' : 'border-muted',
              ].join(' ')}>
              <Pressable
                onPress={() => setOpen(expanded ? null : weekday)}
                className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-body text-foreground">{name}</Text>
                  {isToday ? (
                    <Text className="text-meta uppercase tracking-[0.08em] text-primary">
                      Today
                    </Text>
                  ) : null}
                </View>
                <Text className={assigned ? 'text-sm text-primary' : 'text-sm text-faint'}>
                  {assigned?.name ?? 'Not set'}
                </Text>
              </Pressable>

              {expanded ? (
                <View className="mt-2 gap-1 border-t border-line pt-2">
                  {templates.map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => void assign(weekday, t.id)}
                      className="flex-row items-center justify-between py-1.5">
                      <Text
                        className={
                          t.id === schedule[weekday]
                            ? 'text-sm text-primary'
                            : 'text-sm text-foreground'
                        }>
                        {t.name}
                      </Text>
                      <Text className="text-meta text-subtle">{t.tasks.length} tasks</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => void assign(weekday, null)} className="py-1.5">
                    <Text className="text-sm text-faint">Clear — pick manually</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Button
        className="mt-card-gap"
        full
        label="Manage templates"
        onPress={() => router.push('/settings/templates')}
      />
    </ScreenScroll>
  );
}
