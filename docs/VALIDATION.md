# Validation checkpoints — 15 October 2026

## Current checkpoint: application identity and personalization

Starting from published revision `f9c7b14`, added the [generated raster identity](BRANDING.md), [custom interface themes and accessibility preferences](PERSONALIZATION.md). The original hero remains unchanged. Current execution evidence is in [the personalization receipt](evidence/personalization-acceptance.json); earlier studio results below describe the preceding build.

- Local `pnpm check`: TypeScript, ESLint, formatting, **91 tests in 9 files**, production build passed.
- Complete Chromium browser suite: **34 passed**, including settings persistence/import/reset/cross-tab behavior, selected automated accessibility checks, device preferences, and text at 200% on desktop/tablet/mobile. The original nine-viewports EN/FR matrix remains covered.
- **41** current viewport references include regenerated module/overview captures and new settings/theme-editor examples. All nine overview sizes remain displayed in each README; dimensions and SHA-256 values are in [the screenshot manifest](assets/screenshots/manifest.json).
- Existing fictional export samples remain byte-identical and hash-verified. Earlier native PowerPoint/PDF results below concern these retained sample files; they are not a new native Office run for this UI change.
- The user authorized pushing this complete change. Check the [GitHub Actions run for its published commit](https://github.com/hrmonic/it-productivity-toolbox/actions/workflows/ci.yml) for remote results. Known manual assistive-technology, real-device and additional-browser boundaries remain.

## Initial studio checkpoint (historical)

This is a local development checkpoint in `F:\APP\it-productivity-toolbox`, starting from `c3aee17`. No push, remote publication, deployment or Git history rewrite was performed. Earlier handoff entries are historical; the results below describe the current implementation.

## Work completed

- Preserved the original hero SVG byte-for-byte and placed it first in both README files. Removed the upper-right demo-project badge and added the official Réda Touzani/GitHub/contact/Apache attribution to reachable sidebar navigation.
- Corrected independent sidebar scrolling, mobile focus/background isolation, Escape/outside dismissal, sticky drawer close action, safe-area sizing, form sizing and translated tablet card overlap.
- Added decision timeline/health/recorded impact paths, accepted scope evolution and dependent-deliverable review, categorized acceptance scenarios and explicit coverage, retained capture drafts and reviewable duplication.
- Added shared Report Studio composition, six-step selection/customization/preview/export, real PDF preview, editable-text/shape PPTX, XLSX, Markdown, JSON, CSV and SVG page export. Missing inputs and source identities remain explicit.
- Added project brand profiles, bounded raster logos, native picker/HEX/palette/contrast controls, three typography roles, headers/footers and five cover compositions.
- Migrated IndexedDB from version 1 to 2 without resetting invalid recovery records. Backups import v1/v2 and export v2. Restored examples retain fictional provenance separately from resettable demo identity.
- Updated bilingual presentation, architecture/data model, user/reporting/design/i18n guides, roadmap, CI production audit, competitive workflow matrix and handoff.

## Executed checks and evidence

| Check                                                        | Current result                                                                                                                                       | Evidence                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                 | Passed: TypeScript, ESLint with zero warnings, Prettier, **84 tests in 8 files**, production build                                                   | [Acceptance receipt](evidence/acceptance.json) and observed local command completion                        |
| `node node_modules/@playwright/test/cli.js test --workers=2` | **30 passed**, 0 failed/skipped/flaky                                                                                                                | [Per-journey results and timings](evidence/acceptance.json)                                                 |
| Responsive matrix                                            | Nine exact viewports × nine routes × EN/FR; legacy 320 px checks retained                                                                            | [Viewport receipts](evidence/acceptance.json)                                                               |
| Automated accessibility                                      | Selected axe WCAG A/AA rules passed for covered screens/themes, including studios in EN/FR                                                           | Browser journey results; bounded automation, not certification                                              |
| `pnpm audit --json`                                          | No known advisories reported for the installed dependency graph; none muted                                                                          | [Audit JSON](evidence/dependency-audit.json)                                                                |
| `node scripts/capture-screenshots.mjs`                       | **35** authentic viewport references, exact dimensions at DPR 1, no full-page substitution                                                           | [Screenshot dimensions and hashes](assets/screenshots/manifest.json)                                        |
| Actual document exports                                      | All six formats downloaded and reopened; separate English/French PDF/PPTX                                                                            | [Document validation](evidence/document-validation.json), [unchanged sample hashes](examples/manifest.json) |
| `./scripts/verify-office.ps1`                                | PowerPoint 16.0 opened EN/FR decks read-only: **28 slides each**, 338/341 editable text shapes, no detected text-box overflow or out-of-slide shapes | [Native Office receipt](evidence/powerpoint-validation.json)                                                |
| PDF rendering                                                | 13 pages per English/French sample, logo and expected source text present; cover, summary, comparison and final pages rendered                       | [Retained rendered pages/slides](evidence/document-renders/)                                                |
| `node scripts/measure-performance.mjs`                       | Recorded local navigation/export timings and raw/gzip chunks against the build hash                                                                  | [Measurement method and raw samples](evidence/performance.json)                                             |

The source/build identity is recorded in the acceptance receipt and capture manifest. Reference images and sample outputs have SHA-256 hashes. Generated report samples remain byte-identical to their browser downloads; they are excluded from source-code formatting and verified by hashes instead.

The capture gate requires a passing complete browser report and matching production-build viewport receipts. Visual inspection covered desktop/ultrawide/tablet/mobile, dark mode, studios and rendered documents. The translated tablet counter collision found during inspection now has a geometric regression assertion.

## Measured costs and remaining boundaries

The local measurement script includes Playwright overhead and loopback delivery, not internet loading, Web Vitals, Lighthouse or a user study. Read the raw samples for the current timings. Export libraries load on demand; ExcelJS and fontkit still produce chunks above 500 kB, and the build warning remains visible. Their observed gzip sizes are approximately 256 kB and 328 kB. No memory-leak, mobile-hardware or large-workspace performance certification is claimed.

Remaining work is explicit: Firefox/WebKit; manual assistive technology and real-device virtual keyboards/safe areas; consented usability sessions; large/quota-constrained workspaces; tagged PDF/UA; broader font/script coverage; richer native chart/table and content-page template layouts. Current template variation is in cover compositions; content pages share the layout engine. Document previews use conservative geometry and actual PDF preview is available for final pagination. Unsupported font characters, excessive headers/footers and reports over 500 pages are refused explicitly.

Acceptance coverage means recorded complete scenario links, not executed tests or business validation. Dependency links define review scope, not proven consequences. No AI, external integration, multi-user service, predictive schedule or automatic approval is advertised.

Remote Linux CI had not run at this local checkpoint. After the user-authorized GitHub publication, consult the [Quality checks run for the published revision](https://github.com/hrmonic/it-productivity-toolbox/actions/workflows/ci.yml). The workflow includes a production dependency audit; configuration is not remote passing evidence.

## Reviewable samples and next action

The [English report](examples/fictional-atlas.pdf), [English deck](examples/fictional-atlas.pptx), [French report](examples/fictional-atlas-fr.pdf) and [French deck](examples/fictional-atlas-fr.pptx) contain explicitly fictional Atlas data. The deck texts and shapes are editable.

Next bounded validation: observe one delivery professional using fictional data to prepare a steering review, then record the first confusing step and whether the report’s facts/estimates/proposals were understood. The broader exploratory protocol is in [Product audit](PRODUCT_AUDIT.md). The user explicitly authorized committing and pushing the complete changes to GitHub on 15 October 2026.
