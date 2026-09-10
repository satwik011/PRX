import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { SectionCard } from './section-card';
import { Button } from '@/components/ui/button';
import { exportBackupToFile, importBackupFromFile } from '@/lib/backup/file';
import { BackupError } from '@/lib/repo';

export function BackupSection({ onRestored }: { onRestored: () => void }) {
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const runExport = async () => {
    setBusy('export');
    try {
      const { shared } = await exportBackupToFile();
      if (!shared) Alert.alert('Sharing unavailable', 'This device has no share sheet.');
    } catch {
      Alert.alert('Export failed', 'Could not write the backup file.');
    } finally {
      setBusy(null);
    }
  };

  const confirmImport = () =>
    Alert.alert(
      'Replace all data?',
      'Restoring overwrites every template and every logged day on this device. It does not merge.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose file', style: 'destructive', onPress: () => void runImport() },
      ],
    );

  const runImport = async () => {
    setBusy('import');
    try {
      const summary = await importBackupFromFile();
      if (summary) {
        onRestored();
        Alert.alert(
          'Restored',
          `${summary.templates} templates and ${summary.days} logged days.`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Import failed',
        error instanceof BackupError ? error.message : 'That file could not be restored.',
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <SectionCard className="mb-card-gap" title="Backup">
      <Text className="text-sm text-muted-foreground">
        Your data lives only on this phone until accounts arrive. Export saves a JSON file
        you can keep in Files or iCloud.
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            full
            variant="primary"
            label={busy === 'export' ? 'Exporting…' : 'Export'}
            disabled={busy !== null}
            onPress={runExport}
          />
        </View>
        <View className="flex-1">
          <Button
            full
            label={busy === 'import' ? 'Restoring…' : 'Restore'}
            disabled={busy !== null}
            onPress={confirmImport}
          />
        </View>
      </View>
    </SectionCard>
  );
}
