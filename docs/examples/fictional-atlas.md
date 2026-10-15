# Atlas review · décisions et impacts

Atlas customer portal
10/15/2026
Fictional example data

## Executive summary

### Atlas customer portal

**Selected records**

2 decisions · 3 changes · 2 stories

**Audience**

Project leadership

**Introduction**

A traceable review of the fictional Atlas project.

**Reference period**

All dates / All dates

**Data status**

Fictional example data

Sources: 2709e3d6-b9df-4970-9f0a-fb6f872745db

## Decisions

### Make data exports self-service

**Status**

accepted

**Owner**

Alex Morgan (fictional)

**Decision date**

10/15/2026

**Context & problem**

Support currently prepares account exports manually. Customers need a repeatable way to retrieve their own records.

**Selected solution**

Offer CSV export from the account workspace.

**Rationale**

A focused self-service flow addresses a recurring request without introducing a reporting platform.

**Alternatives**

Keep support-assisted exports
Advantages: No implementation effort.
Trade-offs: Continued wait time and support effort.

Add self-service CSV export
Advantages: Customers can retrieve records directly.
Trade-offs: Requires access-control and failure handling.

**Assumptions**

The existing account model defines the accessible record scope.

**Constraints**

No changes to the authorization model in this release.

**Stakeholders**

Product, Engineering, Customer support

Sources: 738b066a-a2c2-4b26-a44e-6eed637dd041

### Keep the first release focused on desktop workflows

**Status**

proposed

**Owner**

Alex Morgan (fictional)

**Decision date**

10/15/2026

**Context & problem**

Support currently prepares account exports manually. Customers need a repeatable way to retrieve their own records.

**Selected solution**

Not recorded

**Rationale**

Validate the main workflow before expanding the release scope.

**Assumptions**

The existing account model defines the accessible record scope.

**Constraints**

No changes to the authorization model in this release.

**Stakeholders**

Product, Engineering, Customer support

Sources: 39be1c40-2325-4913-b3d6-df76cd762673

## Scope & changes

### Baseline v1

**Objective**

Give customers a reliable account workspace with clear access to their own records.

**Status**

Frozen

**Calculation context**

Snapshot includes every accepted change for this baseline through the reference end date. Selection and start date filter the register, not the snapshot.

**Initial effort · estimate**

16 person-days

**Current effort · estimate**

20 person-days

**Effort change · estimate**

4 person-days

**Current deliverables**

Account overview: 5 person-days (must)
Activity timeline: 8 person-days (must)
Workspace settings: 3 person-days (should)
Self-service CSV export: 4 person-days (must)

**Assumptions**

Estimates are fictional planning inputs, not delivery commitments.

**Constraints**

One release; existing account service.

**Attention points**

Recorded risk — Self-service CSV export: Confirm the maximum supported export size.

Sources: a9d97d14-f048-449d-96ad-aff429de93f2, 457abfc4-6b5d-4fb7-8fa8-9fe59830a11c

### Self-service CSV export

**Status**

accepted

**Change type**

addition

**Description**

Add an export action for customer account records.

**Justification**

Implements the self-service export decision.

**Requested by**

Sam Chen (fictional)

**Effort input**

4 person-days (input)

**Dependencies**

Account overview

Sources: 457abfc4-6b5d-4fb7-8fa8-9fe59830a11c, a9d97d14-f048-449d-96ad-aff429de93f2

### Saved export presets

**Status**

proposed

**Change type**

addition

**Description**

Let customers save their export column selection.

**Justification**

Potential follow-up for repeat exports.

**Requested by**

Sam Chen (fictional)

**Effort input**

3 person-days (input)

**Dependencies**

Account overview

Sources: 3da8f527-d53b-4dc7-8fca-ca56bd6f6283, a9d97d14-f048-449d-96ad-aff429de93f2

### Custom reporting dashboard

**Status**

rejected

**Change type**

addition

**Description**

Add a configurable reporting dashboard.

**Justification**

Outside the focused first release.

**Requested by**

Sam Chen (fictional)

**Effort input**

13 person-days (input)

**Dependencies**

Account overview

