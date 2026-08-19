---
name: audit
description: "Explicit-only read-only phase review for correctness, plan fit, edge cases, security, maintainability, and evidence gaps."
---
<!-- GENERATED: kind=workflows id=audit source=workflows/audit.md -->

# Audit

This workflow is explicit-only.

Review read-only in a clean context when practical, preferably with `independent-auditor` and a different model family from the builder.

1. Compare approved `US -> F -> SPEC/AC -> phase -> evidence`, decisions, deviations, implementation, and actual validation.
2. Bound the audit to the concrete claim, changed surface, milestone, or named risk. Audit all approved scope mapped to that boundary, but do not expand a defect exposed by operator testing into a broad phase audit unless shared authorization, data, architecture, or regression risk makes the expansion necessary. A milestone or phase that has already passed a bounded audit with no high- or critical-severity finding is audit-closed; re-auditing that same scope requires a changed surface, invalidated evidence, or an explicit operator request. Successive audits must not reopen an entire milestone on newly-styled non-overlapping low-severity observations — record those as backlog notes, not milestone blockers.
3. Distinguish structural drift requiring `standardize-docs` from truth contradiction requiring `adopt`; report without repair or footer/log mutation.
4. Reuse fresh passing evidence when the covered code, dependencies, configuration, and environment have not changed. Prefer focused independent checks; require a full phase/regression audit only for a milestone gate, material security/architecture change, cross-cutting evidence invalidation, or explicit operator request, and state that reason in one sentence.
5. Flag missing owners, duplicate authority, undocumented drift, stale/failed evidence, credential-dependent claims not actually validated, and code/check mismatches. Prioritize correctness, regression/authorization/data/failure risk, accessibility, performance, maintainability, and verification. Ground findings in tight locations/reproducible behavior and distinguish defects from preferences.
6. Rank findings and lead with the concrete outcome. Never use `partial` as the whole status: distinguish code complete from required real/manual validation and state whether implementation can continue without the operator. When manual experience is the cheapest decisive evidence, provide the exact start command, route, actions, visible expectations, safe rejection checks, and a short yes/no checklist.
7. Keep detailed findings in chat and only durable actionables in pulse when a separately authorized owner updates it. Do not edit code/controlled docs or drain notes.
