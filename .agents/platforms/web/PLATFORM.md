---
name: web
description: "Web routing, client/server boundaries, responsive interaction, browser validation, delivery, and performance defaults."
---
<!-- GENERATED: kind=platforms id=web source=platforms/web.md -->

# Web Platform Overlay

## Detection

Markers include `package.json`, web route or public asset directories, and framework configuration such as `next.config.*` or `vite.config.*`. Do not classify a repository as web from a lockfile alone when another primary platform owns it.

## Defaults

- Preserve the framework's real server/client, routing, rendering, hydration, asset, and deployment boundaries.
- Start UI at the smallest viewport, use semantic browser controls, and test keyboard, touch, text scaling, long content, and reduced motion.
- Validate protected reads and mutations on the server. Treat browser state as untrusted.
- Prefer the project's package manager and existing lint, type, test, build, audit, and browser paths.
- Measure Core Web Vitals and interaction bottlenecks on representative devices before performance rewrites.

## Typical role and skills

Use `fullstack` for implementation and the relevant shared domains from `frontend`, `backend`, `database`, `ui-design`, `accessibility`, `security`, `testing`, and `performance`.
