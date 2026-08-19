---
name: platform-routing
description: "Detect and load exactly one web, Android, audio-plugin, or Windows-desktop overlay without guessing the platform."
---
<!-- GENERATED: kind=platform-router id=platform-routing source=platforms/routing.md -->

# Platform Routing

Load the selected overlay from `.claude/platforms/<platform>/PLATFORM.md`.

## Selection contract

1. Inspect real repository markers and the task's stated target.
2. Select one primary overlay: `web`, `android`, `audio-plugin`, or `windows-desktop`.
3. Load a second overlay only when the user explicitly requests multiplatform work that affects both targets.
4. If markers conflict and the active target changes the implementation, ask one concise question. If no marker matches, remain platform-neutral instead of guessing.
5. Load only the domain skills relevant to the work; backend-only work must not load UI guidance merely because the repository has a visual surface.

## Boundaries

- The overlay supplies platform architecture, tooling, validation, accessibility, security, and performance refinements.
- Shared domain skills remain the primary contract. An overlay may specialize them but may not weaken core safety.
- Platform detection and the acceptance gate are automatic; all other workflows remain exclusively explicit.
