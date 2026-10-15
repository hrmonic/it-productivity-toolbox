# Development handoff

**Current resume point:** [local studio validation checkpoint](VALIDATION.md), [user guide](USER_GUIDE.md) and [reporting contract](REPORTING.md). Earlier sections below are historical delivery records; their test counts and English-only export boundary are superseded by the current checkpoint. The user explicitly authorized committing and pushing the complete changes to GitHub on 15 October 2026. Hosting deployment is outside this publication.

## Current studio handoff — 15 October 2026

Workspace: `F:\APP\it-productivity-toolbox`. Starting Git revision: `c3aee17`. Before publication, upstream commit `a2befe1` was integrated by fast-forward; its bilingual workflow diagrams are retained and updated to the implemented studio capabilities. The [current validation receipt](VALIDATION.md) records checks completed before the authorized publication. Both README files display all nine viewport captures in their Responsive section. Downloaded report samples retain their exact bytes through Git checkout.

Completed: responsive/keyboard foundations and attribution; decision timeline/health/recorded paths; scope timeline/dependencies; explicit scenarios and coverage; quick capture/duplication; local Report Studio and Brand Studio; database/backup migration; bilingual exports and exact viewport screenshots. The official hero SHA-256 remains `F8E05C86AA21583E0559691D4258F75AC54822C9C3E496BBFDD34AF24F71C1B7`.

Validation: `pnpm check` passed with 84 tests in eight files; 30 Chromium journeys passed, including all nine viewports in both languages and the retained 320 px case. Audit reports no known advisories. Native PowerPoint opened both 28-slide exports with no detected text-box/out-of-slide overflow; both PDF samples have 13 pages. See [machine receipts](evidence/acceptance.json), [Office checks](evidence/powerpoint-validation.json), [document samples](examples/manifest.json) and [screenshot manifest](assets/screenshots/manifest.json).

New entry points: `src/features/report-studio/{model,layout,renderers}.ts`, `ReportStudio.tsx`, `src/features/brand-studio/`, `src/app/QuickCapture.tsx`, `src/shared/types/brand.ts`, `src/shared/data/db.ts` version 2. Domain additions are in `traceability/impact.ts`, `scope-radar/insights.ts`, `story-gap/coverage.ts` and the corresponding components. [Technical decisions](TECHNICAL_DECISIONS.md) describe the trade-offs.

