# Data model and interchange contract

## Project aggregate

Every `Project` has a UUID, name, description, demo flag, creation/update timestamps, a monotonic revision, and collections of decisions, baselines, changes, stories, and relations. IndexedDB database `it-productivity-toolbox`, schema version 2, contains a `projects` table indexed by ID, name, and update timestamp.

| Record            | Important fields and behavior                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision          | Context, owner/stakeholders, date/status, alternatives, selected solution, rationale, assumptions, constraints, risks, HTTP(S) references, tags and review date   |
| Decision revision | Previous content, revision timestamp and required explanation; current record keeps the same ID                                                                   |
| Baseline          | UUID/version/date, objective, one estimation unit, assumptions/constraints, deliverables, nullable freeze timestamp                                               |
| Deliverable       | Stable ID, name, priority, nullable nonnegative estimate and dependency IDs                                                                                       |
| Change            | Baseline ID, type/status/date, target deliverable where needed, signed effort delta or addition, priority, dependencies, description, author, rationale and risks |
| Story             | Structured fields, original content, previous saved content, current suggestion reviews and timestamps                                                            |
| Suggestion review | Stable rule ID, accepted/ignored state and user-editable note                                                                                                     |
| Relation          | Two typed endpoints, relationship type (`informs`, `affects`, `relates-to`), context and timestamp                                                                |

IDs for records are unique within the aggregate. Deliverable IDs remain stable across baseline versions. An accepted addition’s change ID also identifies its introduced deliverable; this lets later changes refer to it consistently.

## Agreement history

A frozen baseline cannot be mutated or removed through the repository. A revision starts from the current accepted deliverables, creates a new baseline ID/version, and retains the previous baseline and ledger. Only dependencies between retained deliverables are carried forward; the revision form explains this. Old proposals stay with their original baseline and are not implicitly accepted or copied.

Accepted/rejected changes cannot be edited or removed through the repository. Proposed changes can be revised. This release does not retain a separate edit history for a proposed change or baseline draft. Decisions retain meaningful earlier content with a reason; archiving preserves links. Story edits retain original/previous content and invalidate earlier suggestion reviews.

## Backup format

```json
{
  "format": "it-productivity-toolbox",
  "version": 2,
  "exportedAt": "2026-10-15T12:00:00.000Z",
  "projects": ["Complete project records, not strings in actual backups"]
}
```

The example illustrates the envelope only. Export a real backup from Settings for valid complete records. A full backup preserves histories, proposals, baseline versions, and relations. Individual Markdown/CSV/JSON exports are reports; only the full versioned backup envelope is accepted by restoration.

Imports are limited to **5 MiB** before parsing. Validation checks schemas, bounded text/collections, date formats, unique record IDs, baseline membership, dependencies, and relation endpoints. Unsupported versions and extra envelope fields are rejected. Project structures are parsed into the supported schema; undeclared nested properties are discarded. A second validation occurs at the restore boundary.

Restoration is one transaction. Every restored project gets a new project ID/name suffix, fresh object IDs, remapped links/dependencies, and revision zero. The resettable-demo identity is cleared, but fictional data provenance is retained explicitly in `dataOrigin`; restoring an example must not make it appear to be real project evidence. No existing project is overwritten.

## Scope calculation contract

1. Select one baseline and changes with that exact baseline ID.
2. Include accepted changes. In a simulation, also include selected proposals. Rejected changes are always excluded.
3. Order by effective date, creation timestamp, then ID as a deterministic final tie-breaker.
4. Apply additions, removals, signed effort modifications, priority changes and recorded constraints.
5. Sum only known deliverable estimates in the baseline’s single unit. One unknown item makes that total unavailable.
6. Delta requires known initial and current totals. Percentage requires both totals and a nonzero initial total.
7. Surface unknown estimates, unavailable targets, missing dependencies, negative resulting estimates, repeated changes (three or more on one baseline deliverable), and recorded risks.

Constraint changes do not invent effort. They produce an explicit warning that totals cover deliverables only; use a quantified deliverable modification for additional work. A modification adds an effort delta and records its description; it does not silently rename the baseline deliverable. New baseline versions can revise names and dependencies. These are planning estimates, not schedule or budget predictions.

## Migrations and limits

Database versions 1 and 2 are declared explicitly. A version 1 to 2 Dexie upgrade adds brand profiles, a nullable capture draft, explicit scenario/requirement collections and assumption-verification defaults. Invalid historical records are preserved for raw recovery. Tests open an actual version 1 IndexedDB fixture and verify the persisted upgrade. Backup imports accept versions 1 and 2 and normalize to version 2; new exports use version 2 so older readers refuse rather than discard studio data. A future incompatible version must add an explicit migration and fixture. Do not simply loosen the schema or reset the database.

Local storage is scoped to the browser and origin, not a user account. It is not encrypted or synchronized. Records are bounded by the Zod schemas; the 5 MiB import limit is not a guaranteed browser storage quota.

## Studio and refinement additions

Brand profiles are bounded to 30 per project and validated by `brandSchema`. Each has independent identity, company/logo, color tokens, three font roles, cover template and header/footer. Normalized PNG logos are bounded by encoded size and intrinsic dimensions. Restoring a copy remaps profile IDs.

A project can retain one quick-capture draft (kind/title/source text). Creating a record from it clears only that draft and creates an explicitly proposed decision or a story for review.

Stories have up to 200 explicit requirements and 200 scenarios. A scenario has a category, Given/When/Then text and requirement IDs. Validation rejects dangling coverage references; restoration remaps both ends. Source-text revisions preserve scenario text and requirements while clearing coverage links and review states. The legacy original/history story content remains intact.

Decision content adds `assumptionsVerified`, defaulting to false in existing/current history records. Its warnings remain rule-specific and do not create a quality score.

Both backup import and export enforce 5 MiB. An oversized export is refused explicitly rather than producing a file this application cannot restore. See [Reporting](REPORTING.md) for the separate normalized report model, date selection and scope snapshot contract.

`dataOrigin` distinguishes recorded and fictional content independently of the resettable-demo flag. Legacy demo records normalize to fictional; copies retain that origin. Project creation/editing offers an explicit example-data checkbox, and Report Studio carries the disclosure into the output.
