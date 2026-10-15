import { backupSchema, type Backup, type Project } from '../types/models';
import { now, uid } from '../lib/utils';
import { validateProject } from './validation';
import { db } from './db';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export function exportBackup(projects: Project[]): string {
  const backup: Backup = {
    format: 'it-productivity-toolbox',
    version: 2,
    exportedAt: now(),
    projects: projects.map(validateProject),
  };
  const content = JSON.stringify(backupSchema.parse(backup), null, 2);
  if (new TextEncoder().encode(content).byteLength > MAX_IMPORT_BYTES)
    throw new Error('The backup exceeds the 5 MiB import limit.');
  return content;
}
export function parseBackup(content: string): Backup {
  if (new TextEncoder().encode(content).byteLength > MAX_IMPORT_BYTES)
    throw new Error('The backup exceeds the 5 MiB import limit.');
  let input: unknown;
  try {
    input = JSON.parse(content);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const result = backupSchema.safeParse(input);
  if (!result.success)
    throw new Error(
      'Unsupported or invalid backup. Expected Toolbox backup format version 1 or 2.',
    );
  result.data.projects.forEach(validateProject);
  if (new Set(result.data.projects.map((p) => p.id)).size !== result.data.projects.length)
    throw new Error('Duplicate project identifiers in backup.');
  return result.data;
}
export function copyProject(project: Project): Project {
  const map = new Map<string, string>();
  const remap = (old: string): string => {
    if (!map.has(old)) map.set(old, uid());
    return map.get(old)!;
  };
  // Zod creates independent nested records, even if the source reused array references.
  const copy = validateProject(project);
  copy.id = remap(copy.id);
  copy.name = `${copy.name.slice(0, 160)} (restored)`;
  copy.demo = false;
  copy.revision = 0;
  copy.createdAt = now();
  copy.updatedAt = now();
  for (const b of copy.baselines) {
    b.id = remap(b.id);
    for (const item of b.items) {
      item.id = remap(item.id);
      item.dependencies = item.dependencies.map(remap);
    }
  }
  for (const d of copy.decisions) d.id = remap(d.id);
  for (const s of copy.stories) s.id = remap(s.id);
  for (const b of copy.brands) b.id = remap(b.id);
  for (const s of copy.stories) {
    for (const r of s.requirements) r.id = remap(r.id);
    for (const scenario of s.scenarios) {
      scenario.id = remap(scenario.id);
      scenario.requirementIds = scenario.requirementIds.map(remap);
    }
  }
  for (const c of copy.changes) {
    c.id = remap(c.id);
    c.baselineId = remap(c.baselineId);
    c.targetId = c.targetId ? remap(c.targetId) : '';
    c.dependencies = c.dependencies.map(remap);
  }
  for (const r of copy.relations) {
    r.id = remap(r.id);
    r.from.id = remap(r.from.id);
    r.to.id = remap(r.to.id);
  }
  return validateProject(copy);
}
export async function restoreBackup(backup: Backup) {
  // Revalidate at the write boundary; all projects succeed or none are imported.
  const verified = parseBackup(JSON.stringify(backup));
  const copies = verified.projects.map(copyProject);
  await db.transaction('rw', db.projects, async () => {
    await db.projects.bulkAdd(copies);
  });
  return copies;
}
