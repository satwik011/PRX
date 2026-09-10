import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { taskPercent, type CheckTask, type NumericTask, type PRTask, type Task } from '@/lib/domain';
import { TagPill } from './tag-pill';

export interface TaskCardProps {
  task: Task;
  /** Best weight for this exercise on any other day — drives the New PR badge. */
  previousBest?: number;
  onChange: (patch: Partial<Task>) => void;
}

function CheckTaskRow({ task, onChange }: { task: CheckTask; onChange: TaskCardProps['onChange'] }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.done }}
      className="flex-row items-center gap-3"
      onPress={() => onChange({ done: !task.done } as Partial<Task>)}>
      <View
        className={[
          'h-6 w-6 items-center justify-center rounded-sm border',
          task.done ? 'border-primary bg-primary' : 'border-line',
        ].join(' ')}>
        {task.done ? (
          <Text className="font-strong text-[13px] text-primary-foreground">✓</Text>
        ) : null}
      </View>
      <Text
        className={`text-body ${task.done ? 'text-faint line-through' : 'text-foreground'}`}>
        {task.name}
      </Text>
    </Pressable>
  );
}

function NumericTaskRow({
  task,
  onChange,
}: {
  task: NumericTask;
  onChange: TaskCardProps['onChange'];
}) {
  const step = (delta: number) =>
    onChange({ value: Math.max(0, task.value + delta) } as Partial<Task>);

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-body text-foreground">{task.name}</Text>
        <Text className="text-label text-muted-foreground">
          {task.value} / {task.target} {task.unit}
        </Text>
      </View>
      <View className="flex-row items-center gap-2.5">
        <Button
          label="–"
          size="icon"
          disabled={task.value <= 0}
          onPress={() => step(-1)}
          accessibilityLabel={`Decrease ${task.name}`}
        />
        <View className="flex-1">
          <ProgressBar percent={taskPercent(task)} />
        </View>
        <Button
          label="+"
          size="icon"
          onPress={() => step(1)}
          accessibilityLabel={`Increase ${task.name}`}
        />
      </View>
    </View>
  );
}

function PRTaskRow({
  task,
  previousBest = 0,
  onChange,
}: {
  task: PRTask;
  previousBest?: number;
  onChange: TaskCardProps['onChange'];
}) {
  // Strictly greater — equalling your best is not a new PR. See domain.md.
  const isNewPR = task.weight > 0 && task.weight > previousBest;

  const setNumber = (key: 'weight' | 'reps') => (text: string) => {
    const parsed = Number(text.replace(',', '.'));
    onChange({ [key]: Number.isFinite(parsed) ? parsed : 0 } as Partial<Task>);
  };

  return (
    <View>
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-body text-foreground">{task.name}</Text>
          {isNewPR ? <TagPill label="New PR" /> : null}
        </View>
        <Text className="text-meta text-subtle">
          {previousBest > 0 ? `best ${previousBest} ${task.unit}` : 'no record yet'}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <FormField label={`Weight (${task.unit})`} className="flex-1">
          <Input
            keyboardType="numeric"
            defaultValue={task.weight ? String(task.weight) : ''}
            onChangeText={setNumber('weight')}
            placeholder="0"
          />
        </FormField>
        <FormField label="Reps" className="flex-1">
          <Input
            keyboardType="number-pad"
            defaultValue={task.reps ? String(task.reps) : ''}
            onChangeText={setNumber('reps')}
            placeholder="0"
          />
        </FormField>
      </View>
    </View>
  );
}

/** One card, three bodies. Dispatch lives here so screens never switch on type. */
export function TaskCard({ task, previousBest, onChange }: TaskCardProps) {
  return (
    <View className="gap-2.5 rounded-md border border-muted bg-card p-2">
      {task.type === 'check' && <CheckTaskRow task={task} onChange={onChange} />}
      {task.type === 'numeric' && <NumericTaskRow task={task} onChange={onChange} />}
      {task.type === 'pr' && (
        <PRTaskRow task={task} previousBest={previousBest} onChange={onChange} />
      )}
    </View>
  );
}
