---
name: performance
description: "Measurement-led startup, responsiveness, rendering, I/O, memory, concurrency, caching, and regression control."
---
<!-- GENERATED: kind=skills id=performance source=skills/performance.md -->

# Performance

Use this skill when responsiveness, startup, throughput, rendering, memory, I/O, or resource use matters.

## Method

- Reproduce the user-visible problem and capture a baseline with the platform's real profiler or timing tools.
- Optimize the dominant constraint first. Remove, defer, batch, or bound work before micro-optimizing it.
- Keep interaction-critical work off the main thread or real-time path when the platform provides a safe mechanism.
- Treat caches as state: define ownership, invalidation, bounds, observability, and memory cost.
- Release listeners, handles, subscriptions, scheduled work, and native/GPU resources at the correct lifecycle boundary.
- Bound render resolution and visual complexity to target hardware; pause or reduce hidden and offscreen work.

## Evidence

- Compare the same scenario before and after on representative hardware and data.
- Verify correctness, accessibility, power use, memory, and degraded paths after the change.
- Record the metric, environment, and trade-off; intuition alone is not performance evidence.
