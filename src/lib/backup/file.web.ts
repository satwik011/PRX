import { buildBackup, parseBackup, restoreBackup, BackupError } from '@/lib/repo';
import { dayKey } from '@/lib/domain';
import type { ImportSummary } from './file';

/**
 * Web implementation. Metro resolves this over file.ts when bundling for web,
 * so the browser bundle never reaches for expo-sharing or expo-document-picker.
 *
 * Same exported signatures as the native version — that is the whole contract.
 */

export async function exportBackupToFile(): Promise<{ shared: boolean }> {
  const backup = await buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `prx-backup-${dayKey()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { shared: true };
}

export async function importBackupFromFile(): Promise<ImportSummary | null> {
  const file = await pickFile();
  if (!file) return null;

  let raw: string;
  try {
    raw = await file.text();
  } catch {
    throw new BackupError("That file couldn't be read.");
  }

  const backup = parseBackup(raw);
  await restoreBackup(backup);
  return { templates: backup.templates.length, days: backup.dayLogs.length };
}

/** Resolves null if the picker is dismissed. */
function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    // 'cancel' is not universally supported; focus is the reliable fallback.
    const settle = (value: File | null) => {
      input.remove();
      resolve(value);
    };

    input.onchange = () => settle(input.files?.[0] ?? null);
    input.oncancel = () => settle(null);

    document.body.appendChild(input);
    input.click();
  });
}
