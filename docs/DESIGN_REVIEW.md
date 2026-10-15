# Design and workflow review

## Intent and evidence

The October 2026 redesign responds to direct feedback that the original green identity, mark and editorial presentation did not feel appropriate for a professional IT delivery tool. It covers the application shell, both themes, the brand mark, typography, project overview, record actions and refinement controls. It preserves existing project data, exports and approval semantics.

This is a design review backed by implemented workflows and browser checks. There has not yet been a moderated study with representative users. Ease of use and superiority over competing tools remain hypotheses to validate, not measured claims.

## Reference principles

Official product and design references consulted on 15 October 2026:

- [Linear features](https://linear.app/features): a useful reference for a restrained application shell, clear work hierarchy and direct access to records.
- [Atlassian color foundations](https://atlassian.design/foundations/color): a reference for neutral, brand and semantic color roles, contrast, selection and theme consistency.
- [Asana project management](https://asana.com/features/project-management): a reference for organizing a workspace around actionable project context.

These references informed our own choices. The toolbox uses its own vector mark, layouts and implementation. No competitor usability ranking or feature comparison is inferred from these pages.

## Questions and resulting changes

| User and task                          | Question asked during review                                       | Observed friction                                                                             | Implemented response                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Manager returning to a project | What needs my attention now?                                       | The homepage remained an introduction after a project was open.                               | A project overview shows real record counts, proposed decisions/changes, unreviewed story prompts and recent updates. Each item opens its record. |
| Product Owner recording a discussion   | Can I capture a decision without searching through navigation?     | Creating a record required entering a tool first.                                             | Direct creation links open the decision/story form from the overview. Cancelling removes the creation URL flag.                                   |
| Project Manager revisiting a decision  | Is the most prominent action useful in this context?               | A new-record action competed with editing the record being read.                              | Detail pages prioritize editing the current decision/story; list pages prioritize creation.                                                       |
| Project Manager selecting dependencies | Can I select several dependencies with a mouse, touch or keyboard? | Native multi-select required Ctrl/Cmd knowledge.                                              | Labelled checkboxes, a selected count and search for longer lists. Hidden selected values remain included when filtering the list.                |
| Scrum Master reviewing a story         | Can I focus on unresolved questions?                               | Accepted, ignored and pending notes appeared in one long sequence.                            | Review-state filters with counts, category filtering and a reset. Source content remains separate from accepted notes.                            |
| User recovering from an empty search   | Can I get back to my records immediately?                          | Filtered results required manually undoing several controls.                                  | A clear-filters action is available in the toolbar or empty-result state.                                                                         |
| User reading throughout the day        | Is the interface calm and legible?                                 | Very small supporting text, green accents and serif headlines weakened the working hierarchy. | Neutral surfaces, indigo accents, sans-serif headings, larger record text and consistent spacing. Status retains text labels.                     |
| French-speaking mobile user            | Do longer labels still fit?                                        | The 320 px check exposed overflowing scope actions.                                           | Wrapping action groups and responsive panels; automated French checks at phone, tablet and desktop widths.                                        |
| Keyboard user on mobile                | Can I dismiss navigation and continue?                             | The drawer lacked an Escape shortcut.                                                         | Escape closes the drawer and restores focus to the menu button.                                                                                   |

## Visual contract

- **Identity:** three connected nodes represent decisions, scope and requirements. The same vector geometry is used in the sidebar and favicon.
- **Light:** off-white canvas, white content surfaces, navy text, indigo actions and a pale sidebar.
- **Dark:** charcoal canvas/surfaces, light text and a softer indigo action color with a dark foreground.
- **Color meaning:** brand/selection, accepted state, proposals/warnings and errors have named tokens. Text and icons accompany state; color alone does not convey approval.
- **Hierarchy:** project or record title first, contextual primary action, core content, then supporting details. Introduction and methodology use progressive disclosure where appropriate.
- **Honest overview:** counts come from current project records. Review prompts are explainable heuristic output. Recent updates are record timestamps, not a complete audit feed.

## Validation and practical limits

The redesigned build is exercised by component tests for filtered dependency submission and browser journeys for direct creation, filter recovery, stored dependencies, review states and unchanged story source. The acceptance suite also retains persistence, history, simulation isolation, backup restoration, stale-write refusal and localization checks.

Automated axe checks cover seven principal screens in light/dark themes and a French refinement workflow. French layout checks cover seven screens at 320, 768 and 1440 px; the existing mobile navigation journey uses 390 px. These checks do not prove universal accessibility or usability. Screenshots in `docs/assets/screenshots/` are captured from an isolated fictional demo against a production build. See [testing](TESTING.md) and the [handoff checkpoint](HANDOFF.md) for results.

## Next user validation

Ask representative IT Project Managers, Product Owners and Scrum Masters to complete four tasks with fictional data: identify a pending scope decision, capture and revise a decision, select dependencies, and accept one story note without changing the source. Observe the first action, hesitation, wrong turns, completion and recovery; avoid coaching during the task. Record what they expected each control to do and whether the overview led them to useful work.

Prioritize the first recurring workflow failure before adding new modules. Dense projects, long real-world titles, touch use, screen readers and the mobile story editor need further observation. A claim that the toolbox is easier or better than competitors would require a defined comparison task and user evidence.
