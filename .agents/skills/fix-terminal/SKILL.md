---
name: fix-terminal
description: "Explicit-only diagnosis and scoped repair of terminal startup, shell profile, path, encoding, or project-toolchain failures."
---
<!-- GENERATED: kind=workflows id=fix-terminal source=workflows/fix-terminal.md -->

# Fix Terminal

This workflow is explicit-only.

Diagnose terminal or toolchain startup failures without broad environment rewrites.

1. Capture the exact command, shell, error, exit code, working directory, and relevant tool versions.
2. Separate shell-profile, PATH, permission, encoding, dependency, project configuration, and external-service causes.
3. Reproduce with the smallest non-destructive command and inspect existing project setup before changing it.
4. Apply the narrowest reversible fix, preserving user profile customizations and secrets.
5. Re-run the failing path and one adjacent sanity check. Report remaining machine- or credential-dependent steps.
6. Do not turn this workflow into product debugging.
