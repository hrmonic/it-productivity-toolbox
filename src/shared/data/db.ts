import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '../types/models';
import { now } from '../lib/utils';
import { validateProject } from './validation';

export function createDatabase(name = 'it-productivity-toolbox') {
  const database = new Dexie(name) as Dexie & { projects: EntityTable<Project, 'id'> };
  database.version(1).stores({ projects: 'id, name, updatedAt' });
  // Version 2 also prevents an older build from silently discarding studio data.
  database
    .version(2)
    .stores({ projects: 'id, name, updatedAt' })
    .upgrade(async (transaction) => {
      await transaction
        .table('projects')
        .toCollection()
        .modify((record) => {
          try {
            Object.assign(record, validateProject(record));
          } catch {
            /* Preserve invalid historical records for the existing recovery workflow. */
          }
        });
    });
  return database;
}
export const db = createDatabase();

export async function insertProject(project: Project) {
  await db.projects.add(validateProject(project));
}
export async function saveProject(project: Project) {
  const valid = validateProject(project);
  await db.transaction('rw', db.projects, async () => {
    const existing = await db.projects.get(project.id);
    if (!existing || existing.revision !== project.revision)
      throw new Error('This project changed in another tab. Reload it before saving again.');
    // Frozen baseline records are immutable, including across application bugs.
    for (const baseline of existing.baselines.filter((b) => b.frozenAt)) {
      if (
        JSON.stringify(valid.baselines.find((b) => b.id === baseline.id)) !==
        JSON.stringify(baseline)
      )
        throw new Error('A frozen baseline cannot be changed. Create a new version instead.');
    }
    for (const change of existing.changes.filter((c) => c.status !== 'proposed')) {
      if (JSON.stringify(valid.changes.find((c) => c.id === change.id)) !== JSON.stringify(change))
        throw new Error(
          'Accepted and rejected changes are immutable. Record a new change instead.',
        );
    }
    await db.projects.put({ ...valid, revision: valid.revision + 1, updatedAt: now() });
  });
}
export async function deleteProject(id: string) {
  await db.projects.delete(id);
}
