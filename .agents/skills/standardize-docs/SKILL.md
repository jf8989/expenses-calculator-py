---
name: standardize-docs
description: "Explicit-only normalization of documentation ownership, lifecycle, IDs, and links."
---
<!-- GENERATED: kind=workflows id=standardize-docs source=workflows/standardize-docs.md -->

# Standardize Docs

This workflow is explicit-only.

Certify/repair documentation structure without rewriting product meaning. Apply the full shared documentation mutation protocol; do not implement product code or invoke another workflow.

## Post-adoption mode

Use when `Lifecycle State: adoption-mapped`.

1. Read the exact adoption DOC entry named by `State Evidence`. If missing/dangling, use a manifest only when exactly one valid current adoption record is unambiguous; otherwise recommend `adopt | operator-decision` without certifying.
2. Treat its semantic disposition and approved `Remaining structural action` rows as authority; do not ask again. Request approval only for newly discovered/changed source-to-destination actions and log the delta without reopening accepted meaning.
3. Verify every source reached its approved owner/destination. Normalize remaining paths, ownership indexes, links, IDs, backlog metadata, legacy provenance, Repo Map, and complete plan-package placement. Do not rescan code/tests/schema wholesale unless a contradiction needs evidence.
4. If already conformant, make no artificial controlled-file rewrite; record an evidence-backed no-op certification.

## Drift-repair mode

Use for previously adopted structural drift.

5. Inventory controlled/operational root surfaces; backlog/legacy remain opaque except exact in-scope items. Detect duplicates, missing owners, unstable IDs, stale/retired active plans, misplaced history/deferred work, broken links, and out-of-contract files.
6. Preserve exact mapping approval, complete pre-edit structure, safe amendment, source/package preservation, metadata, provenance, IDs, trace links, pulse, Repo Map, and full added/changed/moved/removed reporting.
7. Never reinterpret implemented versus intended truth. Route a grounded semantic contradiction to `adopt`. If structure cannot be certified, persist `drifted` with one compact `block` DOC entry and concrete pulse discrepancy.

## Certification

8. Verify every disposition, controlled link, one active master/package, one authority per fact, stable IDs, trace references, provenance, topology, status label, and pulse evidence. Reject stale `proposed` mirrors for approved scope and any non-contract stage such as `implementation`.
9. Append one `certify` DOC entry even for a no-op, with `### Certification` rows `Check | Result | Evidence or action`; its final routing claim must exactly match pulse and every current-state mirror at postflight.
10. On success set `Lifecycle State: standardized` and `State Evidence: <certification DOC ID>`. Preserve a verified approved/executing plan's explicit eligible delivery gate and legal stage (`audit` / `audit` for an audit gate). A draft awaiting approval uses `operator-decision` / `docs`; with no active plan use `plan` / `docs` for approved unfinished work, otherwise `none` / `docs`. If an active plan has no unambiguous eligible gate, route `plan` / `docs` for plan repair. Recommend that one workflow without invoking it.
