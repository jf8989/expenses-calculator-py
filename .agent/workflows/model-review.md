---
description: "Explicit-only model/task evidence capture without routing changes."
---
<!-- GENERATED: kind=workflows id=model-review source=workflows/model-review.md -->

# Model Review

This workflow is explicit-only.

Record task-specific operator observations about model performance without changing routing.

1. Run only when explicitly requested. Read `documentation/model-observations.md`.
2. Assign the next immutable `OBS-YYYYMMDD-NNN` ID and record date, project/task, capability, exact model and mode, builder/auditor role, retries, corrections, concrete strengths/failures, repository evidence, and recommendation.
3. Ask the operator only for ratings not already supplied: correctness, instruction adherence, judgment/design quality when applicable, efficiency/value when known, and overall outcome. Mark unknown or not applicable rather than inventing scores.
4. If external comparison was requested or a later routing proposal needs corroboration, prefer primary model documentation and transparent benchmark methodology; cite source and date, separate operator experience from external fact, and label inference.
5. Append one structured observation. Do not edit `model-routing`, plan scope, or product truth. A routing change must be proposed through explicit `improve` with evidence and operator approval.
