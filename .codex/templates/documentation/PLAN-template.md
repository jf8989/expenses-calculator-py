# PLAN-{slug} — {Title}

> Status: draft | approved | executing | superseded by PLAN-{other}
> Origin: agent | external draft ({source and date})
> Approved: {date once Juanfra approves}
> Package: single file | master with `plans/{slug}/`
>
> STANDARD: this is the one active decision-complete master plan. Executors do not make scope, architecture, behavioral-contract, or acceptance decisions.

## 1. Goal and context

> State what is being built, why, the grounded current state, and every drained `item → destination` mapping.

## 2. Scope traceability

| Scope ID | Owner document | Plan phase | Status |
|---|---|---|---|

## 3. Platform and stack assumptions

> Detected platform, framework, language, pinned dependencies, and exact build/run/check commands.

## 4. Chosen path and rejected alternatives

| Alternative | Why rejected |
|---|---|

## 5. Decision log

| # or DEC-NNN | Decision | Choice | Rationale | Durable owner |
|---|---|---|---|---|

## 6. Assumptions registry

| # | Assumption | If wrong → fallback |
|---|---|---|

## 7. Contracts

### 7.1 Files

| Path | Create / modify / remove | Purpose | Owning phase or detail file |
|---|---|---|---|

### 7.2 Data models

> Exact shapes, types, nullability, defaults, relations, and migration behavior.

### 7.3 Interfaces

> Exact functions, routes, events, CLI commands, returns, validation, and failure behavior.

### 7.4 Naming and conventions

### 7.5 Plan package index

| Detail file | Exclusive ownership | Referenced by phase(s) |
|---|---|---|
| _None — single-file plan._ | | |

## 8. Risks, recovery, and edge cases

| Case | Specified behavior | Covered in | Recovery / rollback when consequential |
|---|---|---|---|

## 9. Credentials and external services

> Use the exact stable key from `credentials.md`. Never include a secret. Credential plumbing is implementation; the value is setup. A real-service check belongs to implementation only when required to prove the feature, otherwise to pre-production. One gate appears in one track.

| Env var / name | Environment | Used for | Exact setup location | Interface / fallback | Setup status | Validation status/date | Blocks IMP/PRE unit |
|---|---|---|---|---|---|---|---|

## 10. Phases

### Phase N — {name}

- **Status:** pending | in progress | implemented | accepted
- **Depends on:** Phase X implementation | Phase X acceptance | none.
- **Capability recommendation (advisory):** capability from model routing.
- **Traceability:** mapped stable scope IDs or `enabling work — {owner}`.
- **Detail files to read:** exact paths or none.
- **Files:** subset of 7.1.
- **Steps:** ordered outline referencing owned contracts.
- **Implementation units:** `IMP-NN` IDs.
- **Pre-production units:** `PRE-NN` IDs, if any.
- **Manual tests:** `MT-NNN` IDs or none; procedures live only in `manual-testing.md`.
- **Acceptance criteria:** binary checks mapped to AC/NFR IDs.
- **Validation evidence required:** test path/name, exact command, reuse basis, or dated manual observed result.

## 11. Implementation progress

> Stable codeable deliverables and agent-run proof. Units are binary and weighted once. Credential-dependent integration proof stays here only when required to prove current behavior.

| Unit | Deliverable / agent-run proof | Owning phase | Weight | Done when |
|---|---|---|---|---|
| IMP-01 | | | 1 | |

## 12. Pre-production readiness

> Stable operator setup, cumulative manual acceptance, staging/deployment, and release-readiness gates not required to prove implementation. Never duplicate an IMP unit.

| Unit | Setup / manual / deployment gate | Owning phase or release | Weight | Done when |
|---|---|---|---|---|
| PRE-01 | | | 1 | |

## 13. Out of scope

## 14. Amendment record

| Date | Classification | Operator request/approval | Added | Changed | Moved | Removed | DOC entry |
|---|---|---|---|---|---|---|---|

## 15. Executor readiness check

- [ ] No unresolved scope, architecture, contract, acceptance, or edge-case decisions.
- [ ] Every touched file and approved scope ID has one owner and phase.
- [ ] Dependencies distinguish prior implementation from prior acceptance.
- [ ] IMP and PRE units cover required work exactly once and use stable weights.
- [ ] Every manual procedure has one stable MT ID and lives only in `manual-testing.md`.
- [ ] Credential rows match `credentials.md`, separate setup from validation, and identify the exact blocked unit.
- [ ] Consequential deployment/migration/destructive work has proportionate recovery.
- [ ] Every criterion names concrete evidence; package ownership is unambiguous.
