# UX and visual guidelines

## Identity and hierarchy

The toolbox uses a restrained green palette, a dark workspace sidebar, an editorial serif for primary headings, and system sans-serif text for controls and records. All fonts are local system fallbacks; the application makes no font-provider requests. Brand identity is centralized in `src/app/brand.ts`; the favicon and wordmark share the three-line toolbox motif.

CSS variables in `src/styles.css` define background, surfaces, text, borders, accents, and semantic tones for light and dark themes. Keep both themes equivalent in function and readable contrast. Do not add decorative dashboards, unsupported metrics, or status colors without text labels.

## Interfaces follow the task

- **DecisionTrace:** a readable journal and document detail view. Context, selected solution and rationale precede supporting information. Earlier versions remain inspectable.
- **Scope Radar:** factual deliverable counts are separated from effort estimates. A record-level comparison explains totals. The what-if area has an explicit simulation label and cannot approve a proposal.
- **StoryGap:** source text and analysis have different visual areas. Prompts quote source language and explain the reason for review. Users edit, accept, ignore or reopen notes; source changes always require an explicit action.
- **Traceability:** named relationships link actual records. The overview workflow illustration explains the concept; the traceability register contains only recorded links.

## Writing and localization

Use concise, actionable English source messages. Add a French catalog entry for each message. The catalog coverage test checks static translation calls and extracted messages. Names, project descriptions, original stories, recorded risks, and other user content remain untouched. Stable export field names and report headings remain in English.

Do not call suggestions “AI” or a “quality score.” Use “review question,” “rule,” “unknown,” and “estimate” precisely. Status reflects the recorded value; storage does not imply approval. Fictional demo context stays visible in the project selector and header.

## Interaction and accessibility

- Use semantic links for navigation, buttons for actions, and associated labels for controls.
- Provide a skip link, visible focus, keyboard-operable dialogs, an initial field focus, a trapped dialog tab order, Escape closing, and focus restoration.
- Destructive project actions and demo resets require confirmation. Archive operations preserve history and links.
- Keep form content after validation/storage failures. Refuse stale open-form writes after a project revision changes.
- Explain missing estimates; never display an invented zero. Treat zero-baseline percentages as unavailable.
- Respect reduced-motion preferences. Avoid using motion to communicate an essential state.
- At narrow widths, use a dismissible navigation drawer, stack the editor/analysis areas, and retain useful record labels.

Automated axe checks cover selected WCAG 2.0/2.1/2.2 A/AA rules on the tested screens. Keyboard and narrow-layout journeys are also exercised. These checks and visual review do not constitute a complete accessibility audit or certification.

## Empty, failure and recovery states

No project: offer a blank project or optional demo. No record: explain the next useful action. No search result: suggest changing filters. Unknown estimate: identify missing inputs. Storage error: preserve data and show the error. Invalid stored record: offer explicitly unvalidated recovery export, never automatic deletion.
