import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { LOCAL_USER_ID, templates, templateTasks } from '@/db/schema';
import { SEED_TEMPLATES } from '@/lib/content/seedTemplates';
import type { Template, TemplateTaskDef } from '@/lib/domain';
import { id } from '@/lib/id';

/**
 * Returns domain types, never Drizzle rows. The web build (Phase 7) provides a
 * second implementation of this exact signature backed by IndexedDB, so nothing
 * in here may leak a table shape past the return type.
 */

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

/** One query for the templates, one for all their tasks. No N+1. */
export async function listTemplates(): Promise<Template[]> {
  const rows = await db
    .select()
    .from(templates)
    .where(and(eq(templates.userId, LOCAL_USER_ID), isNull(templates.deletedAt)))
    .orderBy(asc(templates.sort));

  if (!rows.length) return [];

  const taskRows = await db
    .select()
    .from(templateTasks)
    .where(
      and(
        inArray(templateTasks.templateId, rows.map((r) => r.id)),
        isNull(templateTasks.deletedAt),
      ),
    )
    .orderBy(asc(templateTasks.sort));

  const byTemplate = new Map<string, TemplateTaskDef[]>();
  for (const t of taskRows) {
    const list = byTemplate.get(t.templateId) ?? [];
    list.push({ id: t.id, name: t.name, type: t.type, target: t.target, unit: t.unit, sort: t.sort });
    byTemplate.set(t.templateId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isSeed: row.isSeed,
    copiedFrom: row.copiedFrom,
    lastUsedOn: row.lastUsedOn,
    tasks: byTemplate.get(row.id) ?? [],
  }));
}

export async function getTemplate(templateId: string): Promise<Template | null> {
  return (await listTemplates()).find((t) => t.id === templateId) ?? null;
}

export async function createTemplate(name: string): Promise<Template> {
  const existing = await listTemplates();
  const templateId = id();
  await db.insert(templates).values({
    id: templateId,
    userId: LOCAL_USER_ID,
    name: name.trim() || 'New template',
    sort: existing.length,
    isSeed: false,
    updatedAt: Date.now(),
  });
  return (await getTemplate(templateId))!;
}

export async function renameTemplate(templateId: string, name: string): Promise<void> {
  await db
    .update(templates)
    .set({ name: name.trim() || 'Untitled', updatedAt: Date.now() })
    .where(eq(templates.id, templateId));
}

/**
 * DEEP COPY. The new template shares nothing with its origin, so customising it
 * can never affect the original or any day already logged against it.
 * `copiedFrom` is provenance only — never a live link.
 */
export async function duplicateTemplate(templateId: string): Promise<Template> {
  const source = await getTemplate(templateId);
  if (!source) throw new Error(`No template ${templateId}`);

  const all = await listTemplates();
  const copyId = id();
  const now = Date.now();

  await db.insert(templates).values({
    id: copyId,
    userId: LOCAL_USER_ID,
    name: `${source.name} copy`,
    sort: all.length,
    isSeed: false,
    copiedFrom: source.id,
    updatedAt: now,
  });

  if (source.tasks.length) {
    await db.insert(templateTasks).values(
      source.tasks.map((task, sort) => ({
        id: id(),
        templateId: copyId,
        name: task.name,
        type: task.type,
        target: task.target,
        unit: task.unit,
        sort,
        updatedAt: now,
      })),
    );
  }

  return (await getTemplate(copyId))!;
}

/** Soft delete, so the deletion syncs in Phase 4 instead of resurrecting. */
export async function deleteTemplate(templateId: string): Promise<void> {
  await db
    .update(templates)
    .set({ deletedAt: Date.now(), updatedAt: Date.now() })
    .where(eq(templates.id, templateId));
}

export async function addTemplateTask(
  templateId: string,
  task: Omit<TemplateTaskDef, 'id' | 'sort'>,
): Promise<void> {
  const template = await getTemplate(templateId);
  await db.insert(templateTasks).values({
    id: id(),
    templateId,
    name: task.name,
    type: task.type,
    target: task.target,
    unit: task.unit,
    sort: template?.tasks.length ?? 0,
    updatedAt: Date.now(),
  });
}

export async function updateTemplateTask(
  taskId: string,
  patch: Partial<Omit<TemplateTaskDef, 'id'>>,
): Promise<void> {
  await db
    .update(templateTasks)
    .set({ ...patch, updatedAt: Date.now() })
    .where(eq(templateTasks.id, taskId));
}

export async function deleteTemplateTask(taskId: string): Promise<void> {
  await db
    .update(templateTasks)
    .set({ deletedAt: Date.now(), updatedAt: Date.now() })
    .where(eq(templateTasks.id, taskId));
}

/** Persists the given order as `sort`, 0-based. */
export async function reorderTemplateTasks(taskIds: string[]): Promise<void> {
  const now = Date.now();
  for (const [sort, taskId] of taskIds.entries()) {
    await db.update(templateTasks).set({ sort, updatedAt: now }).where(eq(templateTasks.id, taskId));
  }
}
