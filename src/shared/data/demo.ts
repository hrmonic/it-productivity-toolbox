import type { Project } from '../types/models';
import { createDecision } from '../../features/decision-trace/domain';
import { createStory } from '../../features/story-gap/domain';
import { linkEntities } from '../../features/traceability/domain';
import { now, today, uid } from '../lib/utils';

export function createProject(name: string, description = ''): Project {
  return {
    id: uid(),
    name: name.trim(),
    description,
    demo: false,
    createdAt: now(),
    updatedAt: now(),
    revision: 0,
    decisions: [],
    baselines: [],
    changes: [],
    stories: [],
    relations: [],
  };
}
export function demoProject(): Project {
  const p = createProject(
    'Atlas customer portal',
    'A fictional delivery team making a customer portal easier to use. Explore the decisions, changes, and stories behind the work.',
  );
  p.demo = true;
  const d = createDecision({
    title: 'Make data exports self-service',
    context:
      'Support currently prepares account exports manually. Customers need a repeatable way to retrieve their own records.',
    owner: 'Alex Morgan (fictional)',
    stakeholders: ['Product', 'Engineering', 'Customer support'],
    date: today(),
    status: 'accepted',
    alternatives: [
      {
        name: 'Keep support-assisted exports',
        pros: 'No implementation effort.',
        cons: 'Continued wait time and support effort.',
      },
      {
        name: 'Add self-service CSV export',
        pros: 'Customers can retrieve records directly.',
        cons: 'Requires access-control and failure handling.',
      },
    ],
    solution: 'Offer CSV export from the account workspace.',
    rationale:
      'A focused self-service flow addresses a recurring request without introducing a reporting platform.',
    assumptions: 'The existing account model defines the accessible record scope.',
    constraints: 'No changes to the authorization model in this release.',
    risks: 'Large exports may require a later asynchronous workflow.',
    references: [],
    tags: ['customer-experience', 'release-1'],
    reviewDate: '',
  });
  p.decisions.push(
    d,
    createDecision({
      ...d,
      title: 'Keep the first release focused on desktop workflows',
      status: 'proposed',
      solution: '',
      rationale: 'Validate the main workflow before expanding the release scope.',
      tags: ['release-1'],
      alternatives: [],
    }),
  );
  const account = uid(),
    activity = uid(),
    settings = uid();
  const baselineId = uid();
  p.baselines.push({
    id: baselineId,
    version: 1,
    objective:
      'Give customers a reliable account workspace with clear access to their own records.',
    date: today(),
    unit: 'days',
    assumptions: 'Estimates are fictional planning inputs, not delivery commitments.',
    constraints: 'One release; existing account service.',
    frozenAt: now(),
    items: [
      { id: account, title: 'Account overview', priority: 'must', estimate: 5, dependencies: [] },
      {
        id: activity,
        title: 'Activity timeline',
        priority: 'must',
        estimate: 8,
        dependencies: [account],
      },
      {
        id: settings,
        title: 'Workspace settings',
        priority: 'should',
        estimate: 3,
        dependencies: [account],
      },
    ],
  });
  const change = {
    id: uid(),
    baselineId,
    title: 'Self-service CSV export',
    description: 'Add an export action for customer account records.',
    justification: 'Implements the self-service export decision.',
    author: 'Sam Chen (fictional)',
    date: today(),
    type: 'addition' as const,
    status: 'accepted' as const,
    targetId: '',
    estimate: 4,
    priority: 'must' as const,
    dependencies: [account],
    risks: 'Confirm the maximum supported export size.',
    createdAt: now(),
    updatedAt: now(),
  };
  p.changes.push(
    change,
    {
      ...change,
      id: uid(),
      title: 'Saved export presets',
      description: 'Let customers save their export column selection.',
      status: 'proposed',
      justification: 'Potential follow-up for repeat exports.',
      estimate: 3,
      priority: 'could',
      risks: '',
    },
    {
      ...change,
      id: uid(),
      title: 'Custom reporting dashboard',
      description: 'Add a configurable reporting dashboard.',
      status: 'rejected',
      justification: 'Outside the focused first release.',
      estimate: 13,
      priority: 'could',
      risks: '',
    },
  );
  const story = createStory({
    title: 'Export account records',
    context: 'Customers request their account records through support today.',
    persona: 'Account administrator',
    need: 'Export the records available in my account workspace.',
    value: 'Prepare internal reporting without waiting for support.',
    description:
      'As an account administrator, I want to export my account records easily, so that I can prepare internal reports.',
    criteria:
      'Given an authenticated account administrator with accessible records, when they request a CSV export, then a CSV file containing those records is downloaded.',
    rules: 'Apply the existing account access permissions.',
    constraints: 'CSV only for the first release.',
    dependencies: 'Account overview and existing authorization rules.',
  });
  p.stories.push(
    story,
    createStory({
      title: 'Understand the activity timeline',
      context: 'Customers need to understand recent account activity.',
      persona: 'Account administrator',
      need: 'See account activity in chronological order.',
      value: 'Understand recent updates.',
      description: 'As an account administrator, I want a fast and intuitive activity timeline.',
      criteria: '',
      rules: '',
      constraints: '',
      dependencies: 'Account overview',
    }),
  );
  p.relations.push(
    linkEntities(
      p,
      { kind: 'decision', id: d.id },
      { kind: 'change', id: change.id },
      'informs',
      'The decision provides the rationale for this scope addition.',
    ),
  );
  p.relations.push(
    linkEntities(
      p,
      { kind: 'change', id: change.id },
      { kind: 'story', id: story.id },
      'affects',
      'The story describes the export behavior introduced by this change.',
    ),
  );
  return p;
}
