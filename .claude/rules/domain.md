# Domain rules

Pure functions in `lib/domain/`. No I/O. Unit-tested. **Never inline this math in a component.**

## Task percent

```ts
taskPercent(task): number
  check   → task.done ? 100 : 0
  numeric → task.target ? Math.min(100, (task.value / task.target) * 100) : 0
  pr      → task.weight > 0 ? 100 : 0
```

Note `numeric` guards against `target === 0` returning `Infinity`.

## Day percent

```ts
dayPercent(tasks) = tasks.length
  ? tasks.reduce((a, t) => a + taskPercent(t), 0) / tasks.length
  : 0
```

Unweighted mean. A day with no tasks is 0%, not 100%.

## Qualifying day

```ts
qualifies(day) = Math.round(dayPercent(day.tasks)) >= settings.streakThreshold
```

Round **before** comparing. Threshold is 70 / 80 / 90, default 80.

## Current streak

Walk backwards from today.

**If today does not qualify yet, start from yesterday instead** — a day still in progress
must never break the streak. Then count consecutive qualifying days until the first miss.

```
i = lastIndex
if (!seq[i].qualifies) i--          // today in progress: skip, don't break
streak = 0
for (; i >= 0; i--) { if (seq[i].qualifies) streak++; else break }
```

## Best streak

Longest run of consecutive qualifying days in the loaded window. Simple scan, tracking
`run` and `max`.

## Personal records

Group every task where `type === 'pr' && weight > 0` across **all** day logs by `name`.

- `best` = the entry with the max weight
- display: `` `${weight} kg × ${reps}` ``
- history: most recent 4, newest first

Derived on read. Never stored — see `data.md`.

## New PR badge

Shown on a task when today's weight **exceeds** the max weight recorded for that task name
on **any day other than today**. Strictly greater; equalling your best is not a new PR.

## Plan lock

```ts
isLocked(dayLog, settings, now) =
  dayLog.exists && now >= startOfDay(now) + settings.planLockHour hours
```

Locked ⇒ template switching and adding tasks are **disabled**.
Logging progress (check, increment, weight, reps) stays **enabled all day**.

Lock hour is 7 / 8 / 9 AM, default 8.

**Open question, do not guess:** what happens when the day log is created *after* the lock
hour. Current proposal is that creating it locks it immediately, but this is unconfirmed —
ask before implementing that branch.

## Day key — DECIDED

`YYYY-MM-DD` in the device's **local calendar date**. A `date`, never a timestamp.
Midnight is midnight: a session logged at 00:30 belongs to the new day.

No "day starts at 4 AM" offset, no timezone shifting. Do not add one without being asked —
it changes what every existing row means.
