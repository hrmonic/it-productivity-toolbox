# Technical decisions — studio checkpoint

Date: 15 October 2026. These decisions extend the existing architecture; earlier choices remain in [Architecture](ARCHITECTURE.md) and [Design review](DESIGN_REVIEW.md).

| Decision                                                       | Reason                                                                     | Cost and validation                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Retain React/TypeScript/Dexie/Zod and feature domains          | Preserve functional workflows and data ownership                           | Whole-project aggregates remain a large-workspace trade-off; existing journeys retained        |
| Introduce database/backup version 2                            | Prevent older readers from silently dropping brand/refinement data         | Explicit v1 fixture upgrade, recovery preservation and v1/v2 import tests                      |
| Separate fictional provenance from resettable demo identity    | Restoring an example must not relabel it as real project evidence          | New `dataOrigin` field normalized from legacy demo flags and retained in copies                |
| Compose reports once, then render locally                      | Reuse calculations and provenance across PDF/PPTX/XLSX/text outputs        | Shared layout constraints and local export-library weight; round-trip and native Office checks |
| Normalize raster logos to bounded PNG; refuse SVG upload       | Keep the document image boundary inspectable without an SVG sanitizer      | Magic-byte/dimension/decode checks, bounded proportional resize, no vector logo import         |
| Embed OFL-licensed Noto substitutes in PDF                     | Preserve French characters without requiring recipient fonts               | Explicit substitution and unsupported-character refusal; PPTX still uses selected system fonts |
| Follow only recorded relationships and explicit scenario links | Avoid invented impact or coverage claims                                   | User entry/review is required; no semantic completeness or execution guarantee                 |
| Gate reference capture on current build receipts               | Ensure screenshots describe validated running behavior and exact viewports | Full browser suite must run before capture; image dimensions and hashes are verified           |
| Keep large export dependencies lazy and their warnings visible | Avoid front-loading document libraries or disguising measured cost         | Deferred network/CPU cost at first export; raw/gzip sizes and timings retained                 |

No hosting, remote analysis provider, global system-setting change or publication decision is part of this checkpoint.
