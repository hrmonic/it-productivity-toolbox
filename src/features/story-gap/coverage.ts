import type { Story } from '../../shared/types/models';
export function coverage(story: Story) {
  return story.requirements.map((r) => ({
    ...r,
    scenarios: story.scenarios.filter(
      (s) => s.requirementIds.includes(r.id) && s.given.trim() && s.when.trim() && s.then.trim(),
    ),
    uncertainOutcomes: story.scenarios
      .filter(
        (s) =>
          s.requirementIds.includes(r.id) &&
          /\b(fast|easily|correctly|properly|rapidement|facilement|correctement|intuitif)\b/i.test(
            s.then,
          ),
      )
      .map((s) => s.id),
  }));
}
