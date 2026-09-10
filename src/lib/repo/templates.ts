import { and, asc, isNull, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { LOCAL_USER_ID, templates, templateTasks } from '@/db/schema';
import { SEED_TEMPLATES } from '@/lib/content/seedTemplates';
import { id } from '@/lib/id';

export interface TemplateWithTasks {
  id: string;
  name: string;
  isSeed: boolean;
  lastUsedOn: string | null;
  tasks: (typeof templateTasks.$inferSelect)[];
}

/** Idempotent — safe to call on every launch. */
export async function seedTemplatesIfEmpty(): Promise<void> {
  const existing = await db.select({ id: templates.id }).from(templates).limit(1);
  if (existing.length) return;

  const now = Date.now();
  for (const [index, seed] of SEED_TEMPLATES.entries()) {
    const templateId = id();
    await db.insert(templates).values({
      id: templateId,
      userId: LOCAL_USER_ID,
      name: seed.name,
      sort: index,
      isSeed: true,
      updatedAt: now,
    });
    await db.insert(templateTasks).values(
      seed.tasks.map((task, sort) => ({
        id: id(),
        templateId,
        name: task.name,
        type: task.type,
        target: task.target ?? null,
        unit: task.unit ?? null,
        sort,
        updatedAt: now,
      })),
    );
  }
}

export async function listTemplates(): Promise<TemplateWithTasks[]> {
  const rows = await db
    .select()
    .from(templates)
    .where(and(eq(templates.userId, LOCAL_USER_ID), isNull(templates.deletedAt)))
    .orderBy(asc(templates.sort));

  const result: TemplateWithTasks[] = [];
  for (const row of rows) {
    const tasks = await db
      .select()
      .from(templateTasks)
      .where(and(eq(templateTasks.templateId, row.id), isNull(templateTasks.deletedAt)))
      .orderBy(asc(templateTasks.sort));
    result.push({
      id: row.id,
      name: row.name,
      isSeed: row.isSeed,
      lastUsedOn: row.lastUsedOn,
      tasks,
    });
  }
  return result;
}
