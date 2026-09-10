import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { NewTask, TaskType } from '@/lib/domain';

const TYPES = [
  { value: 'check' as const, label: 'Checklist' },
  { value: 'numeric' as const, label: 'Numeric' },
  { value: 'pr' as const, label: 'PR' },
];

export function AddTaskDialog({
  visible,
  onDismiss,
  onAdd,
}: {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (task: NewTask) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TaskType>('check');
  const [target, setTarget] = useState('3');
  const [unit, setUnit] = useState('sets');

  const reset = () => {
    setName('');
    setType('check');
    setTarget('3');
    setUnit('sets');
  };

  const dismiss = () => {
    reset();
    onDismiss();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (type === 'check') onAdd({ name: trimmed, type: 'check', done: false });
    else if (type === 'numeric')
      onAdd({
        name: trimmed,
        type: 'numeric',
        target: Number(target) || 1,
        value: 0,
        unit: unit || 'sets',
      });
    else onAdd({ name: trimmed, type: 'pr', weight: 0, reps: 0, unit: 'kg' });

    reset();
  };

  return (
    <Dialog
      visible={visible}
      title="Add task"
      onDismiss={dismiss}
      actions={
        <>
          <Button label="Cancel" onPress={dismiss} />
          <Button label="Add" variant="primary" disabled={!name.trim()} onPress={submit} />
        </>
      }>
      <FormField label="Name">
        <Input value={name} onChangeText={setName} placeholder="e.g. Deadlift" autoFocus />
      </FormField>

      <SegmentedControl options={TYPES} value={type} onChange={setType} />

      {type === 'numeric' ? (
        <View className="flex-row gap-2">
          <FormField label="Target" className="flex-1">
            <Input value={target} onChangeText={setTarget} keyboardType="number-pad" />
          </FormField>
          <FormField label="Unit" className="flex-1">
            <Input value={unit} onChangeText={setUnit} placeholder="sets" />
          </FormField>
        </View>
      ) : null}
    </Dialog>
  );
}
