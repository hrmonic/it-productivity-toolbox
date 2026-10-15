import type { Baseline, Change } from '../../shared/types/models';
import { calculateScope } from './domain';

export function scopeEvolution(baseline: Baseline, changes: Change[]) {
  const relevant = changes.filter((c) => c.baselineId === baseline.id);
  return [...new Set(relevant.filter((c) => c.status === 'accepted').map((c) => c.date))]
    .sort()
    .map((date) => ({
      date,
      result: calculateScope(
        baseline,
        relevant.filter((c) => c.date <= date),
      ),
    }));
}
export function affectedDeliverables(
  baseline: Baseline,
  changes: Change[],
  id: string,
  simulation: string[] = [],
) {
  const current = calculateScope(baseline, changes, simulation);
  const items = [
    ...baseline.items,
    ...current.items.filter((i) => !baseline.items.some((b) => b.id === i.id)),
  ].map((i) => current.items.find((c) => c.id === i.id) ?? i);
  const seen = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items)
      if (!seen.has(item.id) && item.dependencies.some((d) => seen.has(d))) {
        seen.add(item.id);
        changed = true;
      }
  }
  return items.filter((i) => i.id !== id && seen.has(i.id));
}
