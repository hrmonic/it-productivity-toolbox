# UX and visual guidelines

## Identity and hierarchy

The toolbox uses neutral surfaces, an indigo action/selection accent, and system sans-serif type throughout. The light theme has a pale workspace sidebar; the dark theme uses charcoal surfaces and a lighter indigo accent. Readable record text takes priority over decorative typography. The interface uses system font fallbacks; PDF exports load bundled OFL-licensed Noto fonts. No external font-provider request is made. Brand identity is centralized in `src/app/brand.ts` and `BrandIdentity.tsx`. The favicon and brand mark use three connected nodes to represent the tools and their traceable relationships.

CSS variables in `src/styles.css` define background, surfaces, text, borders, accents, and semantic tones for light and dark themes. `src/workspace.css` contains the workspace overview, brand, review controls, and responsive refinements. Indigo identifies actions and selection; blue, amber, and red support labelled status and review context. Keep both themes equivalent in function and readable contrast. Switch theme colors together: interpolating backgrounds while text changes immediately can briefly destroy contrast. Do not add decorative dashboards, unsupported metrics, or status colors without text labels.

The [design review](DESIGN_REVIEW.md) records observed friction, reference sources, implementation choices, and remaining user-validation work.

## Interfaces follow the task

- **Overview:** after project selection, show the actual project, record counts, review items and recently updated work. Give direct access to creating a decision or story. Reserve introductory explanations and demo onboarding for an empty workspace. Review items come from recorded proposals or explicit heuristic prompts; they are not a readiness score.
- **DecisionTrace:** a readable journal and document detail view. Context, selected solution and rationale precede supporting information. Earlier versions remain inspectable. The primary detail action edits the current record. Filters have a direct reset, including zero-result states.
- **Scope Radar:** factual deliverable counts are separated from effort estimates. A record-level comparison explains totals. The what-if area has an explicit simulation label and cannot approve a proposal.
- **StoryGap:** source text and analysis have different visual areas. Prompts quote source language and explain the reason for review. Users filter by review state and category, then edit, accept, ignore or reopen notes; source changes always require an explicit action. Detailed methodology stays available under a disclosure.
- **Traceability:** named relationships link actual records. The overview workflow illustration explains the concept; the traceability register contains only recorded links.

## Writing and localization

Use concise, actionable English source messages. Add a French catalog entry for each message. The catalog coverage test checks static translation calls and extracted messages. Names, project descriptions, original stories, recorded risks, and other user content remain untouched. Structured JSON keys remain stable; human-readable module/report headings follow the selected language.

Do not call suggestions “AI” or a “quality score.” Use “review question,” “rule,” “unknown,” and “estimate” precisely. Status reflects the recorded value; storage does not imply approval. Fictional context stays visible in the project selector/content and report output, including after restoration. The upper-right demo-project badge is removed.

## Interaction and accessibility

- Use semantic links for navigation, buttons for actions, and associated labels for controls.
- Provide a skip link, visible focus, keyboard-operable dialogs, an initial field focus, a trapped dialog tab order, Escape closing, and focus restoration.
- Select dependencies with labelled checkboxes. For longer lists, support search without losing selected items or requiring Ctrl/Cmd multi-selection.
- Destructive project actions and demo resets require confirmation. Archive operations preserve history and links.
- Keep form content after validation/storage failures. Refuse stale open-form writes after a project revision changes.
- Explain missing estimates; never display an invented zero. Treat zero-baseline percentages as unavailable.
- Respect reduced-motion preferences. Avoid using motion to communicate an essential state.
- At narrow widths, use a dismissible navigation drawer with Escape closing and focus restoration, wrap action groups, stack the editor/analysis areas, and retain useful record labels. Test French labels as well as English; longer translations reveal layout constraints.

Automated axe checks cover selected WCAG 2.0/2.1/2.2 A/AA rules on the tested screens. Keyboard and narrow-layout journeys are also exercised. These checks and visual review do not constitute a complete accessibility audit or certification.

## Empty, failure and recovery states

No project: offer a blank project or optional demo. No record: explain the next useful action. No search result: suggest changing filters. Unknown estimate: identify missing inputs. Storage error: preserve data and show the error. Invalid stored record: offer explicitly unvalidated recovery export, never automatic deletion.

For the current studio components and responsive foundations, see [Design system](DESIGN_SYSTEM.md) and [Reporting](REPORTING.md).
