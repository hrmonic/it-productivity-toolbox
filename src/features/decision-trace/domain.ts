import {
  decisionContentSchema,
  type Decision,
  type DecisionContent,
} from '../../shared/types/models';
import { now, today, uid } from '../../shared/lib/utils';

export function emptyDecision(): DecisionContent {
  return {
    title: '',
    context: '',
    owner: '',
    stakeholders: [],
    date: today(),
    status: 'proposed',
    alternatives: [],
    solution: '',
    rationale: '',
    assumptions: '',
    constraints: '',
    risks: '',
    references: [],
    tags: [],
    reviewDate: '',
  };
}
export function createDecision(content: DecisionContent): Decision {
  const valid = decisionContentSchema.parse(content);
  return { ...valid, id: uid(), createdAt: now(), updatedAt: now(), archived: false, history: [] };
}
export function reviseDecision(
  previous: Decision,
  content: DecisionContent,
  reason: string,
): Decision {
  const valid = decisionContentSchema.parse(content);
  const old = decisionContentSchema.parse(previous);
  if (JSON.stringify(old) === JSON.stringify(valid)) return previous;
  if (!reason.trim()) throw new Error('Explain why this decision changed.');
  return {
    ...previous,
    ...valid,
    updatedAt: now(),
    history: [...previous.history, { at: now(), reason: reason.trim(), content: old }],
  };
}
export function decisionWarnings(decision: Decision, date = today()) {
  const warnings: string[] = [];
  if (!decision.owner.trim()) warnings.push('No owner recorded. Assign someone to follow up.');
  if (!decision.rationale.trim())
    warnings.push('No rationale recorded. Capture why this approach was chosen.');
  if (
    decision.reviewDate &&
    decision.reviewDate < date &&
    !decision.archived &&
    decision.status !== 'superseded'
  )
    warnings.push('Review date has passed. Revisit the assumptions with the owner.');
  if (decision.status === 'accepted' && !decision.solution.trim())
    warnings.push('Accepted without a recorded solution. Document what was agreed.');
  return warnings;
}
export function decisionMarkdown(decisions: Decision[]) {
  return decisions
    .map(
      (d) =>
        `# ${d.title}\n\nStatus: ${d.status} | Owner: ${d.owner || 'Not recorded'} | Date: ${d.date}\nID: ${d.id}\n\n## Context\n${d.context}\n\n## Selected solution\n${d.solution}\n\n## Rationale\n${d.rationale}\n\n## Alternatives\n${d.alternatives.map((a) => `### ${a.name}\nPros: ${a.pros}\nCons: ${a.cons}`).join('\n\n')}\n\n## Assumptions\n${d.assumptions}\n\n## Constraints\n${d.constraints}\n\n## Risks\n${d.risks}\n\n## Stakeholders\n${d.stakeholders.join(', ')}\n\n## References\n${d.references.join('\n')}\n\nTags: ${d.tags.join(', ')}\nReview: ${d.reviewDate || 'Not scheduled'}\n\n## Revision history\n${d.history.map((h) => `- ${h.at}: ${h.reason}\n  Previous status: ${h.content.status}; previous rationale: ${h.content.rationale}`).join('\n')}`,
    )
    .join('\n\n---\n\n');
}
