---
name: init
description: "Explicit-only session orientation from pulse, operator notes, the active plan, repository evidence, and one platform overlay."
---
<!-- GENERATED: kind=workflows id=init source=workflows/init.md -->

# Init

This workflow is explicit-only.

Orient with minimum context, no mutations, and exactly one evidence-backed next-workflow recommendation.

0. Query the local system clock through available runtime/tool context; never infer missing precision. Make `Init time: <weekday>, <month> <day>, <year>, <local time including seconds> (<local time zone>, UTC±HH:MM)` the first line of the init report. A required skill-activation announcement may precede it; no other preamble may precede the `Init time:` line. If unavailable, use `Init time: unavailable (<reason>)`.
1. Read `pulse.md`, then `user-notes.md`, index, relevant brief rows, and only the active phase plus linked detail/spec/decision/trace/manual-test rows.
2. Verify lifecycle, active-plan fields, branch, and relevant repository state with lightweight evidence; treat pulse as a hint. Run platform routing and load only one overlay plus relevant domain guidance.
3. Report stage, landed scope, next step, operator needs, missing trace links, and each inbox item awaiting `plan` triage. Report current credential setup and failed/not-run validation rows without exposing/requesting secrets; direct setup to the documented mechanism.
4. Surface discrepancies without repairing or mutating footer/log. Recommend exactly one eligible workflow from lifecycle and the active plan. `none` is routing vocabulary, not proof the project is finished; translate it plainly.
5. Close with this fixed debrief and nothing after it:
   - `Implementation: NN% (phase NN%; recorded <date>, <workflow>)`, copied from pulse, or `Implementation: not recorded yet`.
   - `Pre-production: NN% (recorded <date>, <workflow>)`, copied from pulse, or `Pre-production: not recorded yet`.
   - `Finished: no — <one sentence naming what remains>`, or `Finished: yes` only when both tracks and all required gates pass.
   - `Open gates:` one line per remaining credential, real-service, deployment, manual, or owner input, naming its exact key, MT ID, or artifact; `none` when none remain.
   - `Next: <workflow>`, plus one plain sentence when no workflow is eligible.
   - `Need from you:` only the exact input blocking the critical path now; otherwise `Nothing right now.`
   Keep the report human, brief, and grounded. Use an analogy only when it materially helps Juanfra understand a complex state. Do not enumerate loaded skills/files or explain the runtime.
6. Never invoke the recommendation or read backlog/legacy unless an explicit workflow or active link names exact content. Init is not feedback transport; route runtime problems to explicit `improve`.
