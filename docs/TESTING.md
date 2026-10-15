# Testing and validation

## Reproduce the checks

Use Node.js 24 and pnpm 10.18.3. Install with the lockfile unchanged.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit --prod
```

`pnpm check` runs TypeScript, ESLint without fixes, Prettier without writes, Vitest, and a production build. Browser acceptance tests start a production preview at `http://127.0.0.1:4173`. Each test gets an isolated browser context. CI installs Chromium system dependencies on Ubuntu and retains reports/traces for seven days. No required check uses `continue-on-error`.

## Evidence and scope

The initial implementation was validated locally on Windows with Node.js 24.14.0. The current source of truth for exact test counts and results is the latest completed CI run or a fresh local run; see [handoff](HANDOFF.md) for the recorded delivery checkpoint. No coverage percentage, Lighthouse score, browser-matrix certification, or external security audit is claimed.

| Layer                    | What is exercised                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision domain          | Explicit defaults, input validation, meaningful revisions, retained prior content, reason requirement, warnings, unsafe URLs and export                                                                               |
| Scope domain             | Accepted/proposed/rejected semantics, immutable simulation, zero/missing effort, signed deltas, negative totals, removals/dependencies, repeated changes, baseline isolation and formula-safe CSV                     |
| Story domain             | Structured/free-form English and French, ambiguity boundaries, export questions, observable criteria heuristics, retained original/history and controlled notes                                                       |
| Data boundary            | Project isolation, transactional revisions, frozen baselines, immutable accepted/rejected changes, reference integrity, backup size/schema/format checks, copy remapping and failed-restore atomicity                 |
| Components               | Labelled dialogs, Escape behavior, visible errors with preserved edits, stale form refusal                                                                                                                            |
| Localization             | Catalog completeness, source translation keys, dynamic message translation, language persistence and unchanged project content                                                                                        |
| Browser                  | First use, all three create-to-export workflows, baseline revisions, simulation reload isolation, bidirectional links, backup/restore, invalid import, mobile navigation/themes, keyboard focus and French refinement |
| Accessibility automation | Selected axe WCAG A/AA rules on main screens and the French story workflow                                                                                                                                            |

## Inspect and regenerate screenshots

```sh
pnpm screenshots
```

The script starts a separate production preview on port 4174, loads the fictional demo through the UI, and captures the actual application under `docs/assets/screenshots/`. It creates a fresh browser context and does not read a personal browser profile. Screenshots are documentation assets, not assertions that every visual state is accessible.

## Limitations and next validation work

- Chromium is the automated browser target. Firefox and WebKit support remain to be exercised.
- Nine principal routes are checked in English and French at the nine specified viewports, including navigation attribution, modal actions and report previews. Legacy 320 px checks remain. A full assistive-technology/user audit is pending.
- `fake-indexeddb` verifies repository behavior in unit tests; browser tests cover real IndexedDB. Browser eviction and quota exhaustion are not comprehensively simulated.
- A version 1 to 2 IndexedDB fixture upgrade, invalid-record preservation, old/new backup parsing and coverage/brand ID remapping are tested. Browser eviction/quota and every malformed historical record are not comprehensively simulated.
- Rule tests demonstrate implemented heuristics, not semantic completeness or objective story quality.
- CI results must be read from a completed run; successful local checks do not prove a remote workflow passed.

If a test fails, fix the behavior or explain the genuine environment limitation. Do not remove an assertion, raise a threshold, or skip a required journey merely to obtain a green run.

## Responsive reference protocol

`studios.spec.ts` checks 1920 × 1080, 3440 × 1440, 1440 × 900, 1366 × 768, 1024 × 768, 768 × 1024, 390 × 844, 360 × 800 and 430 × 932. Each covers nine routes in both languages, global horizontal overflow, main/sidebar boundaries, accessible attribution and reachable modal submit actions. A 1 px positional allowance accounts for browser subpixel rounding; horizontal overflow is still refused. Tests write per-viewport receipts tied to the production index hash.

Run `pnpm test:e2e` before `pnpm screenshots`. Capture refuses missing/mismatched receipts. Every reference uses explicit viewport dimensions, `deviceScaleFactor: 1` and `fullPage: false`. PNG dimensions and overflow are rechecked during capture. The screenshot manifest records routes, languages, theme and SHA-256 values. These are actual isolated-browser captures, not altered mockups.

## Documents and local measurements

Browser acceptance downloads/reopens PDF, editable PPTX, XLSX, Markdown, JSON and CSV. French PDF/PPTX are also generated. ZIP/XML inspections verify native text/shapes, media and chosen color; PDF structure and XLSX native cells are checked. Domain tests cover long/unbroken text, CSV safety, source IDs, missing effort, cancellation and Unicode-safe spreadsheet chunks.

On Windows, the retained sample PPTX is opened read-only in installed PowerPoint, its text bounding boxes are compared with their shapes and it is rendered to PDF for visual inspection. Only the created presentation is closed; existing user presentations are not closed. PDF pages are rendered with Poppler and inspected. These native Office checks complement, and are separate from, CI tests.

`node scripts/measure-performance.mjs` records five actual overview-to-tool transitions per route, first-heading latency, export download latency and raw/gzip chunk sizes in `docs/evidence/performance.json`. Timings include Playwright overhead on local loopback and are not Lighthouse/Web Vitals or an internet benchmark. The browser context contains only fictional data.