Sources: 8ca5d728-3696-4827-b97d-1c6eb23a8b5f, a9d97d14-f048-449d-96ad-aff429de93f2

## Story refinement

### Export account records

**Original story**

As an account administrator, I want to export my account records easily, so that I can prepare internal reports.

**User story**

As an account administrator, I want to export my account records easily, so that I can prepare internal reports.

**User / persona**

Account administrator

**Need**

Export the records available in my account workspace.

**User value**

Prepare internal reporting without waiting for support.

**Acceptance criteria**

Given an authenticated account administrator with accessible records, when they request a CSV export, then a CSV file containing those records is downloaded.

**Open questions**

“easily” is subjective and does not define an observable threshold. What observable condition would demonstrate “easily”? Agree on a measurable expectation.
No error condition is mentioned in the story or criteria. Which failure conditions are relevant here, and what feedback should the user receive?
The empty-data case is not described. What should happen when there are no data to export?

**Business rules**

Apply the existing account access permissions.

**Constraints**

CSV only for the first release.

**Dependencies**

Account overview and existing authorization rules.

Sources: d149221e-de7d-4a9f-9ea1-6b08873731b0

### Understand the activity timeline

**Original story**

As an account administrator, I want a fast and intuitive activity timeline.

**User story**

As an account administrator, I want a fast and intuitive activity timeline.

**User / persona**

Account administrator

**Need**

See account activity in chronological order.

**User value**

Understand recent updates.

**Open questions**

“fast” is subjective and does not define an observable threshold. What observable condition would demonstrate “fast”? Agree on a measurable expectation.
“intuitive” is subjective and does not define an observable threshold. What observable condition would demonstrate “intuitive”? Agree on a measurable expectation.
No acceptance criteria are recorded. Given [confirmed context], when [the requested action occurs], then [an observable result]. Replace each placeholder with an agreed fact.
No error condition is mentioned in the story or criteria. Which failure conditions are relevant here, and what feedback should the user receive?
No business rules are recorded. They may be unnecessary; confirm with the team. Are there eligibility, permission, or data-handling rules to confirm?

**Dependencies**

Account overview

Sources: e6d12a12-320e-4f8f-9cbf-b79fb0dfc2ef

## Recorded connections

### Make data exports self-service → Self-service CSV export

**Relationship**

informs

**Relationship context**

The decision provides the rationale for this scope addition.

Sources: 972cd581-c94a-4e2c-aea4-8d04d1b47515, 738b066a-a2c2-4b26-a44e-6eed637dd041, 457abfc4-6b5d-4fb7-8fa8-9fe59830a11c

### Self-service CSV export → Export account records

**Relationship**

affects

**Relationship context**

The story describes the export behavior introduced by this change.

Sources: 4929ae7b-a719-4250-9325-7f89b6193c9e, 457abfc4-6b5d-4fb7-8fa8-9fe59830a11c, d149221e-de7d-4a9f-9ea1-6b08873731b0

## Attention points

### Make data exports self-service

**Attention points**

Recorded assumptions have not been verified.

Sources: 738b066a-a2c2-4b26-a44e-6eed637dd041

### Make data exports self-service

**Attention points**

Large exports may require a later asynchronous workflow.

Sources: 738b066a-a2c2-4b26-a44e-6eed637dd041

### Keep the first release focused on desktop workflows

**Attention points**

Recorded assumptions have not been verified.

Sources: 39be1c40-2325-4913-b3d6-df76cd762673

### Keep the first release focused on desktop workflows

**Attention points**

Large exports may require a later asynchronous workflow.

Sources: 39be1c40-2325-4913-b3d6-df76cd762673

### Self-service CSV export

**Known risks**

Confirm the maximum supported export size.

Sources: 457abfc4-6b5d-4fb7-8fa8-9fe59830a11c

## Arbitrations & next actions

### Keep the first release focused on desktop workflows

**Arbitration required**

Review the proposed decision with the recorded owner.

**Owner**

Alex Morgan (fictional)

Sources: 39be1c40-2325-4913-b3d6-df76cd762673

### Saved export presets

**Arbitration required**

Accept or reject this proposal explicitly after reviewing its impacts.

Sources: 3da8f527-d53b-4dc7-8fca-ca56bd6f6283