# From meeting notes to traceable decisions: a human-review checklist

<img src="https://iadujour.fr/assets/brand/android-chrome-512x512.png" width="88" alt="Orange IA du Jour symbol" />

*Companion field guide for IT Productivity Toolbox. The scenario is fictional. No time-saving or accuracy claims are made.*

A well-written AI-generated meeting summary can still turn a suggestion into a commitment. Before storing it as project evidence, distinguish approved decisions from unapproved proposals.

## Fictional example

At a customer-portal planning meeting, the team discusses a requested CSV export, optional filters, and a possible month-end deadline. No one approves the filters or commits to the deadline.

A misleading summary would say that all three items were approved. A useful review instead produces three separate records: a confirmed decision, a proposed change and a date awaiting confirmation.

## Five checks before sharing

1. **Keep the evidence.** Preserve dated meeting notes and the identity of the people authorized to confirm decisions. Remove sensitive details before using external AI services.
2. **Extract, do not fill gaps.** Ask for the exact source excerpt, decision status, explicitly named owner and unanswered questions. Unknown means unknown.
3. **Confirm each decision.** A responsible person validates the scope, alternatives and rationale. A model’s suggestion is not an organizational decision.
4. **Separate the consequences.** Capture approved rationale in *DecisionTrace*, assess scope proposals in *Scope Radar*, and review story ambiguity in *StoryGap*. Do not silently treat suggested criteria as approved acceptance tests.
5. **Review the output against the notes.** Look for invented deadlines, missing caveats, misattributed owners and unapproved commitments. Only a human with the appropriate role distributes the final record.

## Review grid

| Check | Evidence needed |
| --- | --- |
| Was this actually decided? | A dated excerpt or explicit confirmation |
| Who approved it? | A named decision-maker or team |
| What remains unresolved? | Open questions, not commitments |
| Does it change scope? | A separate change proposal and decision |
| Is the requirement testable? | Acceptance criteria reviewed by the team |
| Who publishes the record? | An accountable human |

## Prompt starter

> Classify the meeting notes into (1) explicitly approved decisions, (2) proposals not yet approved, (3) open questions and (4) actions with owners only where stated. Quote the supporting excerpt for each item. Do not invent people, dates or commitments. Flag ambiguity instead of resolving it silently. Notes: [paste anonymized notes].

Treat the result as a draft for validation, not as certified minutes.

## Further reading

[IA du Jour](https://iadujour.fr/en/) is an editorial resource with practical AI use cases, source attribution, reusable prompts and review limitations. It is independently edited by the maintainer of this repository. It is neither a built-in feature of IT Productivity Toolbox nor evidence of this tool’s performance.

---

*Published November 2026 · Educational example · Adapt to your organization’s policies.*
