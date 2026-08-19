---
name: ui-design
description: "Distinctive, accessible, mobile-first visual systems, responsive layout, interaction states, motion, and design QA."
---
<!-- GENERATED: kind=skills id=ui-design source=skills/ui-design.md -->

# UI Design

Use this skill for screens, components, layouts, styling, interaction states, visual systems, and motion.

## Baseline

- Design the smallest supported viewport first and progressively enhance. Verify around 375px for web/mobile, including safe areas and on-screen keyboards.
- Establish a clear focal point, intentional type scale, purposeful color roles, consistent spacing, and one primary action per view.
- Avoid interchangeable template composition. Every surface should reflect the product's content, audience, and task.
- Design loading, empty, error, success, disabled, selected, focused, and reduced-motion states.
- Use real design tokens and platform primitives. Extend them deliberately instead of scattering one-off values.

## Craft and verification

- Motion explains state or spatial change, remains interruptible, and degrades cleanly under reduced motion.
- Depth, gradients, texture, blur, and glass must reinforce hierarchy and remain readable on target hardware.
- Check contrast, focus, keyboard/touch paths, text scaling, long content, narrow layouts, and both themes when the product supports them.
- Preserve working behavior while polishing; visual ambition does not justify regressions.

## Motion, rendering, and Three.js

- For continuous DOM motion, prefer `transform` and `opacity` as the default because they are normally compositable; they are not universally free, so profile real layers, memory, and target engines.
- Profile any continuous layout or paint work. Avoid massive SMIL loops, animated gradients, and stacked blur layers on mobile; intensive SMIL is high risk, but do not claim every SMIL animation universally runs on the main thread.
- Treat `filter` and `backdrop-filter` as engine- and device-dependent. Verify rather than assuming identical compositing behavior.
- Drive frame-local animation outside React render state. Do not call React state setters every frame.
- In Three.js, cap device-pixel ratio and scene complexity, pause hidden scenes, degrade effects on constrained devices, and honor reduced motion.
- On teardown, cancel RAF callbacks, remove listeners/subscriptions, and dispose geometries, materials, textures, render targets, controls, and renderer/GPU resources.
- Verify with the browser Performance panel, INP or the current interaction metric, memory/layer evidence, and representative target devices.
