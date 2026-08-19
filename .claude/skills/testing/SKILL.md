---
name: testing
description: "Risk-based manual and automated verification across unit, integration, system, regression, and failure paths."
---
<!-- GENERATED: kind=skills id=testing source=skills/testing.md -->

# Testing

Use this skill to choose and execute verification proportional to risk.

## Strategy

- Start with the observable contract, highest-risk failure modes, and cheapest evidence that can disprove correctness.
- Classify changed surfaces before selecting checks. Prefer focused automation after ordinary implementation; use full regression for material security/architecture changes, milestones, releases, cross-cutting dependencies, or invalidated evidence.
- Reuse fresh passing evidence only when covered code, dependencies, configuration, and environment are unchanged; record why it still applies.
- Favor unit tests for pure invariants, integration tests for owned boundaries, and a small number of system tests for critical journeys. Arrange, act, and assert one behavior; cover errors, empty inputs, boundaries, permissions, retries, and state transitions.
- Wrap external systems behind owned interfaces; fake the boundary, not third-party internals. When a real credential is required to prove current behavior, setup does not count as passing: run the mapped safe integration check after configuration.

## Manual suite

- Use manual verification when visible experience or assistive technology is decisive, not as ceremony.
- Maintain one cumulative `documentation/manual-testing.md` suite with stable `MT-NNN` IDs. Each procedure defines purpose, mapped scope/phase, setup and fixtures, cleanup, ordered actions, visible expected results, and one or two important safe rejections.
- Each phase adds, amends, or supersedes affected procedures. Supersession retains the old ID and replacement pointer so the active final suite has no duplicate or obsolete journeys.
- Plans reference MT IDs instead of copying steps. Traceability owns dated observed pass/fail evidence. Pulse owns only the next relevant manual action.
- At release, run the consolidated active suite. Accept natural-language pass/fail and investigate the failed boundary first.

## Quality and reporting

- Use stable selectors, clocks, data, and isolation. Fix flaky-test root causes or quarantine explicitly. Coverage indicates execution, not correctness.
- Record durations when material or recurring so verification cost can be optimized.
- A closeout distinguishes implementation evidence from pre-production readiness. Failed manual or deployment evidence blocks readiness and opens repair when needed; it does not automatically erase landed implementation.
