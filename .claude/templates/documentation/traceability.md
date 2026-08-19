# Traceability Matrix

> Relationship and observed-evidence registry. Behavioral truth belongs in specs; implementation control and progress units belong in the active plan; manual procedures belong in `manual-testing.md`.

| Story / enabling owner | Feature | Specification | Acceptance criterion | Plan phase | IMP/PRE unit | Validation evidence | Status |
|---|---|---|---|---|---|---|---|
| US-001 | F-001 | SPEC-001 | AC-001 | unplanned | — | — | proposed |

## Rules

- Every approved story maps to one feature, at least one approved spec/AC, a phase, and exactly one relevant progress unit per required gate.
- Infrastructure maps to `NFR-NNN`, `DEC-NNN`, or an explicit enabling-work owner.
- Evidence is an automated test path/name, executed command, reuse basis, or `MT-NNN` with date and observed pass/fail. Never copy the manual procedure here.
- A phase or claim cannot be accepted while a mapped required row lacks passing evidence. Credential setup alone is not real-service evidence.
- IDs are never reused or renumbered. Superseded IDs remain visible with replacement pointers.
