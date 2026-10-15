# Development handoff

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

## Final validation and publication

Local validation completed on 15 October 2026:

- `pnpm check`: typecheck, zero-warning lint, formatting check, **59 unit/component/localization tests**, and production build passed.
- `pnpm test:e2e`: **12 Chromium journeys** passed against a newly built production preview, including two-tab conflict refusal, French refinement, keyboard focus, persistence and backup restoration.
- Automated axe checks found no violations for the selected WCAG A/AA rules on seven principal screens in both themes and the French story workflow. This is a bounded result, not accessibility certification.
- The mobile journey checked a 390 px viewport, persisted theme, console errors and absence of external runtime requests.
- `pnpm audit --prod`: no known production dependency advisories reported at the time of the check. This does not establish application security.
- Authentic screenshots were generated from the fictional demo and the light/dark/mobile layouts were visually inspected.

Publication uses descriptive English commits and a normal fast-forward push. Read the latest completed **Quality checks** GitHub Actions run for remote Linux validation; a configured workflow alone is not a passing run. No hosting deployment is part of this delivery.

The first published checkpoint, `ffd5eb3`, passed [Linux validation run 38744932154](https://github.com/hrmonic/it-productivity-toolbox/actions/runs/38744932154), including all 59 unit/component tests and 12 Chromium journeys. Its logs identified two legacy action-runtime warnings; a follow-up updates the pinned pnpm setup and artifact upload actions to official Node.js 24 releases and uses pnpm consistently for the browser preview.
