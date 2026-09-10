import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/app/empty-state';
import { ScreenHeader } from '@/components/app/screen-header';
import { TemplateCard } from '@/components/app/template-card';
import { Button } from '@/components/ui/button';
import type { Template } from '@/lib/domain';
import { createTemplate, duplicateTemplate, listTemplates } from '@/lib/repo';

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const reload = useCallback(async () => setTemplates(await listTemplates()), []);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const open = (id: string) => router.push(`/settings/templates/${id}`);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <ScreenHeader eyebrow="Build once, reuse" title="Templates" />

      {templates.length ? (
        <View className="gap-task-gap">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onOpen={() => open(template.id)}
              onDuplicate={async () => {
                const copy = await duplicateTemplate(template.id);
                await reload();
                open(copy.id);
              }}
            />
          ))}
        </View>
      ) : (
        <EmptyState title="No templates" body="Create one to start building your routine." />
      )}

      <Button
        className="mt-card-gap"
        full
        variant="primary"
        label="+ New template"
        onPress={async () => {
          const created = await createTemplate('New template');
          await reload();
          open(created.id);
        }}
      />
    </ScrollView>
  );
}
