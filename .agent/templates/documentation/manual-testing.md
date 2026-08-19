# Manual Testing

> Cumulative active operator procedures. Procedures live here; dated observed results live in `traceability.md`; pulse names only the next relevant test.

## Active suite

### MT-001 — {journey name}

- **Status:** active
- **Mapped scope:** `US-NNN`; `AC-NNN`; phase N; `PRE-NN` or `IMP-NN` only when manual observation is the approved proof.
- **Purpose:** what this test proves.
- **Environment:** local | device | staging | production-safe read-only.
- **Setup and fixtures:** exact command, route, account/data state, and non-secret prerequisites.
- **Cleanup:** how to restore safe state.
- **Actions and expected results:**
  1. Action → visible expected result.
- **Safe rejection checks:** invalid/unauthorized action → safe visible result.

## Final consolidated pass

- Run every active MT ID in order before final release acceptance. Record dated observed results in `traceability.md`.

## Superseded procedures

| MT ID | Superseded by | Reason | Date |
|---|---|---|---|
| _None._ | | | |

## Rules

- IDs are stable and never reused. Amend an active procedure when later phases change the same journey; supersede it only when another procedure replaces it.
- Do not duplicate steps in plans, pulse, or traceability. Do not store secrets, production writes without approval, or observed results here.
