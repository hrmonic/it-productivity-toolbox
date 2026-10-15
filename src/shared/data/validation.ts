import { projectSchema, type Project } from '../types/models';
import { entities, sameRef } from '../../features/traceability/domain';

export function validateProject(input: unknown): Project {
  const p = projectSchema.parse(input);
  const unique = (ids: string[], what: string) => {
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${what} identifiers.`);
  };
  unique(
    [
      p.id,
      ...p.decisions.map((d) => d.id),
      ...p.changes.map((c) => c.id),
      ...p.stories.map((s) => s.id),
      ...p.baselines.map((b) => b.id),
      ...p.relations.map((r) => r.id),
    ],
    'record',
  );
  unique(
    p.baselines.map((b) => String(b.version)),
    'baseline version',
  );
  if (p.baselines.some((b, i) => i > 0 && b.version <= p.baselines[i - 1]!.version))
    throw new Error('Baseline versions must be ordered.');
  for (const b of p.baselines) {
    unique(
      b.items.map((i) => i.id),
      'deliverable',
    );
    if (b.items.some((i) => i.dependencies.includes(i.id)))
      throw new Error('A deliverable cannot depend on itself.');
    if (
      b.items.some((i) => i.dependencies.some((dep) => !b.items.some((other) => other.id === dep)))
    )
      throw new Error('Baseline dependencies must reference its deliverables.');
  }
  for (const c of p.changes) {
    const b = p.baselines.find((b) => b.id === c.baselineId);
    if (!b?.frozenAt) throw new Error('Changes require a frozen baseline.');
    if (c.type === 'addition' && c.estimate !== null && c.estimate < 0)
      throw new Error('An addition cannot have negative effort.');
    const availableIds = new Set([
      ...b.items.map((i) => i.id),
      ...p.changes
        .filter((other) => other.baselineId === b.id && other.type === 'addition')
        .map((other) => other.id),
    ]);
    if (!['addition', 'constraint'].includes(c.type) && !availableIds.has(c.targetId))
      throw new Error('The change target does not belong to this baseline.');
    if (c.dependencies.includes(c.id) || c.dependencies.some((dep) => !availableIds.has(dep)))
      throw new Error('Change dependencies must reference this baseline or its additions.');
  }
  const all = entities(p);
  const pairs = new Set<string>();
  for (const r of p.relations) {
    if (
      sameRef(r.from, r.to) ||
      !all.some((e) => sameRef(e, r.from)) ||
      !all.some((e) => sameRef(e, r.to))
    )
      throw new Error('A traceability link contains an invalid reference.');
    const pair = [r.from.id, r.to.id].sort().join(':');
    if (pairs.has(pair)) throw new Error('Duplicate traceability link.');
    pairs.add(pair);
  }
  for (const s of p.stories)
    unique(
      s.reviews.map((r) => r.ruleId),
      'suggestion review',
    );
  return p;
}
