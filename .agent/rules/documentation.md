---
trigger: glob
globs: documentation/**
---
<!-- GENERATED: kind=core id=documentation source=core/documentation.md -->

# Documentation Rules

## Ownership and context

- Root `README.md` is the human entry point; adopt, never overwrite it. `documentation/README.md` owns the map; `project-brief.md` goals and `F-NNN`/`US-NNN`/`NFR-NNN`; `specs/SPEC-NNN-{slug}.md` behavior and `AC-NNN`; `traceability.md` relationships and observed evidence; `decisions.md` durable `DEC-NNN`; the active plan execution, dependencies, and `IMP-NN`/`PRE-NN` units; `manual-testing.md` `MT-NNN` procedures; `pulse.md` live continuity/routing and the next manual action; and `documentation-log.md` `DOC-YYYYMMDD-NNN` history. One fact has one authoritative owner; no parallel authority.
- Read pulse first, then relevant index/brief rows, active phase, and mapped specs/decisions/trace/tests. Backlog/legacy are opaque except exact approved lifecycle items. IDs are never reused or renumbered; superseded IDs retain replacement pointers.
- Controlled truth is README, index, brief, specs, traceability, decisions, active package, and log. Operational state is pulse, notes, credentials, manual procedures, and Repo Map. Only `plan` drains notes; only `improve` reads runtime feedback; only `model-review` reads model observations.

## Lifecycle and routing

- Explicit workflows never invoke another explicit workflow. They may consume a handoff, persist their postcondition, and recommend one eligible successor.

```text
Lifecycle State: bootstrap | adoption-required | adoption-mapped | standardized | drifted | conflicted
Active Plan: documentation/PLAN-{slug}.md | none
Plan State: none | draft | approved | executing
State Evidence: DOC-YYYYMMDD-NNN | none
Next Workflow: kickstart | adopt | standardize-docs | plan | scaffold | create | check | audit | operator-decision | none
Stage: kickoff | docs | scaffold | build (phase N/M) | audit | ui-polish | done | maintenance
Open Notes: ...
Session: ...
```

- `pulse.md` is the sole live routing owner. The plan owns package status/gates; brief/spec/traceability own scope status; the log owns history. Forbid live routing blocks outside pulse.
- Pulse owns the last delivery snapshot: separate plan-weighted `Implementation` and `Pre-production` percentages with date/workflow/runtime, active-phase implementation, and open gates. Only `create` and `end-session` write it. Others read without recomputing. Implementation normally stays monotonic but may decrease for approved added scope or proof that prior credit was absent/invalid; record the cause. Pre-production may decrease when environment evidence expires or fails.
- Routing hints: `bootstrap` routes new work to `kickstart`, otherwise `adopt`; `adoption-required` to `adopt`; `adoption-mapped | drifted` to `standardize-docs`; `conflicted` to `adopt | operator-decision`; standardized state to planning, delivery, or none.
- Legal transitions are `bootstrap -> standardized` by kickstart; `bootstrap | adoption-required | conflicted -> adoption-mapped` by adopt; `adoption-mapped | drifted -> standardized` by standardize-docs; and `standardized -> standardized` by conformant work. Blockers, certifications, and plan-state events append one DOC entry and advance evidence.
- `Active Plan: none` iff `Plan State: none`. Draft routes `operator-decision | plan`, never delivery. First landed implementation logs `begin-execution` and changes approved to executing. Final mapped evidence plus operator acceptance retires the package and clears both fields.
- Use the exact stage enum; labels such as `implementation` are invalid. Audit routes `audit` / `audit`; scaffold routes `scaffold` / `scaffold`; create/check routes `build (phase N/M)`. Without an active plan use `plan` / `docs` for approved unfinished work and `none` / `docs` only when no gate exists.
- Conclusive plan-time backfill requires all six: controlled index links resolve; required registries exist; zero or one linked active package and no retired plan active; used IDs/trace references resolve; no unaccounted controlled/root docs remain after bounded inventory; no material implemented-versus-approved contradiction exists. Otherwise route structure to `standardize-docs` and semantics to `adopt`.

## Shared documentation mutation protocol

Use the full path for truth/ownership/path mapping, lifecycle certification/backfill, plan creation/amendment/supersession, package retirement, or parallel-authority risk:

1. Read pulse/index; inventory bounded active docs, package shape, retired plans in active locations, out-of-contract sources, and inbox separation without opening backlog/legacy wholesale.
2. Read authorized targets completely; capture headings, IDs, tables, links, package members, and tails. Record contradictions before mutation.
3. Preserve unrelated work, IDs/pointers, one owner, complete packages, and provenance. Details stay under `documentation/plans/{slug}/`, deferred work in backlog, retired work in legacy.
4. Append one coherent DOC entry for controlled truth, lifecycle, active-plan state, or approved plan-content changes; routine operational updates create no noise. Postflight transition must match pulse. Forbid live routing blocks outside pulse.
5. Verify dispositions, links, zero/one active master, no retired active plan, one owner/fact, stable IDs, trace/progress/test owners, provenance, topology, legal stage/routing, and pulse evidence. Compare pre/post; report every added, changed, moved, and removed item; repair workflow-caused drift.

Use the scoped fast path only for already-owned phase/evidence, manual procedures, pulse, credentials, and touched Repo Map when authority, lifecycle, and plan contract do not change. Read touched files completely; preserve unrelated content; verify IDs, keys, links, statuses, and pulse. Blockers/certifications, plan-state events, draft revisions, and approved amendment/supersession still log once.

## Adoption and standardization

- Successful `adopt` logs `### Disposition manifest` with `Source | Evidence and semantic state | Approved disposition | Authority or destination | Remaining structural action`, sets adoption-mapped, advances evidence, and recommends `standardize-docs`.
- Standardization consumes that exact manifest and performs approved structural actions without reopening meaning. Drift repair never reinterprets implemented versus intended truth.
- Success logs `### Certification` rows `Check | Result | Evidence or action`, including honest no-op; sets standardized; advances evidence; removes duplicate live status; and preserves an approved/executing plan's gate. Without one it recommends `plan | none`.

## Plans and retirement

- Exactly one active `PLAN-{slug}.md` owns execution. Optional `plans/{slug}/` details exist only for distinct executor context, independent contract/acceptance, or readability; the master owns cross-cutting decisions, dependencies, status/gates, progress models, trace summary, and index.
- `plan` classifies changes as additive, refinement, conflict, or supersession; chooses create/amend/supersede; grounds work in owned truth/code; resolves contracts, security, failure, credentials, risks, phases, evidence, and manual checks; maps stable `IMP-NN`, `PRE-NN`, and `MT-NNN`; drains notes only after ownership; and never implements product code.
- New plans may persist as draft. Approval includes every package path and UTF-8 EOL-normalized SHA-256. Draft revision touches only the package and refreshes hashes. Rejection retires the draft and clears active state.
- Approved/executing amendment or supersession preserves package/truth/log/footer while proposing the complete delta, base hashes, and verified footer. Recompute before approval; changes require refreshed approval. Amendment retains state; supersession retires the old package. Deferral moves a complete package to backlog.
- Retirement moves complete packages to legacy with provenance. It requires mapped passing evidence plus Juanfra's confirmation, logs `retire`, clears active state, and recommends `plan` only for approved unfinished work.

## Progress, credentials, manual tests, and evidence

- The plan owns two stable binary weighted sets. `IMP` covers codeable deliverables and agent-run proof. `PRE` covers operator setup, manual acceptance, staging/deployment, and release readiness not required to prove implementation. A unit appears once; identical scope/evidence reproduces identical percentages.
- A credential is setup, not implementation; plumbing/adapters are implementation. `credentials.md` stores no secrets and records exact key, environment, purpose, setup location/status, interface/fallback, real-service validation status/date, and blocked unit. Setup is `placeholder | configured | required`; validation is `not run | passed | failed | not applicable`.
- If real-service validation is required to prove a feature, it remains in the current implementation phase and blocks its `IMP` unit until the credential is configured and the agent runs the safe integration check. Staging/deployment-only validation belongs to `PRE`. Never count one gate twice.
- Never request a secret in chat. Name the key and direct Juanfra to the documented environment, secret store, file section, or provider page. Use honest fallbacks when possible. Missing credentials block only dependent units while independent approved work continues. On first touch of an older file, add only missing fields/rows and preserve custom content.
- `manual-testing.md` owns the cumulative active suite. Every reusable procedure has stable `MT-NNN`, setup/fixtures, cleanup, actions, visible expectations, and safe rejection checks. Later phases amend or supersede obsolete procedures with replacement pointers. Plans reference MT IDs; traceability records dated observed results; pulse carries only the next action.
- Every approved story maps through feature, spec/AC, phase, one relevant progress unit per gate, and evidence. Enabling work maps to NFR, DEC, or explicit owner. Required rows without passing evidence cannot be accepted.
- The log records reason, workflow, operation, approval, files, IDs, moves, validation, and later commit. Operations are `create | adopt | amend | supersede | retire | reactivate | block | certify | approve | begin-execution`.
