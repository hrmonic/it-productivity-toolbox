# User guide

## Start with the project

Create an empty project or load the explicitly fictional Atlas dataset. The active-project selector switches the entire workspace. Content is stored in this browser and origin; keep a full backup through Settings. No account, mandatory API key or remote analysis service is required.

Settings also offers custom interface themes, saved color palettes, 100–200% text sizing, system fonts, content density and accessibility controls. Interface preferences have their own validated export/import, independent of project backups and document brand profiles. Read [Workspace personalization](PERSONALIZATION.md).

## Record and reconsider a decision

In DecisionTrace, start with a title and context; advanced fields are optional. A proposed decision is never automatically accepted. Add a responsible owner, selected solution and rationale as the agreement becomes explicit. Expand alternatives and follow-up fields for assumptions, constraints, stakeholders and review date. Check assumption verification only when reviewed.

Revisions require a reason and retain prior content. The timeline exposes the recorded status transitions and rationale. Health identifies specific missing or overdue information without a score. Impact Explorer follows explicit links in either direction and shows each path’s relationship IDs and notes. It identifies work to review if a decision changes, not guaranteed consequences.

Duplicate as proposal opens a new reviewable record. It copies content without inheriting approval, history or project relationships. Archiving retains history and connections. **Prepare Decision Brief** takes the selected record into Report Studio.

## Understand a change before accepting it

In Scope Radar, define deliverables, priorities, optional estimates and dependencies in a baseline. Choose one effort unit. Freeze the reference explicitly before recording proposals. Accepted/rejected changes are immutable; use a new change or baseline revision to document a different agreement.

Compare baseline and current scope. Only accepted changes affect the official result. Select proposals in **What if?** to derive a separate simulation; clearing or reloading it leaves the baseline and accepted ledger unchanged. Missing effort is not zero and incompatible baseline units are not combined.

The evolution timeline uses recorded effective dates, not inferred approval times. In Dependency Impact Map, select a deliverable to see recorded dependents, including transitive paths and selected simulation additions. Missing dependency alerts and recorded risks remain visible. **Prepare Scope Change Brief** opens the shared reporting workflow.

## Refine a story

Paste the story or use structured persona/need/value fields. Local English/French rules identify certain ambiguity and missing context. Read the quoted passage, explanation and editable question. Accept or ignore a note explicitly. Appending text to acceptance criteria requires a separate choice; confirm placeholders and business rules first.

The original story and saved source versions remain available. Saving changed source text clears review states and scenario coverage links so previous links are not presented as current coverage. Scenario text and requirement records remain available to review and reconnect.

In Acceptance Criteria Studio, record nominal, error, boundary, authorization or constraint scenarios using Given/When/Then. In Coverage Matrix, enter explicit requirements and link them to scenarios. Nonempty complete scenarios provide recorded coverage; subjective outcome terms produce a review prompt. Neither state proves execution, exhaustive coverage or requirement validity. **Prepare Refinement Pack** opens a report for the selected story.

## Capture notes and connect the work

Use **Quick capture** on the overview to paste meeting notes, choose a proposed decision or story, and supply a title. Save a project draft and resume it after reload, or create a record for review. The tool preserves source notes; it does not infer agreement from their wording. Drafts are included in full backups.

**Connected work** lets you link existing decisions, changes and stories using a type and explanation. Links are visible on both records and in Traceability. Similar text does not create a relation. Unlinking removes only the relation.

## Share and brand the result

Use [Report Studio and Brand Studio](REPORTING.md) for the full content-to-document workflow, exact filter semantics, brand controls, file formats, font substitutions and limitations.

## Language, keyboard and small screens

Settings switches English/French interface language and theme. User text is not translated automatically. Human-readable exports use the chosen report/interface language; structured JSON keys remain stable.

On small screens, use the navigation button. Escape, the close button or the outside backdrop closes the drawer and restores focus. The background is inert while it is open. Tab remains inside the navigation. On short screens the sidebar scrolls independently, including author/contact/license attribution. Dialogs scroll within the available height; Escape closes them.

Forms provide labels and visible errors. A stale write from another tab is refused without clearing the draft. Reload and reconcile against the newer project rather than attempting to overwrite it.

## Back up, restore and recover

**Back up all projects** generates version 2 JSON containing source content, histories, scenarios/coverage, relationships, drafts and brand profiles. Imports accept versions 1 and 2, validate references, then restore independent copies with remapped IDs. Nothing is merged silently into existing projects. Both export and import enforce 5 MiB; large branding images may need simplification before a full backup fits.

The database upgrades from version 1 to 2 with additive defaults. Invalid historical records are preserved for the existing raw-recovery download instead of reset. Older application builds cannot open the upgraded database; retain a backup before changing application versions or origins. Reports, CSV and individual JSON records are not restoration files.
