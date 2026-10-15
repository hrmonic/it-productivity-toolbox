import type { Project } from '../../shared/types/models';
import { entities, sameRef, type EntityRef } from './domain';

// Follow recorded links in either direction. A path indicates review scope, never inferred causality.
export function impactPaths(project: Project, source: EntityRef) {
  const all = entities(project),
    seen = new Set([source.id]);
  const queue: { ref: EntityRef; path: string[] }[] = [{ ref: source, path: [] }];
  const result: { ref: EntityRef; title: string; path: string[] }[] = [];
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i]!;
    for (const relation of project.relations) {
      const next = sameRef(relation.from, current.ref)
        ? relation.to
        : sameRef(relation.to, current.ref)
          ? relation.from
          : null;
      if (!next || seen.has(next.id)) continue;
      seen.add(next.id);
      const entity = all.find((e) => sameRef(e, next));
      if (!entity) continue;
      const path = [...current.path, relation.id];
      queue.push({ ref: next, path });
      result.push({ ref: next, title: entity.title, path });
    }
  }
  return result;
}
