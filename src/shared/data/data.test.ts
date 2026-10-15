import { beforeEach, describe, expect, it } from 'vitest';
import { db, insertProject, saveProject } from './db';
import { demoProject, createProject } from './demo';
import { copyProject, exportBackup, MAX_IMPORT_BYTES, parseBackup, restoreBackup } from './backup';
import { validateProject } from './validation';
import { entities, linkEntities, related } from '../../features/traceability/domain';
import { uid } from '../lib/utils';

beforeEach(async () => {
  await db.projects.clear();
});
describe('projects, persistence and immutable agreements', () => {
  it('validates the coherent fictional demonstration', () => {
    expect(validateProject(demoProject()).demo).toBe(true);
  });
  it('persists separate projects in IndexedDB', async () => {
    const a = createProject('A'),
      b = createProject('B');
    await insertProject(a);
    await insertProject(b);
    await saveProject({ ...a, description: 'Only A' });
    expect((await db.projects.get(b.id))?.description).toBe('');
    expect((await db.projects.get(a.id))?.description).toBe('Only A');
  });
  it('refuses stale writes from another tab', async () => {
    const p = createProject('A');
    await insertProject(p);
    await saveProject({ ...p, name: 'Updated' });
    await expect(saveProject({ ...p, name: 'Stale' })).rejects.toThrow('another tab');
    expect((await db.projects.get(p.id))?.name).toBe('Updated');
  });
  it('protects frozen baselines at the write boundary', async () => {
    const p = demoProject();
    await insertProject(p);
    p.baselines[0]!.objective = 'Silently changed';
    await expect(saveProject(p)).rejects.toThrow('frozen baseline');
  });
  it('allows a new baseline version while preserving the first', async () => {
    const p = demoProject();
    await insertProject(p);
    await saveProject({
      ...p,
      baselines: [...p.baselines, { ...p.baselines[0]!, id: uid(), version: 2, frozenAt: null }],
    });
    expect((await db.projects.get(p.id))?.baselines).toHaveLength(2);
  });
  it('protects accepted and rejected change ledger entries', async () => {
    const p = demoProject();
    await insertProject(p);
    p.changes[0]!.estimate = 900;
    await expect(saveProject(p)).rejects.toThrow('immutable');
  });
  it('rejects changes against draft baselines', () => {
    const p = demoProject();
    p.baselines[0]!.frozenAt = null;
    expect(() => validateProject(p)).toThrow('frozen baseline');
  });
  it('rejects invalid deliverable references and negative additions', () => {
    const p = demoProject();
    p.changes[0]!.dependencies = [uid()];
    expect(() => validateProject(p)).toThrow('dependencies');
    p.changes[0]!.dependencies = [];
    p.changes[0]!.estimate = -1;
    expect(() => validateProject(p)).toThrow('negative');
  });
});
describe('typed, bidirectional traceability', () => {
  it('finds a relationship from either endpoint', () => {
    const p = demoProject(),
      r = p.relations[0]!;
    expect(related(p, r.from)).toContain(r);
    expect(related(p, r.to)).toContain(r);
  });
  it('rejects self links, duplicate pairs and cross-project endpoints', () => {
    const p = demoProject(),
      a = entities(p)[0]!,
      b = entities(demoProject())[0]!;
    expect(() => linkEntities(p, a, a, 'relates-to', '')).toThrow('itself');
    expect(() => linkEntities(p, a, b, 'relates-to', '')).toThrow('this project');
    const r = p.relations[0]!;
    expect(() => linkEntities(p, r.to, r.from, 'affects', '')).toThrow('already linked');
  });
  it('rejects dangling imported relationships', () => {
    const p = demoProject();
    p.relations[0]!.to.id = uid();
    expect(() => validateProject(p)).toThrow('invalid reference');
  });
  it('rejects duplicate object IDs', () => {
    const p = demoProject();
    p.stories[0]!.id = p.decisions[0]!.id;
    expect(() => validateProject(p)).toThrow('Duplicate');
  });
});
describe('portable, validated backups', () => {
  it('round-trips the complete project including histories and links', () => {
    const p = demoProject();
    expect(parseBackup(exportBackup([p])).projects[0]).toEqual(p);
  });
  it('restores as copies and remaps every reference', async () => {
    const p = demoProject();
    await insertProject(p);
    const [copy] = await restoreBackup(parseBackup(exportBackup([p])));
    expect(copy?.id).not.toBe(p.id);
    expect(copy?.demo).toBe(false);
    expect(copy?.name).toContain('(restored)');
    expect(copy?.relations[0]?.from.id).toBe(copy?.decisions[0]?.id);
    expect(copy?.changes[0]?.baselineId).toBe(copy?.baselines[0]?.id);
    expect(copy?.changes[0]?.dependencies[0]).toBe(copy?.baselines[0]?.items[0]?.id);
    expect(await db.projects.count()).toBe(2);
    expect(await db.projects.get(p.id)).toEqual(p);
  });
  it('preserves stable item references across baseline versions in a copy', () => {
    const p = demoProject();
    p.baselines.push({ ...p.baselines[0]!, id: uid(), version: 2 });
    const copy = copyProject(p);
    expect(copy.baselines[0]?.items[0]?.id).toBe(copy.baselines[1]?.items[0]?.id);
  });
  it('rejects malformed, unsupported, and oversized imports', () => {
    expect(() => parseBackup('{')).toThrow('valid JSON');
    expect(() => parseBackup('{"version":99}')).toThrow('Unsupported');
    expect(() => parseBackup(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow('5 MiB');
  });
  it('rejects extra top-level fields and repeated projects', () => {
    const p = demoProject(),
      backup = JSON.parse(exportBackup([p])) as Record<string, unknown>;
    expect(() => parseBackup(JSON.stringify({ ...backup, extra: true }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ ...backup, projects: [p, p] }))).toThrow(
      'Duplicate project',
    );
  });
  it('revalidates before restoring and leaves the database untouched on failure', async () => {
    const backup = parseBackup(exportBackup([demoProject()]));
    backup.projects[0]!.relations[0]!.from.id = uid();
    await expect(restoreBackup(backup)).rejects.toThrow();
    expect(await db.projects.count()).toBe(0);
  });
});
