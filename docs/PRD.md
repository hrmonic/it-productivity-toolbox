# Product requirements — IT Productivity Toolbox

## Product intent

Help IT Project Managers, Product Owners, Scrum Masters, and Product Builders preserve the reasoning behind work, understand scope evolution, and improve requirements before implementation. Each tool should provide value within minutes, without an account or infrastructure setup.

**Positioning:** focused companions for project and product reasoning. This product does not attempt to replace issue tracking, scheduling, collaborative document editing, or an ALM platform.

## First-release scope

| User problem                                | Delivered workflow                                                                                                                               | Acceptance evidence                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Decision context disappears                 | Create, search/filter, read, revise with a reason, inspect earlier content, archive, export                                                      | Decision domain tests and decision browser journey              |
| Accepted scope drifts from the agreement    | Draft/freeze a baseline, record changes, compare deliverables and effort, create a versioned revision                                            | Scope domain tests and baseline browser journey                 |
| Proposals are hard to discuss safely        | Select proposed changes in a nonpersistent what-if workspace                                                                                     | Domain immutability assertion and reload check                  |
| Stories contain unresolved ambiguity        | Enter structured or free-form content, run local rules, edit/accept/ignore notes, optionally append confirmed criteria, compare original content | Story domain tests and English/French browser journeys          |
| Rationale and requirements are disconnected | Create typed links between existing records and follow them from either endpoint                                                                 | Reference validation tests and bidirectional navigation journey |
| Browser data needs to be portable           | Export complete backups, preview/validate imports, restore as isolated copies                                                                    | Backup round-trip, atomic failure, and browser restore journey  |

English was implemented first; the French interface was added after the English workflows were exercised. Project content is never automatically translated. Structured JSON keys remain stable; human-readable exports and report headings are localized. User content retains its original language.

## Core user stories

- As an IT Project Manager, I can compare accepted scope with the agreed baseline, so I can explain the change without inventing missing estimates.
- As a Product Owner, I can capture a decision and its alternatives, so future discussions can revisit the original assumptions.
- As a Scrum Master, I can turn vague story language into questions for refinement, so the team can clarify the requirement together.
- As a Product Builder, I can link a requirement to a scope change and decision, so the reason for the work remains navigable.
- As a user, I can recover a portable project copy without replacing my current workspace.

## Data and approval semantics

Saving a record does not approve it. Decision and change statuses are explicit. A baseline becomes immutable only after a separate freeze action. Accepted/rejected changes are immutable ledger entries; a correction requires another change or a new baseline version. Suggestions are review notes; accepting one does not certify a business rule or story readiness.

## Delivery sequence and exit criteria

1. **Foundation:** project isolation, IndexedDB persistence, shell, themes, validation and optional fictional demo.
2. **DecisionTrace:** complete creation-to-export journey, meaningful history, explicit approval state.
3. **Scope Radar:** coherent units, unknown estimates, zero-baseline percentages, frozen versions and safe simulations.
4. **StoryGap:** deterministic English/French rules, user-controlled changes, retained original and version history.
5. **Traceability:** valid references, known relationship types and bidirectional navigation.
6. **Quality:** production build, lint/type/format checks, unit/component tests, browser workflows, automated accessibility checks, manual screenshot review and documentation.

See [testing](TESTING.md) for measured results. Passing automated accessibility checks is not a WCAG certification.

## Risks and mitigations

| Risk                                  | Consequence                                  | Current mitigation / remaining boundary                                |
| ------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Browser storage is cleared or evicted | Loss of local records                        | Visible backup guidance and full JSON export; no cloud recovery        |
| Multiple tabs edit the same project   | Lost update                                  | Transactional revision check refuses stale saves; user reload required |
| Estimates are missing or incompatible | Misleading reporting                         | One unit per baseline; unknown totals and no percentage from zero      |
| Heuristic analysis is overtrusted     | False confidence                             | Explain each rule, avoid quality scores, keep team review explicit     |
| Confidential content is recorded      | Exposure through the device or exported file | No remote analysis; unencrypted storage limitations are documented     |
| Scope grows into a full PM platform   | Complexity overwhelms the three workflows    | Explicit non-goals and prioritized roadmap                             |
| Large aggregate projects              | Slower reads and writes                      | Bounded schemas/imports; normalization is a future scaling decision    |

## Non-goals for this release

Accounts, team synchronization, permissions enforcement, Gantt charts, schedule predictions, financial forecasting, Jira integration, automatic semantic reasoning, LLM-generated requirements, and offline installation are not shipped. No public hosting deployment is implied by a successful build.

## Analysis-to-document delivery checkpoint

The project review workflow now spans the three tools and two shared studios. User requirements and acceptance evidence are recorded in [Product audit](PRODUCT_AUDIT.md), [User guide](USER_GUIDE.md), [Reporting and branding](REPORTING.md) and [current validation](VALIDATION.md).

| User problem                                                      | Delivered workflow                                                                                             | Evidence                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A decision changes and its recorded consequences are hard to find | Interactive status/rationale history, rule-specific health and transitive recorded paths                       | Domain path tests and decision browser journey                                               |
| Scope changes accumulate or affect dependent work                 | Accepted effective-date timeline, transitive dependency review and separate proposal simulation                | Scope domain tests and browser comparison/simulation                                         |
| Requirements lack observable acceptance scenarios                 | Explicit requirements, categorized Given/When/Then scenarios, coverage links and subjective-term prompts       | Schema/coverage tests and repeated-entry scenario browser journey                            |
| Project findings need manual reassembly into slides               | Shared normalized composer, source IDs, audience/detail/period selection, actual PDF preview and local formats | All six formats generated and reopened; French PDF/PPTX and native PowerPoint inspection     |
| Documents need a company identity                                 | Saved project brand profiles, bounded raster logos, color/contrast/font controls and cover compositions        | Logo rejection, persistence/duplication/deletion, backup restore and branded document checks |
| Meeting notes are lost before formal entry                        | Retained capture draft and explicit proposed-decision/story creation                                           | Capture reload/duplication browser journey                                                   |

No measured productivity gain, market validation, universal accessibility compliance or external integration is claimed. The usability experiment and unresolved P2 scope remain in the roadmap.
