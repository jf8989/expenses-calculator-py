---
name: plan
description: "Explicit-only decision-complete planning, draft gap analysis, risk resolution, and operator-inbox drain into approved scope."
---
<!-- GENERATED: kind=workflows id=plan source=workflows/plan.md -->

# Plan

This workflow is explicit-only.

Create, safely amend, or supersede the one active decision-complete master plan. Do not implement product code or invoke another workflow.

## Preconditions and operation

1. Verify lifecycle/footer against repository evidence and apply the full documentation-mutation protocol. Proceed when standardized. For legacy state, establish standardized only after the conclusive-backfill checklist passes in a logged plan mutation. Route structural ambiguity to `standardize-docs` and semantic contradiction to `adopt`; persist a verified blocker with one compact `block` DOC entry.
2. Select `create` when no active plan exists and approved unfinished work does; `amend` for compatible additive/refining work; `supersede` for material goal, architecture, order, or contract conflict. A completed active plan requires final acceptance/retirement first. Create no empty plan.
3. Ground requirements in operator notes, project brief, specs, decisions, traceability, real code, and platform constraints. Gap-analyze external drafts and preserve sound content.

## Produce a decision-complete package

4. Compare up to three viable paths; choose one and resolve scope, architecture, files, interfaces, schemas, naming, security, failure behavior, assumptions/fallbacks, credentials, risks, phases, acceptance, evidence, and manual checks. Add proportionate recovery/rollback only for deployment, migrations, destructive operations, or hard-to-reverse state.
5. For every credential/external service, use one exact environment-variable/name key in both plan and `credentials.md`; record environment, purpose, acquisition/setup location and status, interface boundary, safe fallback/mock, real-service validation status/date, and exact blocked `IMP` or `PRE` unit. Never ask for or store secrets. Credential plumbing is implementation; the value is setup. Put a real-service check in implementation only when required to prove the feature; otherwise place staging/deployment validation in pre-production. Never count one check twice.
6. Map each phase to stable `US`, `SPEC`/`AC`, `NFR`, or `DEC` IDs, or explicit enabling work. Give each phase a non-binding capability recommendation and state every dependency as prior-phase `implementation` or `acceptance`.
7. Persist two stable progress models: `IMP-NN` units for codeable deliverables and agent-run proof, and `PRE-NN` units for manual, environment, deployment, and operator readiness. Default to equal weight within each track; a unit appears once and is binary. Update the owner tables whenever an amendment changes scope.
8. Create or update stable `MT-NNN` procedures in `manual-testing.md`; phases reference IDs instead of duplicating steps. Include setup/fixtures, cleanup, ordered actions, visible expectations, and safe rejection checks. Supersede obsolete procedures with replacement pointers.
9. Keep small work in the master. Create details only under `documentation/plans/{slug}/` for distinct executor context, independent contract/acceptance ownership, or master readability. The master owns cross-cutting decisions, dependencies, status/gates, progress, trace summary, and detail index. Drain operator notes only after mapping each item to approved owned IDs and a phase or `project/future-ideas.md`; report every mapping.

## Preservation and approval

10. Before amendment/supersession, read the complete package and capture headings, IDs, tables, links, phases, decisions, paths, and tails. Classify requests as additive, refinement, conflict, or supersession. Compare complete before/after packages and report every addition, change, move, and removal.
11. A new plan may persist as draft. Append `create`, set standardized lifecycle, draft plan state, its DOC evidence, `operator-decision`, and `docs`. Request approval once with every package path and UTF-8 EOL-normalized SHA-256. Revisions touch only the draft package, append compact `amend`, and refresh hashes. Rejection retires the complete draft with provenance and clears active-plan fields.
12. For approved/executing amendment or supersession, leave active truth byte-identical while presenting the decision-complete delta, all base package paths/hashes, and verified footer. Recompute immediately before applying; base/footer changes require refreshed approval. Rejection mutates nothing. Matching approval applies atomically, appends `approve`, advances evidence, preserves state for amendment, and retires the prior package for supersession. Publish one exact legal next gate in log, pulse, and current-state mirrors. Deferral moves a complete approved unexecuted package to backlog.

## Postflight

13. Run executor readiness, traceability, dual-progress, credential, manual-suite, and routing checks. Fail on stale proposed labels, illegal stage, duplicate progress/test authority, or log/pulse/mirror mismatch. Repair conformance failures caused by planning before close; successful repeated planning remains standardized.
14. Preserve complete package content and stable IDs across additive/refining amendment, report exact validation/manual gaps, and leave credential-dependent units incomplete while independent safe work continues.
