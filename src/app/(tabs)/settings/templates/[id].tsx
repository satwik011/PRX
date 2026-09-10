import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/app/screen-header';
import { TagPill } from '@/components/app/tag-pill';
import { TaskEditorRow } from '@/components/app/task-editor-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Template, TemplateTaskDef } from '@/lib/domain';
import {
  addTemplateTask,
  deleteTemplate,
  deleteTemplateTask,
  duplicateTemplate,
  getTemplate,
  renameTemplate,
  updateTemplateTask,
} from '@/lib/repo';

export default function TemplateEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);

  const reload = useCallback(async () => setTemplate(await getTemplate(id)), [id]);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (!template) return <View className="flex-1 bg-background" />;

  const patchTask = (taskId: string) => async (patch: Partial<Omit<TemplateTaskDef, 'id'>>) => {
    setTemplate((t) =>
      t ? { ...t, tasks: t.tasks.map((x) => (x.id === taskId ? { ...x, ...patch } : x)) } : t,
    );
    await updateTemplateTask(taskId, patch);
  };

  const confirmDelete = () =>
    Alert.alert('Delete template?', `"${template.name}" will be removed from your library.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTemplate(template.id);
          router.back();
        },
      },
    ]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8"
      keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Template" title={template.name} />

      {template.isSeed ? (
        <View className="mb-card-gap flex-row items-center gap-2 rounded-md border border-muted bg-card p-2">
          <TagPill label="Preset" variant="neutral" />
          <Text className="flex-1 text-sm text-muted-foreground">
            Editing this changes it for future days only — days you already logged are
            untouched.
          </Text>
        </View>
      ) : null}

      <View className="mb-card-gap">
        <Text className="mb-1 text-label text-foreground/70">Name</Text>
        <Input
          defaultValue={template.name}
          onChangeText={(name) => {
            setTemplate((t) => (t ? { ...t, name } : t));
            void renameTemplate(template.id, name);
          }}
        />
      </View>

      <View className="gap-task-gap">
        {template.tasks.map((task) => (
          <TaskEditorRow
            key={task.id}
            task={task}
            onChange={patchTask(task.id)}
            onDelete={async () => {
              await deleteTemplateTask(task.id);
              await reload();
            }}
          />
        ))}
      </View>

      {template.tasks.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No tasks yet.</Text>
      ) : null}

      <Button
        className="mt-card-gap"
        full
        label="+ Add task"
        onPress={async () => {
          await addTemplateTask(template.id, {
            name: '',
            type: 'check',
            target: null,
            unit: null,
          });
          await reload();
        }}
      />

      <View className="mt-card-gap flex-row gap-2">
        <View className="flex-1">
          <Button
            full
            label="Duplicate"
            onPress={async () => {
              const copy = await duplicateTemplate(template.id);
              router.replace(`/settings/templates/${copy.id}`);
            }}
          />
        </View>
        <View className="flex-1">
          <Button full variant="ghost" label="Delete" onPress={confirmDelete} />
        </View>
      </View>
    </ScrollView>
  );
}
