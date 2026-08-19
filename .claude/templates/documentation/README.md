# Documentation Index

Start here. This index defines where each kind of project truth lives and whether agents read it during normal work.

## Authoritative product truth

| Path | Owner and purpose | Mutation | Normal context |
|---|---|---|---|
| `../README.md` | Human entry point: purpose, maturity, quickstart, architecture synopsis, essential commands, and links. | Controlled; adopt an existing file, never overwrite it. | Read when project orientation or commands require it. |
| `project-brief.md` | Operator-approved whole-product registry: goals, feature IDs, story IDs, NFR IDs, constraints, and release summary. | Controlled through `kickstart`, `adopt`, `plan`, or an approved scoped edit. | Read the registry rows relevant to the task. |
| `specs/SPEC-NNN-{slug}.md` | Detailed behavior and stable acceptance criteria for one cohesive area. | Controlled; one fact has one authoritative owner. | Read only specs mapped to the active phase. |
| `traceability.md` | Relationship and evidence matrix from approved scope to implementation and validation. | Controlled; update mappings and landed evidence. | Read rows mapped to the active phase or claim. |
| `manual-testing.md` | Cumulative active operator procedures with stable `MT-NNN` IDs; procedure only, never observed results. | Controlled operational procedure; update affected tests phase by phase and retain supersession pointers. | Read only MT IDs mapped to the active phase or acceptance claim. |
| `decisions.md` | Durable product and architecture decisions (`DEC-NNN`) that future plans must respect. | Controlled; supersede, never silently rewrite history. | Read referenced decisions only. |
| `PLAN-{slug}.md` | The one active master plan and phase controller. | Controlled through `plan`; safe amendment rules apply. | Read the active phase and its cross-cutting dependencies. |
| `plans/{slug}/` | Optional bounded detail files for the active master plan. | Controlled; created only when package triggers apply. | Read only detail files named by the active phase. |
| `documentation-log.md` | Append-only semantic reason and approval ledger for controlled documentation changes. | Append through the initiating workflow. | Not routine context; inspect for provenance. |

Controlled identifiers are `F-NNN`, `US-NNN`, `SPEC-NNN`, `AC-NNN`, `NFR-NNN`, `DEC-NNN`, `MT-NNN`, `IMP-NN`, `PRE-NN`, and `DOC-YYYYMMDD-NNN`. IDs are never reused or renumbered; superseded IDs point to their replacement.

## Operational state and inboxes

| Path | Purpose | Mutation and context |
|---|---|---|
| `pulse.md` | Sole live lifecycle/routing owner plus last recorded implementation/pre-production progress, concise next steps, only the next relevant manual action, operator needs, and session continuity. | Mutable only to repository evidence; read first. It is not history, requirements, or test-procedure authority. |
| `user-notes.md` | Operator inbox for product requests that await `plan` triage. | Agents do not author items; `plan` drains them with an item-to-destination report. |
| `credentials.md` | Environment-aware credential setup status, acquisition guidance, boundary/fallback, real-service validation status/date, and exact blocked unit; created on demand. | Mutable operational state; never store/request secrets or claim setup/fallback as real-service validation. |
| `project/future-ideas.md` | Unapproved product ideas. | On demand; excluded from active scope until the operator approves one. |
| `agent-knowledge/context-memory.md` | Stable invariants and a compact Repo Map. | Update only touched stable facts; not product requirements authority. |

## Evidence and runtime improvement

| Path | Purpose | Normal context |
|---|---|---|
| `model-observations.md` | Structured operator observations about exact model/task performance. | Read or append only through explicit `model-review`; evidence never changes routing automatically. |
| `improve/user-feedback.md` | Optional durable operator report about runtime-rule, workflow, routing, or agent problems. | The operator may write it; read only through explicit `improve`. |
| `improve/system-self-assessment.md` | Concrete current-chat protocol friction conditionally recorded by `end-session`; not a full self-audit. | Read only through explicit `improve`, in the same or a later chat. |

Use `user-notes.md` for “change the product.” For “change how agents work,” invoke `improve` with the current prompt and/or durable improvement entries; manual duplication is unnecessary. `init` does not read these buffers. Canonical-runtime repository proposals belong in its root `to-do-review/`.

## Deferred and historical material

| Path | Meaning | Rule |
|---|---|---|
| `backlog/` | Approved or decided work deliberately deferred and eligible for reactivation. | Opaque during normal discovery. Reactivation requires operator approval and a new or amended active plan. |
| `legacy/` | Completed, superseded, abandoned, or historical material retained for provenance. | Immutable and opaque during normal discovery. Verify against current truth before reuse. |

“Not now, but still wanted” goes to backlog. “No longer active and kept only for provenance” goes to legacy. Do not create parallel `archive/`, `done/`, or `old/` folders.

## Lifecycle and routing

The pulse footer is the sole live routing tuple and records one lifecycle enum plus independent active-plan state:

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

These are verified routing hints. `bootstrap` routes a real new project to `kickstart` and an existing one to `adopt`; `adoption-required` to `adopt`; `adoption-mapped` and `drifted` to `standardize-docs`; `conflicted` to `adopt | operator-decision`; and `standardized` to planning/delivery/none. Explicit workflows recommend but never invoke one another. `Active Plan: none` iff `Plan State: none`; final evidence-backed operator acceptance retires the package and clears both. The plan owns package status/gates; brief/spec/traceability own scope status; the log is historical. Other files link to these owners and must not copy live routing/current status.

Use only the exact stage enum; `implementation` is invalid. An approved plan's explicit audit gate routes `Next Workflow: audit` with `Stage: audit`; draft approval routes `operator-decision` / `docs`. With no active plan, use `plan` / `docs` for approved unfinished work and `none` / `docs` only when no eligible next gate exists. Standardization preserves an approved/executing plan's verified delivery gate instead of closing it as documentation-only.

## Shared documentation mutation protocol

Use the full path for truth/ownership/path changes, lifecycle certification/backfill, plan creation/amendment/supersession, or complete-package retirement:

1. Read the complete controlled file before editing and capture headings, IDs, tables, links, and trailing content.
2. Inventory bounded documentation paths, active package shape, out-of-contract sources, inbox separation, authority, and contradictions without opening backlog/legacy wholesale.
3. Classify changes as additive, refinement, conflict, or supersession; conflicts/supersessions require explicit operator resolution. Preserve unrelated work, sources, IDs, owners, packages, and provenance.
4. Make targeted edits, append one coherent semantic/lifecycle/plan event to `documentation-log.md`, and compare the complete result. At postflight, its event transition must match pulse; remove live routing blocks outside pulse. Report every addition, change, move, and removal; nothing disappears silently.
5. Verify source dispositions, links, zero/one active master, no retired active plan, one owner per fact, stable IDs, trace evidence, provenance, topology, legal routing/stage, and pulse evidence. Repair drift caused by the current workflow before closing.

Use the scoped fast path only for routine already-mapped phase/evidence, manual procedures, pulse, credential rows, and touched Repo Map entries when authority, structure, lifecycle, and plan contract do not change. Read touched files completely, update only landed owned fields, verify keys/IDs/links/pulse, and report wider drift. Persisted blockers/certifications and plan-state events still receive a compact DOC entry; routine operational updates do not.
