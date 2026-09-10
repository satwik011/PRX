import type { TaskType } from '@/lib/domain';

export interface SeedTask {
  name: string;
  type: TaskType;
  target?: number;
  unit?: string;
}

export interface SeedTemplate {
  name: string;
  tasks: SeedTask[];
}

/**
 * Shipped with the app, marked is_seed. The UI nudges you to duplicate rather
 * than edit these, but there is no hard lock — it is your data.
 *
 * Lifted from the original mockup, converted to kg.
 */
export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: 'Chest Day',
    tasks: [
      { name: 'Bench Press', type: 'pr', unit: 'kg' },
      { name: 'Incline DB Press', type: 'pr', unit: 'kg' },
      { name: 'Push-ups', type: 'numeric', target: 3, unit: 'sets' },
      { name: 'Warm-up', type: 'check' },
    ],
  },
  {
    name: 'Leg Day',
    tasks: [
      { name: 'Squat', type: 'pr', unit: 'kg' },
      { name: 'Leg Press', type: 'numeric', target: 4, unit: 'sets' },
      { name: 'Stretch', type: 'check' },
    ],
  },
  {
    name: 'Rest Day',
    tasks: [
      { name: 'Walk 20 min', type: 'check' },
      { name: 'Water intake', type: 'numeric', target: 8, unit: 'glasses' },
      { name: 'Mobility work', type: 'check' },
    ],
  },
];
