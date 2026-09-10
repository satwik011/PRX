import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { buildBackup, parseBackup, restoreBackup, BackupError } from '@/lib/repo';
import { dayKey } from '@/lib/domain';

/**
 * Writes the backup to the cache directory and opens the system share sheet,
 * so on iOS you can drop it into Files or iCloud Drive.
 *
 * Cache, not documents: the file only needs to survive until the share sheet
 * reads it, and leaving copies around would just accumulate.
 */
export async function exportBackupToFile(): Promise<{ shared: boolean }> {
  const backup = await buildBackup();
  const file = new File(Paths.cache, `prx-backup-${dayKey()}.json`);

  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup, null, 2));

  if (!(await Sharing.isAvailableAsync())) return { shared: false };

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save your PRX backup',
    UTI: 'public.json',
  });
  return { shared: true };
}

export interface ImportSummary {
  templates: number;
  days: number;
}

/**
 * Returns null when the user dismisses the picker.
 * Throws BackupError with a message worth showing for anything malformed.
 */
export async function importBackupFromFile(): Promise<ImportSummary | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;

  const picked = new File(result.assets[0].uri);
  let raw: string;
  try {
    raw = await picked.text();
  } catch {
    throw new BackupError("That file couldn't be read.");
  }

  const backup = parseBackup(raw);
  await restoreBackup(backup);
  return { templates: backup.templates.length, days: backup.dayLogs.length };
}
