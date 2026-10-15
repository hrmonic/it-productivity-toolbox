import { z } from 'zod';
import { brandSchema } from './brand';

const text = z.string().max(30_000);
const title = z.string().trim().min(1).max(180);
const id = z.string().uuid();
const date = z.iso.date();
const timestamp = z.iso.datetime();
const list = z.array(text).max(200);
export const entityKindSchema = z.enum(['decision', 'change', 'story']);
export type EntityKind = z.infer<typeof entityKindSchema>;
export const decisionContentSchema = z.object({
  title,
  context: text,
  owner: z.string().max(200),
  stakeholders: list,
  date,
  status: z.enum(['proposed', 'accepted', 'rejected', 'superseded']),
  alternatives: z.array(z.object({ name: title, pros: text, cons: text })).max(30),
  solution: text,
  rationale: text,
  assumptions: text,
  assumptionsVerified: z.boolean().default(false),
  constraints: text,
  risks: text,
  references: z
    .array(z.url().refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS link.'))
    .max(50),
  tags: z.array(z.string().max(60)).max(30),
  reviewDate: z.union([date, z.literal('')]),
});
export const decisionSchema = decisionContentSchema.extend({
  id,
  createdAt: timestamp,
  updatedAt: timestamp,
  archived: z.boolean(),
  history: z
    .array(z.object({ at: timestamp, reason: text, content: decisionContentSchema }))
    .max(500),
});
export type Decision = z.infer<typeof decisionSchema>;
export type DecisionContent = z.infer<typeof decisionContentSchema>;
export const deliverableSchema = z.object({
  id,
  title,
  priority: z.enum(['must', 'should', 'could']),
  estimate: z.number().finite().nonnegative().max(1_000_000).nullable(),
  dependencies: z.array(id).max(200),
});
export type Deliverable = z.infer<typeof deliverableSchema>;
export const baselineSchema = z.object({
  id,
  version: z.number().int().positive(),
  objective: text,
  date,
  unit: z.enum(['days', 'points']),
  assumptions: text,
  constraints: text,
  items: z.array(deliverableSchema).max(1000),
  frozenAt: timestamp.nullable(),
});
export type Baseline = z.infer<typeof baselineSchema>;
export const changeSchema = z.object({
  id,
  baselineId: id,
  title,
  description: text,
  justification: text,
  author: z.string().max(200),
  date,
  type: z.enum(['addition', 'modification', 'removal', 'constraint', 'priority']),
  status: z.enum(['proposed', 'accepted', 'rejected']),
  targetId: z.union([id, z.literal('')]),
  estimate: z.number().finite().min(-1_000_000).max(1_000_000).nullable(),
  priority: z.enum(['must', 'should', 'could']),
  dependencies: z.array(id).max(200),
  risks: text,
  createdAt: timestamp,
  updatedAt: timestamp,
});
export type Change = z.infer<typeof changeSchema>;
export const storyContentSchema = z.object({
  title,
  context: text,
  persona: text,
  need: text,
  value: text,
  description: text,
  criteria: text,
  rules: text,
  constraints: text,
  dependencies: text,
});
export const suggestionReviewSchema = z.object({
  ruleId: z.string().max(100),
  state: z.enum(['accepted', 'ignored']),
  text,
});
export const storySchema = storyContentSchema.extend({
  id,
  createdAt: timestamp,
  updatedAt: timestamp,
  original: storyContentSchema,
  history: z.array(z.object({ at: timestamp, content: storyContentSchema })).max(500),
  reviews: z.array(suggestionReviewSchema).max(200),
  scenarios: z
    .array(
      z.object({
        id,
        kind: z.enum(['nominal', 'error', 'boundary', 'permission', 'constraint']),
        given: text,
        when: text,
        then: text,
        requirementIds: z.array(id).max(200),
      }),
    )
    .max(200)
    .default([]),
  requirements: z.array(z.object({ id, text })).max(200).default([]),
});
export type Story = z.infer<typeof storySchema>;
export type StoryContent = z.infer<typeof storyContentSchema>;
export const relationSchema = z.object({
  id,
  from: z.object({ kind: entityKindSchema, id }),
  to: z.object({ kind: entityKindSchema, id }),
  type: z.enum(['informs', 'affects', 'relates-to']),
  note: text,
  createdAt: timestamp,
});
export type Relation = z.infer<typeof relationSchema>;
export const projectSchema = z
  .object({
    id,
    name: title,
    description: text,
    demo: z.boolean(),
    dataOrigin: z.enum(['recorded', 'fictional']).optional(),
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: z.number().int().nonnegative(),
    decisions: z.array(decisionSchema).max(2000),
    baselines: z.array(baselineSchema).max(200),
    changes: z.array(changeSchema).max(5000),
    stories: z.array(storySchema).max(2000),
    relations: z.array(relationSchema).max(10_000),
    brands: z.array(brandSchema).max(30).default([]),
    captureDraft: z
      .object({ kind: z.enum(['decision', 'story']), title: z.string().max(180), text })
      .nullable()
      .default(null),
  })
  .transform((project) => ({
    ...project,
    dataOrigin: project.demo
      ? ('fictional' as const)
      : (project.dataOrigin ?? ('recorded' as const)),
  }));
export type Project = z.infer<typeof projectSchema>;
export const backupSchema = z
  .object({
    format: z.literal('it-productivity-toolbox'),
    version: z.union([z.literal(1), z.literal(2)]).transform(() => 2 as const),
    exportedAt: timestamp,
    projects: z.array(projectSchema).min(1).max(100),
  })
  .strict();
export type Backup = z.infer<typeof backupSchema>;
