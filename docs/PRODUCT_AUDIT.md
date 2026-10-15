# Product audit and differentiation

Audit date: 15 October 2026. Starting revision: `c3aee17`. Scope: the existing browser-local application, not a replacement stack. No remote publication is part of this work.

## Confirmed starting points

- React/strict TypeScript feature boundaries, Dexie, bounded Zod schemas, explicit relationships, revision conflict refusal and frozen agreements were already present. The existing 60 unit/component/localization tests passed locally at the start of the audit.
- The fixed sidebar had no vertical overflow strategy. Its footer could fall below short viewports. The mobile drawer trapped keyboard navigation but did not isolate the background or lock document scrolling.
- The header contained the unwanted demo-project badge. The sidebar lacked author, contact and linked license attribution.
- Both README files used an application screenshot as their first visual. The official hero file existed and must remain unchanged. Its starting SHA-256 is `F8E05C86AA21583E0559691D4258F75AC54822C9C3E496BBFDD34AF24F71C1B7`.
- The screenshot script used a 1440 × 1050 viewport and full-page output. Those images were not the specified viewport references.
- Decision history, baseline comparison, proposal simulation and editable story review notes already worked. Report Studio, Brand Studio, professional document generation, explicit scenario coverage and transitive impact exploration were absent.
- Existing export headings were English-only. Existing schema version 1 backups needed additive defaults for new content.

## User task and alternatives

The target task is preparing a project review after a decision, scope request or requirement changes: recover the reasoning, identify recorded dependencies, expose unknowns and produce a document colleagues can review without opening the toolbox. Today this can involve an ADR log, a backlog/planning tool and manual document assembly. The comparison below records documented workflows, not a hands-on benchmark or a claim that competitors lack undocumented capabilities.

| Alternative and verified source                                                                                                                                   | Documented workflow and strength                                                                                                                                       | Opportunity for this toolbox                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR Tools](https://github.com/npryce/adr-tools)                                                                                                                  | Initialize an ADR directory, create numbered Markdown records in an editor, and link or supersede prior records. Open source and easy to keep alongside code.          | Preserve explicit decision history while offering non-CLI review of its recorded connections to changes and stories. ADR Tools already supports links and supersession; their existence is not a differentiator. |
| [Jira plan scenarios](https://support.atlassian.com/jira-software-cloud/docs/what-are-scenarios-in-advanced-roadmaps/)                                            | Premium/Enterprise plans offer alternate what-if plans. Changes remain in the planning sandbox until committed.                                                        | Offer a bounded baseline/proposal workflow locally without a mandatory account. Isolated simulation is established practice, not an exclusive feature.                                                           |
| [Jama Trace View Canvas](https://help.jamasoftware.com/ah/en/manage-content/trace-view-canvas--beta-/explore-item-relationships-in-trace-view-canvas--beta-.html) | Select an item, inspect upstream/downstream relations, expand the chain and inspect coverage indicators. The cited feature is identified as beta by its documentation. | Make a smaller explicit relationship model understandable to a delivery team. Do not imply parity with Jama’s requirements verification or claim that a recorded link proves execution.                          |
| [Confluence exports](https://support.atlassian.com/confluence-cloud/docs/export-content-to-word-pdf-html-and-xml)                                                 | Export published content individually or select space content for PDF and other formats. PDF customization and export scope have documented rules.                     | Compose a report directly from structured project records with source identifiers and reusable local branding. This is a workflow hypothesis, not a measured time saving.                                        |

Sources were read on the audit date. Pricing totals, installation timings, maintenance velocity, market size and competitor defect rates were not measured. Commercial terms beyond the explicitly documented Jira plan restriction were not evaluated. No unverified lack of feature or user complaint is attributed to a competitor.

## Delivery choices

1. **P0 first:** independent sidebar scrolling, focus restoration after background isolation, safe areas, usable forms, explicit attribution, preserved banner and nine exact viewport validations.
2. **P1 domain value:** decision warnings without scores; traversable paths based only on stored links; effective-date scope history; dependency review; confirmed acceptance scenarios with explicit requirement links. Editing the source invalidates coverage links while retaining scenario text.
3. **Shared reporting:** normalize selected records, retain source IDs, reuse the scope calculation, state snapshot/filter semantics, omit empty sections and expose missing estimates. Browser renderers produce PDF, editable-text/shape PPTX, XLSX, Markdown, CSV and report-model JSON.
4. **Branding:** project-scoped profiles travel in validated backups. Raster logos are checked, resized proportionally and normalized to PNG. SVG logo upload is deliberately unsupported. Native color inputs, HEX fields, palette, recent colors, contrast guidance and distinct cover compositions support document preparation.
5. **P2 boundaries:** external integrations, collaborative accounts, automatic narrative generation and automated text-to-decision approval remain outside this delivery. None is required to complete a local review.

## Validation hypothesis

GO for a bounded local review workflow. Reasons: existing reliable domain foundations; explicit data ownership; a concrete analysis-to-document task. Objections: duplicate entry may deter adoption; mature suites already handle planning and traceability; document composition adds font and layout maintenance. No demand validation is claimed.

Proposed next research: observe five IT delivery professionals using fictional data to prepare a review containing one decision, one proposed change and one story. Before the sessions, define success as at least four completing a correct, sourced export without intervention, no confusion between simulation and accepted scope, and no invented business rule. Record elapsed task time and confusing steps. These are proposed research criteria, not current results or a promise of quantified productivity gains.
