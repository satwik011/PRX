import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AddTaskDialog } from '@/components/app/add-task-dialog';
import { EmptyState } from '@/components/app/empty-state';
import { ScreenHeader } from '@/components/app/screen-header';
import { SectionCard } from '@/components/app/section-card';
import { TaskCard } from '@/components/app/task-card';
import { TemplateChipRow } from '@/components/app/template-chip-row';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatLockHour } from '@/lib/domain';
import { useToday } from '@/hooks/use-today';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function todayLabel() {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function Today() {
  const {
    ready, settings, templates, log, locked, percent, previousBests,
    selectTemplate, changeTask, addTask,
  } = useToday();
  const [addOpen, setAddOpen] = useState(false);

  if (!ready) return <View className="flex-1 bg-background" />;

  const activeTemplate = templates.find((t) => t.id === log?.templateId);
  const hasPlan = (log?.tasks.length ?? 0) > 0;

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-screen pt-screen-top pb-8"
        keyboardShouldPersistTaps="handled">
        <ScreenHeader eyebrow={todayLabel()} title="Today" />

        <TemplateChipRow
          templates={templates}
          activeId={log?.templateId ?? null}
          disabled={locked}
          onSelect={selectTemplate}
        />

        {locked ? (
          <Text className="mb-3 mt-2 text-label text-faint">
            🔒 Plan locked for today at {formatLockHour(settings.planLockHour)}. Logging stays
            open.
          </Text>
        ) : null}

        {hasPlan ? (
          <>
            <SectionCard
              className="mb-card-gap mt-2.5"
              title={activeTemplate?.name ?? 'Today'}
              trailing={
                <Text className="font-heading text-h4 text-primary">{percent}%</Text>
              }>
              <ProgressBar percent={percent} />
            </SectionCard>

            <View className="gap-task-gap">
              {log!.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  previousBest={previousBests[task.name]}
                  onChange={(patch) => changeTask(task.id, patch)}
                />
              ))}
            </View>

            <Button
              className="mt-3.5"
              full
              label={locked ? `Locked — plan set for ${formatLockHour(settings.planLockHour)}` : '+ Add task'}
              disabled={locked}
              onPress={() => setAddOpen(true)}
            />
          </>
        ) : (
          <View className="mt-2.5">
            <EmptyState
              title="No plan yet"
              body={
                locked
                  ? 'The plan locked before you picked a template today.'
                  : 'Pick a day template above to load its tasks.'
              }
            />
          </View>
        )}
      </ScrollView>

      <AddTaskDialog
        visible={addOpen}
        onDismiss={() => setAddOpen(false)}
        onAdd={(task) => {
          void addTask(task);
          setAddOpen(false);
        }}
      />
    </>
  );
}
