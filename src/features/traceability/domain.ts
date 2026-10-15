import type { EntityKind, Project, Relation } from '../../shared/types/models';
import { now, uid } from '../../shared/lib/utils';

export type EntityRef = { kind: EntityKind; id: string };
export function entities(project: Project) {
  return [
    ...project.decisions.map((d) => ({ kind: 'decision' as const, id: d.id, title: d.title })),
    ...project.changes.map((c) => ({ kind: 'change' as const, id: c.id, title: c.title })),
    ...project.stories.map((s) => ({ kind: 'story' as const, id: s.id, title: s.title })),
  ];
}
export const sameRef = (a: EntityRef, b: EntityRef) => a.id === b.id && a.kind === b.kind;
export const related = (project: Project, ref: EntityRef) =>
  project.relations.filter((r) => sameRef(r.from, ref) || sameRef(r.to, ref));
export const entityPath = (ref: EntityRef) =>
  `/${{ decision: 'decisions', change: 'scope', story: 'stories' }[ref.kind]}?id=${ref.id}`;
export function linkEntities(
  project: Project,
  from: EntityRef,
  to: EntityRef,
  type: Relation['type'],
  note: string,
): Relation {
  const all = entities(project);
  if (sameRef(from, to)) throw new Error('An item cannot link to itself.');
  if (!all.some((e) => sameRef(e, from)) || !all.some((e) => sameRef(e, to)))
    throw new Error('Both items must exist in this project.');
  if (
    project.relations.some(
      (r) =>
        (sameRef(r.from, from) && sameRef(r.to, to)) ||
        (sameRef(r.from, to) && sameRef(r.to, from)),
    )
  )
    throw new Error('These items are already linked.');
  return { id: uid(), from, to, type, note, createdAt: now() };
}
