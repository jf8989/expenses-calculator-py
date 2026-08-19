---
description: "Explicit-only new-project documentation bootstrap and discovery; establishes project truth without writing product code."
---
<!-- GENERATED: kind=workflows id=kickstart source=workflows/kickstart.md -->

# Kickstart

This workflow is explicit-only.

Use only for a genuinely new project whose product-truth contract is not established.

1. Verify the route from repository evidence, not the stored footer. If substantial pre-existing product truth exists, stop and recommend explicit `adopt`; never force the new-project path or invoke another workflow.
2. Apply the full shared documentation mutation protocol. Verify installer bootstrap files and create only missing allowed templates. Use `ROOT-README-template.md` only when the root README is absent; never overwrite an existing README.
3. Read operator requirements from `user-notes.md` without draining them. Inspect enough real code/configuration to separate facts, proposals, and unknowns.
4. Establish a compact `project-brief.md`: problem, users, goals/non-goals, constraints, architecture summary, and proposed `F`, `US`, and `NFR` rows. Do not approve, infer, or fabricate operator intent.
5. Create only the smallest cohesive proposed specs needed to make stated behavior explicit. Assign stable IDs once; populate traceability with proposed/unplanned rows and create durable decisions only when approved truth exists.
6. Adopt/create the root README entry point and append one coherent `documentation-log.md` create entry for controlled files and lifecycle state changed.
7. Leave product code unchanged and set `Lifecycle State: standardized`, `Active Plan: none`, `Plan State: none`, `State Evidence: <kickstart DOC ID>`, `Next Workflow: plan`, and `Stage: docs`. Recommend explicit `plan`; do not invoke it.