Reproduce: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test:e2e`, `pnpm audit --json`, `pnpm screenshots`, `node scripts/verify-documentation.mjs`. Optional local measurements: `node scripts/measure-performance.mjs`. Windows with installed PowerPoint: `./scripts/verify-office.ps1` after the browser export journey. Tests use isolated contexts; never run reset/delete actions against a user’s sole real project for evidence collection.

Known boundaries: Chromium-focused automated coverage; no complete screen-reader/device audit, tagged PDF or universal font coverage; export libraries remain large but lazy; cover templates share content-page layouts; large/quota-constrained workspace measurements remain pending. Older builds cannot open the upgraded database. Keep backups; no migration deletes invalid recovery rows. Generated example exports are hash-verified and kept byte-identical to downloads.

Next action: read the [Quality checks runs](https://github.com/hrmonic/it-productivity-toolbox/actions/workflows/ci.yml) for the published revision, then one observed steering-review usability session with fictional content, using the bounded protocol in [Product audit](PRODUCT_AUDIT.md). External integrations and further layouts remain prioritized roadmap work.

## Delivery checkpoint — 15 October 2026

The repository began with an English/French product presentation and Apache 2.0 license. The implementation now contains the three functional tools, project isolation, optional fictional demo, persistent data, explicit relationships, portable backups, two interface languages, themes and automated quality checks. The original license and hero artwork are preserved.

Local environment: Windows, Node.js 24.14.0, pnpm 10.18.3. Use `.node-version`, `package.json` and `pnpm-lock.yaml` as the runtime/dependency contract. The final verification result and Git publication details are recorded below after the final checks.

## Entry points

- `src/app/App.tsx`: shell, routes, active project and themes.
- `src/features/*/domain.ts`: feature rules, export logic and traceability helpers.
- `src/shared/types/models.ts`: bounded runtime schemas and inferred types.
- `src/shared/data/db.ts`: atomic writes, revision conflicts and immutable agreements.
- `src/shared/data/validation.ts`: aggregate reference invariants.
- `src/shared/data/backup.ts`: versioned backup validation, remapping and transactional copy restoration.
- `src/shared/i18n/`: interface translation and language preference.
- `tests/e2e/workflows.spec.ts`: real-browser acceptance and accessibility checks.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm screenshots
```

No secret or remote provider is required. The CI workflow performs checks and retains diagnostics; it does not deploy the application.

## Known boundaries

- Exports use English field names and report headings; user content retains its original language.
- The fictional demonstration data are in English in either interface language.
- There is no account, authorization service, cloud synchronization, encryption, automatic AI, offline installation, or published hosting environment.
- Accepted/rejected scope changes are immutable. Draft baselines and proposed changes do not yet have separate edit histories.
- A baseline revision retains only dependencies between retained deliverables; old proposals remain with their old baseline.
- Scope estimates are planning inputs. Constraint changes do not manufacture effort; a warning explains the deliverable-only total.
- Heuristics can miss ambiguity and flag already-adequate text. INVEST dimensions require team discussion.
- Automated coverage is Chromium-focused. Manual assistive-technology review and Firefox/WebKit runs are pending.
- Whole-project persistence is a deliberate small-workspace trade-off. Large-project performance and browser-eviction recovery remain future work.

## Recommended next action

Run the documented checks on the target platform, then conduct a short usability session with a real IT Project Manager using fictional project content. Record the first confusing step and fix that complete workflow before adding features. A public static demo should be a separately scoped hosting decision.

## Initial validation and publication

Local validation completed on 15 October 2026:

- `pnpm check`: typecheck, zero-warning lint, formatting check, **59 unit/component/localization tests**, and production build passed.
- `pnpm test:e2e`: **12 Chromium journeys** passed against a newly built production preview, including two-tab conflict refusal, French refinement, keyboard focus, persistence and backup restoration.
- Automated axe checks found no violations for the selected WCAG A/AA rules on seven principal screens in both themes and the French story workflow. This is a bounded result, not accessibility certification.
- The mobile journey checked a 390 px viewport, persisted theme, console errors and absence of external runtime requests.
- `pnpm audit --prod`: no known production dependency advisories reported at the time of the check. This does not establish application security.
- Authentic screenshots were generated from the fictional demo and the light/dark/mobile layouts were visually inspected.

Publication uses descriptive English commits and a normal fast-forward push. Read the latest completed **Quality checks** GitHub Actions run for remote Linux validation; a configured workflow alone is not a passing run. No hosting deployment is part of this delivery.

The first published checkpoint, `ffd5eb3`, passed [Linux validation run 38744932154](https://github.com/hrmonic/it-productivity-toolbox/actions/runs/38744932154), including all 59 unit/component tests and 12 Chromium journeys. Its logs identified two legacy action-runtime warnings; a follow-up updates the pinned pnpm setup and artifact upload actions to official Node.js 24 releases and uses pnpm consistently for the browser preview.

## Design and workflow checkpoint — 15 October 2026

The visual redesign introduces a connected-node mark, neutral/indigo themes, sans-serif hierarchy and a project overview based on real work. Direct creation links, contextual edit actions, filter recovery, searchable dependency checkboxes and story review-state filters address specific task friction. The mobile drawer now supports Escape, focus restoration and a contained keyboard tab sequence; closed navigation is hidden from keyboard access. See [design review](DESIGN_REVIEW.md) for rationale, official reference sources and remaining usability hypotheses.

Current local validation on Windows:

- `pnpm check` passed: typecheck, zero-warning lint, formatting, **60 unit/component/localization tests** and production build.
- `pnpm test:e2e` passed: **16 Chromium journeys**, including the new overview, dependency selection, review-state and responsive French cases.
- Automated axe checks reported no violations for selected WCAG A/AA rules on seven principal screens in both themes and the French story workflow. This remains bounded automation, not certification.
- French layouts on seven screens fit 320, 768 and 1440 px without horizontal document overflow; the separate mobile navigation/theme test uses 390 px. The narrow-layout regression caught and fixed overflowing translated scope actions.
- A theme transition contrast failure was corrected by switching foreground/background colors together.
- Ten production-build screenshots were refreshed from an isolated fictional demo; light, dark, story analysis and mobile layouts were visually inspected.

No project schema or storage migration is required. Existing project content and approval rules are preserved. Real-user usability sessions and a comparative usability study remain pending. For remote validation, read the completed Quality checks run for the published redesign commit.
