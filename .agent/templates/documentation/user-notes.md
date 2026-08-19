# User Notes — Operator Inbox

Product requirements and ideas belong here. Feedback about how Claude, Codex, or Antigravity work belongs in `documentation/improve/user-feedback.md`, not in this inbox. Proposals about the canonical runtime repository itself belong in that repository's root `to-do-review/`, not in an installed project's notes.

This file belongs to the operator. Drop new ideas, requests, and corrections here whenever they occur to you — before the first plan exists, this is where initial requirements land; after a plan is approved, this is where post-plan ideas land. It is an inbox, not a work queue: committed work and its status live in the active `PLAN-{slug}.md`.

How it flows: agents read this file during `init` and `end-session` and drain it during `plan` sessions — each approved item receives or maps to stable `F-NNN`, `US-NNN`, `SPEC-NNN`, `AC-NNN`, `NFR-NNN`, or `DEC-NNN` ownership and an active phase; an unapproved idea moves to `project/future-ideas.md`. The item is removed only after migration, with every `item → destination` mapping reported in chat. Agents never author items here; outside `plan` they may only append one short evidence/comment note under an item their session affected.

Numbering rule (for the operator): add new items at the END with the next number; never renumber existing items. Numbers stay stable until the item is migrated.

Inbox starts below:

---

## Inbox

(empty — add items below this line)
