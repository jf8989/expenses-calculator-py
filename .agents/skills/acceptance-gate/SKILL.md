---
name: acceptance-gate
description: "Verify completion claims against mapped scope, criteria, implementation, and evidence."
---
<!-- GENERATED: kind=workflows id=acceptance-gate source=workflows/acceptance-gate.md -->

# Acceptance Gate

Auto-activate only when work, a note item, phase, or complete active plan is claimed complete, accepted, ready to ship, or ready to close—not for ordinary unfinished progress.

1. Identify the exact claim and mapped trace rows; if ambiguous, gate only the concrete portion presented as done.
2. Require every approved story to map through feature, approved spec/AC, phase, and passing evidence; enabling work maps to NFR, durable decision, or explicit owner.
3. Verify code/config and concrete evidence: test path/name, exact executed command, reuse basis, or dated manual expected/observed result. Reuse evidence only when code, dependencies, configuration, and environment are unchanged. Prose/checkmarks/status are not evidence. A fallback counts only when its spec accepts it.
4. Classify every remaining item as implementation or pre-production. Credential setup is not code. A credential-dependent real-service check remains implementation when required to prove the feature, but setup alone does not pass it; staging/deployment-only validation belongs to pre-production. Never count one gate twice.
5. Return pass/partial/fail per row in detailed evidence, but never present `partial` alone. Tell Juanfra what is complete, what remains, whether autonomous work can continue, and the exact next action. Do not call a scope done, ready, or needing nothing while a required gate remains.
6. For operator experience, use the relevant active `MT-NNN` procedures from `manual-testing.md`; do not invent a parallel checklist. Record dated observed pass/fail in traceability. Investigate a failed boundary first and open a mapped repair unit when code changes are needed. Skip manual checks that add no decision value.
7. With operator confirmation, clear a verified note or mark a phase accepted and update landed pulse/trace truth through the scoped path. An implementation-complete phase may still have pre-production work; represent both honestly.
8. When the complete plan has passing implementation and pre-production evidence and Juanfra confirms final acceptance, use the full documentation path: mark scope accepted; move the complete package to `documentation/legacy/plans/{slug}/`; update indexes; append one `retire` DOC entry; clear active-plan fields; leave lifecycle standardized; and route to `plan | none` only when approved unfinished work remains. Never retire from prose or 100% implementation alone.
9. At a milestone or final-acceptance boundary, prefer fresh context and, when practical, a different model family from the producer. If the same model gates its own final claim, say so and treat it as weaker evidence. Ordinary in-progress gates rely on deterministic evidence and do not require a session switch.
