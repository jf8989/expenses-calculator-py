---
name: frontend
description: "Frontend component boundaries, state, rendering, responsive behavior, accessibility, resilience, and measured delivery."
---
<!-- GENERATED: kind=skills id=frontend source=skills/frontend.md -->

# Frontend

Use this skill for browser or app presentation layers and interactive components.

## Component and state design

- Split components around stable responsibilities and data ownership, not arbitrary line counts.
- Keep state as local as practical. Promote it to URL, shared context, or a store only when lifetime and sharing requirements justify it.
- Model loading, empty, error, success, stale, disabled, and offline states where the product can reach them.
- Preserve server/client, lifecycle, and hydration boundaries defined by the active framework.

## Interaction and delivery

- Start from the smallest supported viewport and enhance upward. Touch targets are at least 44px and hover never gates an action.
- Use semantic controls, deterministic focus, recoverable validation, and resilient layouts under long content and text scaling.
- Remove rendering waterfalls and unnecessary client work before adding memoization or caches.
- Lazy-load only when it improves a measured path without breaking navigation, accessibility, or error recovery.
- Put framework-specific rules in the selected platform overlay rather than assuming React, Next.js, Vue, or a CSS framework.
- Keep per-frame animation data outside framework render state; synchronize only meaningful state transitions back to the UI model.
