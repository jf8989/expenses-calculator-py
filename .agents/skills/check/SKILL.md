---
name: check
description: "Explicit-only validation using the repository's real lint, types, tests, build, security, and platform-specific checks."
---
<!-- GENERATED: kind=workflows id=check source=workflows/check.md -->

# Check

This workflow is explicit-only.

Validate read-only without changing product scope or documentation state.

1. Detect platform/actual commands and identify the claim/phase plus mapped spec/AC/NFR trace rows.
2. Run the smallest useful formatting, lint, types, tests, build, dependency/security, and platform diagnostics.
3. Map evidence per required criterion. Report structural drift as requiring `standardize-docs` and semantic contradiction as requiring `adopt`; do not repair, mutate footer/log, invent scope, rewrite specs, or create tests/CI/fixes unless explicitly requested.
4. Distinguish placeholder/fallback checks from real external-service validation. Report every command/result, mapped ID, actionable failure, skipped check, credential/operator step, and manual expected/observed check; status prose is not evidence.
