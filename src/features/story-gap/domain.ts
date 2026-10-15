import { storyContentSchema, type Story, type StoryContent } from '../../shared/types/models';
import { now, uid } from '../../shared/lib/utils';

export type Observation = {
  id: string;
  category: string;
  level: 'attention' | 'question';
  quote: string;
  explanation: string;
  suggestion: string;
};
export function emptyStory(): StoryContent {
  return {
    title: '',
    context: '',
    persona: '',
    need: '',
    value: '',
    description: '',
    criteria: '',
    rules: '',
    constraints: '',
    dependencies: '',
  };
}
export function createStory(content: StoryContent): Story {
  const valid = storyContentSchema.parse(content);
  return {
    ...valid,
    id: uid(),
    createdAt: now(),
    updatedAt: now(),
    original: valid,
    history: [],
    reviews: [],
  };
}
export function reviseStory(previous: Story, content: StoryContent): Story {
  const valid = storyContentSchema.parse(content);
  if (JSON.stringify(storyContentSchema.parse(previous)) === JSON.stringify(valid)) return previous;
  return {
    ...previous,
    ...valid,
    updatedAt: now(),
    reviews: [],
    history: [...previous.history, { at: now(), content: storyContentSchema.parse(previous) }],
  };
}
// A provider boundary for future opt-in services. The shipped provider is deterministic and local.
export interface StoryAnalyzer {
  id: string;
  analyze(story: StoryContent): Observation[];
}
export const localAnalyzer: StoryAnalyzer = { id: 'local-rules-v1', analyze: analyzeStory };
export function analyzeStory(story: StoryContent): Observation[] {
  const result: Observation[] = [];
  const add = (
    id: string,
    category: string,
    quote: string,
    explanation: string,
    suggestion: string,
    level: Observation['level'] = 'attention',
  ) => result.push({ id, category, quote, explanation, suggestion, level });
  const prose = [
    story.description,
    story.need,
    story.value,
    story.criteria,
    story.context,
    story.rules,
    story.constraints,
    story.dependencies,
  ].join('\n');
  if (
    !story.persona.trim() &&
    !/(?:as (?:an?|the)\s+\w+|en tant qu(?:e\s+|['’])\p{L}+)/iu.test(prose)
  )
    add(
      'persona',
      'Need clarity',
      '',
      'The intended user is not identified.',
      'Who needs this capability, and in what situation?',
    );
  if (
    !story.need.trim() &&
    !/(?:i (?:want|need|would like)\s+\w+|je (?:veux|souhaite|dois|peux)\s+\p{L}+)/iu.test(prose)
  )
    add(
      'need',
      'Need clarity',
      '',
      'No explicit need was found in the structured field or common story wording.',
      'What action should the user be able to perform?',
    );
  if (
    !story.value.trim() &&
    !/(?:so (?:that|i can)\s+\w+|afin de\s+\p{L}+|pour (?:pouvoir|que)\s+\p{L}+)/iu.test(prose)
  )
    add(
      'value',
      'User value',
      '',
      'The expected benefit is not explicit.',
      'What outcome makes this valuable to the user?',
    );
  const ambiguous = [
    'fast',
    'quickly',
    'intuitive',
    'easily',
    'easy',
    'user-friendly',
    'correctly',
    'seamless',
    'efficient',
    'rapide',
    'rapidement',
    'intuitif',
    'intuitive',
    'facile',
    'facilement',
    'correctement',
    'efficace',
    'efficacement',
    'fluide',
  ];
  for (const term of new Set(ambiguous))
    if (new RegExp(`\\b${term}\\b`, 'i').test(prose))
      add(
        `ambiguous-${term}`,
        'Points to clarify',
        term,
        `“${term}” is subjective and does not define an observable threshold.`,
        `What observable condition would demonstrate “${term}”? Agree on a measurable expectation.`,
      );
  if (!story.criteria.trim())
    add(
      'criteria-missing',
      'Acceptance criteria',
      '',
      'No acceptance criteria are recorded.',
      'Given [confirmed context], when [the requested action occurs], then [an observable result]. Replace each placeholder with an agreed fact.',
    );
  else if (
    !/\b(?:then|display|show|return|contain|download|reject|save|receive|equal|must|should|alors|affiche|afficher|retourne|contient|reçoit|enregistre|doit)\b/i.test(
      story.criteria,
    ) &&
    !/\d/.test(story.criteria)
  )
    add(
      'criteria-observable',
      'Acceptance criteria',
      story.criteria,
      'No common observable-result wording or numeric threshold was found. This is a heuristic, not a verdict.',
      'Which output or state change will demonstrate that each criterion has been met?',
    );
  if (
    !/\b(?:error|fail|invalid|denied|unavailable|timeout|offline|erreur|échec|invalide|refusé|indisponible|hors ligne)\b/i.test(
      prose,
    )
  )
    add(
      'errors',
      'Edge cases',
      '',
      'No error condition is mentioned in the story or criteria.',
      'Which failure conditions are relevant here, and what feedback should the user receive?',
      'question',
    );
  const exportMatch = prose.match(
    /\b(?:exports?|exporter|exportation|download|télécharger|téléchargement)\b/i,
  );
  if (exportMatch) {
    if (!/\b(?:csv|json|pdf|markdown|xlsx|xml)\b/i.test(prose))
      add(
        'export-format',
        'Acceptance criteria',
        exportMatch[0],
        'The export format is not specified.',
        'Which export format and fields are required?',
        'question',
      );
    if (
      !/\b(?:permissions?|roles?|rôles?|droits?|autorisations?|authori[sz](?:ation|ed|e)|access|accès)\b/i.test(
        prose,
      )
    )
      add(
        'export-access',
        'Business rules',
        exportMatch[0],
        'Export permissions are not described.',
        'Who may export these data, and what scope may they access?',
        'question',
      );
    if (!/\b(?:empty|no data|zero|vide|aucune donnée|absence de données|zéro)\b/i.test(prose))
      add(
        'export-empty',
        'Edge cases',
        exportMatch[0],
        'The empty-data case is not described.',
        'What should happen when there are no data to export?',
        'question',
      );
  }
  if (!story.rules.trim())
    add(
      'business-rules',
      'Business rules',
      '',
      'No business rules are recorded. They may be unnecessary; confirm with the team.',
      'Are there eligibility, permission, or data-handling rules to confirm?',
      'question',
    );
  if (!story.dependencies.trim())
    add(
      'dependencies',
      'Dependencies',
      '',
      'Dependencies have not been described.',
      'Does this story depend on another deliverable, decision, or external service? Record “None identified” if reviewed.',
      'question',
    );
  return result;
}
export function storyMarkdown(story: Story) {
  const questions = analyzeStory(story).filter(
    (o) => !story.reviews.some((r) => r.ruleId === o.id && r.state === 'ignored'),
  );
  return `# ${story.title}\n\nID: ${story.id}\n\n## Context\n${story.context}\n\n## User and need\n${story.persona}\n${story.need}\n\n## Value\n${story.value}\n\n## Description\n${story.description}\n\n## Acceptance criteria\n${story.criteria}\n\n## Business rules\n${story.rules}\n\n## Constraints\n${story.constraints}\n\n## Dependencies\n${story.dependencies}\n\n## Accepted refinement notes\n${story.reviews
    .filter((r) => r.state === 'accepted')
    .map((r) => `- ${r.text}`)
    .join(
      '\n',
    )}\n\n## Open questions\n${questions.map((o) => `- ${o.suggestion}`).join('\n')}\n\n## Original description\n${story.original.description}\n\nAnalysis: local-rules-v1. Review prompts are not confirmed requirements; INVEST requires team discussion.\n`;
}
