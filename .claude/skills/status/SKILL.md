---
name: status
description: "Explicit-only read-only inventory of approved scope against implementation, including code that traces to no scope."
disable-model-invocation: true
---
<!-- GENERATED: kind=workflows id=status source=workflows/status.md -->

# Status

This workflow is explicit-only.

Report approved scope against implementation, read-only and without a verdict. Invoke explicitly; this is an inventory, not an audit.

1. Read `pulse.md`, `traceability.md`, the active plan's phase table, and the brief's feature/story/NFR registries. Open a spec only when a mapped row's evidence state cannot be resolved without it. Do not read `backlog/`, `legacy/`, improvement buffers, or model observations; do not re-derive product truth; do not run checks or re-execute evidence. On a repository without standardized documentation, report which registries are missing or unreconciled and stop.
2. Place every approved row in exactly one section, from its recorded evidence state rather than status prose, a footer, a percentage, or a commit message. `Done` — mapped to an active or completed phase and holding passing evidence. `Documented but unbuilt` — approved scope with no mapped phase, no implementation, or evidence that is missing, stale, or failing; state which condition applies. `Unclear` — documentation alone cannot decide; name the one artifact that would settle it and stop there.
3. Add a fourth section, `Built but untraced`: implemented surfaces mapping to no approved row. Inventory at module, route, or entry-point granularity and state the bound used. Exclude generated, vendored, cache, and build-output files. Give each entry a path and one factual sentence. Untraced means unmapped — never defective, dead, removable, or wrong — and no ID, spec, or row is proposed or written.
4. Report the exact evidence behind each `Done` row and the exact missing artifact behind every other row. Open `Done` with a `Snapshot` row naming the inspected branch or commit, the active plan, and the traceability file. Open `Built but untraced` with a `Coverage` row naming the surfaces inspected and the exclusions applied; this is best-effort reconciliation, not proof that no other untraced behavior exists. Use `None found` for an empty section and state access or mapping uncertainty locally.
5. Carry no severity, priority, verdict, pass/fail, score, or fix recommendation, and open no findings register. An entry is not a finding: it does not reopen an audit-closed phase, does not satisfy or fail an acceptance gate, and is not evidence for `acceptance-gate`, `audit`, or any completion claim.
6. Mutate nothing and recommend no next workflow. `pulse.md` owns live routing and only a workflow that changed lifecycle state may move it; report a routing-relevant discrepancy as a fact and leave the decision to the operator. Write no file, footer, or log entry; report in chat and persist only to a path the operator names.
7. Keep the sweep unbounded in scope but cheap in cost: registries and evidence states first, repository files only for section three, one line per entry, closing with a count per section.
