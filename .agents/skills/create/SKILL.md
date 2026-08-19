---
name: create
description: "Explicit-only end-to-end implementation of the active approved phase with scoped validation and continuity updates."
---
<!-- GENERATED: kind=workflows id=create source=workflows/create.md -->

# Create

This workflow is explicit-only.

Implement the current approved phase end to end.

1. Verify standardized lifecycle, the approved/executing active plan, current phase, mapped scope/evidence, assumptions, model capability, platform overlay, and exact detail files. Read the plan-owned `IMP-NN` and `PRE-NN` tables; identify them by shape, never create duplicates. If an older approved plan has one combined table, split it once through an authorized plan amendment before reporting new progress.
2. Inspect real interfaces and preserve unrelated work. Implement every independent codeable unit in the current phase, including loading, empty, error, permission, accessibility, cleanup, degraded states, and planned credential interfaces/fallbacks. A dependency on prior `implementation` permits work after that code lands; a dependency on prior `acceptance` waits for its required evidence.
3. Use documented assumptions. If implementation reveals a product-truth conflict, stop only the affected unit and preserve evidence. Never store/request a secret or treat a placeholder as real-service proof. If an exact credential is now unavoidable, immediately name its key, what is blocked, and the documented setup location; continue all independent units. When Juanfra defers it, keep the unit open and advance only where dependencies permit without forcing `end-session`.
4. Run the smallest risk-relevant checks that can disprove the change, reuse fresh evidence only when code/dependencies/configuration/environment are unchanged, and inspect the diff. After a configured credential becomes available, run the mapped safe integration check; setup alone never completes the unit. Record test path/name, exact command, reuse basis, or dated observed result in traceability.
5. Update `manual-testing.md` for changed user-visible behavior: add or amend stable `MT-NNN` procedures with setup/fixtures, cleanup, actions, visible expectations, and safe rejection checks. Supersede obsolete procedures with replacement pointers. The phase and plan reference MT IDs; traceability stores results; pulse stores only the next relevant manual action. Skip manual tests that add no decision value.
6. Use the scoped documentation path for phase/evidence, credentials, manual procedures, touched Repo Map, pulse, and progress. On first landed implementation append one `begin-execution` DOC entry and set the plan executing; do not repeat it. Use the full path only for an authorized truth, structure, lifecycle, or plan-contract change.
7. When repository and operator authorization permit commits, create small coherent commits within the phase and one identifiable phase-closeout commit after required automated checks. Stage only intended paths, preserve unrelated dirty work, keep secrets out of Git, and never push without explicit authorization.
8. Compute active-phase implementation from its `IMP` units, project implementation from all `IMP` units, and pre-production readiness from all `PRE` units. Identical scope/evidence must reproduce identical percentages. Implementation normally remains monotonic; lower it only for approved scope growth or proof that prior credit was absent/invalid, and state why. Failed pre-production/manual evidence blocks readiness and opens repair when code changes are required; it does not automatically erase landed implementation.
9. Persist both tracks and open gates in pulse. Implementation can be 100% while pre-production remains open; `Finished: yes` requires both tracks and every required gate. Close with conditional vertical metadata from the response contract, then `Done:`, `Next:`, and `Need from you:`. Name only actionable credentials or decisions and give the exact setup location; use `Need from you: Nothing right now.` when no input is actionable. Do not dump IDs or technical detail unless they change Juanfra's next decision.
