import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  bestStreak,
  currentStreak,
  dayKey,
  dayKeyRange,
  personalRecords,
  DEFAULT_SETTINGS,
  type DayLog,
  type DaySummary,
  type PRGroup,
  type Settings,
} from '@/lib/domain';
import { daySummaries, getSettings, listDayLogsUpTo, listTemplates } from '@/lib/repo';

export type Range = 7 | 30 | 90;

/**
 * Everything the read-only screens need, derived from local data.
 * Reloads on focus so logging on Today is reflected the moment you switch tab.
 */
export function useHistory(range: Range = 90) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [templateNames, setTemplateNames] = useState<Record<string, string>>({});
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });
  const [prs, setPRs] = useState<PRGroup[]>([]);

  const load = useCallback(async () => {
    const nextSettings = await getSettings();
    const [nextSummaries, nextLogs, templates] = await Promise.all([
      daySummaries(dayKeyRange(range)),
      listDayLogsUpTo(),
      listTemplates(),
    ]);

    // Streaks always use the full 90-day window, not the selected range —
    // a 7-day view must not truncate a 20-day streak.
    const streakWindow =
      range === 90 ? nextSummaries : await daySummaries(dayKeyRange(90));

    setSettings(nextSettings);
    setSummaries(nextSummaries);
    setLogs(nextLogs);
    setTemplateNames(Object.fromEntries(templates.map((t) => [t.id, t.name])));
    setStreaks({
      current: currentStreak(streakWindow, nextSettings.streakThreshold),
      best: bestStreak(streakWindow, nextSettings.streakThreshold),
    });
    setPRs(personalRecords(nextLogs));
    setReady(true);
  }, [range]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return {
    ready,
    settings,
    summaries,
    logs,
    templateNames,
    streaks,
    prs,
    todayKey: dayKey(),
    reload: load,
  };
}
