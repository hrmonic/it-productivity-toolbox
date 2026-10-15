import { t } from '../../shared/i18n';
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
    assumptionsVerified: false,
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
  if (decision.assumptions.trim() && !decision.assumptionsVerified)
    warnings.push('Recorded assumptions have not been verified.');
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
    .map((d) => {
      const sections: [string, string][] = [
        ['Context', d.context],
        ['Selected solution', d.solution],
        ['Rationale', d.rationale],
        [
          'Alternatives',
          d.alternatives
            .map(
              (a) => `### ${a.name}\n${t('Advantages')}: ${a.pros}\n${t('Trade-offs')}: ${a.cons}`,
            )
            .join('\n\n'),
        ],
        ['Assumptions', d.assumptions],
        ['Constraints', d.constraints],
        ['Known risks', d.risks],
        ['Stakeholders', d.stakeholders.join(', ')],
        ['References', d.references.join('\n')],
        [
          'Revision history',
          d.history
            .map(
              (h) =>
                `- ${h.at}: ${h.reason}\n  ${t('Status')}: ${t(h.content.status)}; ${t('Rationale')}: ${h.content.rationale}`,
            )
            .join('\n'),
        ],
      ];
      return `# ${d.title}\n\n${t('Status')}: ${t(d.status)} | ${t('Owner')}: ${d.owner || t('Not recorded')} | ${t('Date')}: ${d.date}\nID: ${d.id}\n\n${sections.map(([name, text]) => `## ${t(name)}\n${text || t('Not recorded')}`).join('\n\n')}\n\n${t('Tags')}: ${d.tags.join(', ')}\n${t('Review')}: ${d.reviewDate || t('Not scheduled')}`;
    })
    .join('\n\n---\n\n');
}
