---
trigger: model_decision
description: "Planning, implementation, validation, phase completion, change safety, and Git discipline."
---
<!-- GENERATED: kind=core id=delivery source=core/delivery.md -->

# Delivery Rules

## Planning and implementation

- A decision-complete plan resolves scope, architecture, interfaces, schemas, naming, assumptions and fallbacks, credentials, risks, failure behavior, phases, mapped IDs, acceptance criteria, evidence requirements, manual tests, and edge cases.
- Implement only the approved active phase and its mapped `US`, `SPEC`/`AC`, `NFR`, or `DEC` scope. A phase labeled enabling work must name its owner and boundary. Do not silently change product truth to fit implementation.
- Phase dependencies say whether they require a prior phase's `implementation` or `acceptance`; do not block codeable work on operator acceptance unless the plan makes that dependency real.
- Verify real routes, files, assets, interfaces, and behavior before editing. Follow project conventions and avoid formatting or rename churn outside scope.
- Preserve accessibility, security, cleanup, degraded behavior, and all reachable UI states required by the owning specification.

## Validation and completion

- Classify changed surfaces and run the smallest risk-relevant repository checks that can disprove the change. Reuse fresh passing evidence only when covered code, dependencies, configuration, and environment are unchanged. Reserve full regression stacks for material security or architecture changes, milestone gates, releases, or invalidated evidence.
- Inspect the final diff and update mapped traceability rows with concrete evidence: automated test path/name, exact executed command, reused-evidence basis, or dated manual expected/observed result. Status text alone is never evidence.
- A completion claim fails when a required scope row, acceptance criterion, or evidence link is missing or failed. If a failure persists after three reasonable attempts, preserve evidence, continue other safe work, and report the remaining constraint without marking the unit complete.
- Keep two stable plan-owned progress models. `Implementation` contains codeable work plus the agent-run automated and integration proof required to show that the feature works, including credential-dependent real-service checks when that proof requires them. `Pre-production` contains operator setup, manual acceptance, staging/deployment, and release-readiness gates not required for implementation proof. Classify a check by the evidence it supplies and the gate that owns it, never by the test name alone. Units are binary, appear in exactly one track, and reproduce identical percentages from unchanged scope and evidence.
- Report active-phase implementation and project implementation separately. Implementation normally stays monotonic; lower it only for approved added scope or evidence that previously credited work is absent or invalid, and name the cause. A failed manual or pre-production check does not erase landed implementation, but it blocks readiness and opens a mapped repair unit when code must change.
- Implementation may reach 100% while pre-production remains open. Never call the project finished, ready, or needing nothing until both tracks and every required gate pass. A credential value is setup, not code; after setup, the agent still runs the mapped safe integration check before crediting the dependent unit.
- Maintain the cumulative `manual-testing.md` suite phase by phase. Prefer a short guided `MT-NNN` route when experience is decisive; consolidate the active suite for the final release pass, superseding obsolete tests rather than duplicating them. Record observed results in traceability, not in the procedure file.
- A phase closeout records shipped IDs, automated evidence, affected MT IDs, setup, both progress tracks, plan/trace status, inbox/log effects, and next phase in controlled documentation. Operator-facing closeouts show only useful vertical metadata, `Done:`, `Next:`, and `Need from you:` unless more detail changes a decision.
- Create small coherent commits inside a phase when authorized, followed by an identifiable phase-closeout commit after required automated checks. Preserve unrelated dirty work. Keep credentials and generated secrets out of Git; push only when explicitly authorized and only to the intended repository and remote.
- Plans involving deployment, migrations, destructive operations, or hard-to-reverse state include proportionate recovery/rollback steps and evidence. Do not add enterprise ceremony to low-risk local work.

## Advising the operator

- Distinguish *this will not work* from *this will not pay*. The first is technical and already owned by scope, product-truth, and validation rules. The second is a judgment about whether requested work is worth its cost against the operator's stated goals.
- Advise only from something checkable: a measurable cost or outcome, an operator goal, project type, recorded decision, working behavior about to be reversed, a bottleneck the request does not touch, or a materially better evidence-backed option at comparable scope and risk. Taste, hypotheticals, and unsolicited business strategy are never grounds.
- State the basis and its absence. A commercial claim needs commercial facts; when revenue, usage, or cost figures were not provided, say the judgment is unsupported rather than estimating one.
- Advise once while the decision is still actionable, then execute the settled decision in full. Advice never blocks or weakens existing stops for product-truth conflicts, missing approval, absent credentials, or consequential external actions.
- At most one advisory per workflow run. Do not reopen a settled decision unless new evidence changes the ground.
