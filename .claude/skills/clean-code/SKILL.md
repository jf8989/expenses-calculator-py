---
name: clean-code
description: "Pragmatic naming, structure, error handling, focused functions, safe bulk edits, and behavior-preserving cleanup."
---
<!-- GENERATED: kind=skills id=clean-code source=skills/clean-code.md -->

# Clean Code

Use this skill for implementation and behavior-preserving cleanup.

## Structure

- Give each unit one clear responsibility and one reason to change.
- Prefer guard clauses, low nesting, explicit boundaries, and small composable functions.
- Name functions with verb-noun intent, booleans with `is`/`has`/`can`/`should`, constants clearly, and files after their primary export.
- Extract an abstraction only after repetition or a stable boundary is real. Avoid speculative layers.
- Keep error handling visible; never silently swallow a failure.

## Editing discipline

- Preserve the project's established conventions unless the task explicitly changes them.
- Comments explain why, constraints, or non-obvious trade-offs; they do not narrate code.
- Scope bulk rewrites to syntax-aware or precisely targeted matches. Inspect the diff and run relevant validation afterward.
- Preserve the operator's voice in prose. Remove obvious filler without replacing direct language with generic or inflated copy.
