---
description: "Explicit-only evidence-led migration of an existing repository into the shared documentation and planning contract."
---
<!-- GENERATED: kind=workflows id=adopt source=workflows/adopt.md -->

# Adopt

This workflow is explicit-only.

Use only to reconcile existing or materially truth-drifted product truth without loss. Apply the full shared documentation mutation protocol; do not implement product code or invoke another workflow.

## A. Repository and truth discovery

1. Verify the route from repository evidence. Treat it as `adoption-required` until a complete approved mapping lands. Persist that blocker only when pausing/closing: append one compact `block` DOC entry, update `State Evidence`, and recommend `adopt`.
2. Inventory root README and product docs without scanning backlog/legacy wholesale. Inspect real code, configuration, tests, Git, runtime behavior, and—only when present—schema, migrations, or generated schema.
3. Classify evidence as implemented, partial, contradicted, operator-approved intent, unapproved intent, deferred, historical, or unknown/unverifiable. Never turn code-inferred behavior into approved intent.

## B. Semantic mapping

4. Present one approved row for every source: keep authoritative; adopt into brief/spec/decision/traceability; preserve then condense; backlog; legacy; conflict; or unknown. Never overwrite the root README or discard/move originals before approval and destination security.
5. Assign one authoritative owner; preserve stable identifiers and issue new IDs only when needed. Map features, stories, requirements, ACs, decisions, and plan lineage without authoring a new decision-complete plan.
6. Carry an existing plan into pulse only when its path and `draft | approved | executing` state are verified; otherwise keep it only as a manifest candidate. Classify complete/superseded/abandoned/historical packages to legacy and decided deferred packages to backlog with full provenance.
7. Triage operator notes separately and ask unresolved semantic contradictions in numbered batches. If unresolved, persist `conflicted` with a `block` DOC entry and `Next Workflow: operator-decision`; never claim an adoption handoff.

## C. Apply and hand off

8. Apply the approved mapping through targeted edits. Preserve source bodies/tails, update owners, IDs, links, traceability, Repo Map, and pulse, and verify every source disposition and final link.
9. Append one adoption DOC entry with `### Disposition manifest` and a row for every inventoried source: `Source | Evidence and semantic state | Approved disposition | Authority or destination | Remaining structural action`.
10. Set `Lifecycle State: adoption-mapped`, verified active-plan fields or both `none`, `State Evidence: <adoption DOC ID>`, `Next Workflow: standardize-docs`, and `Stage: docs`. Recommend explicit `standardize-docs`; never invoke it or `plan`.
