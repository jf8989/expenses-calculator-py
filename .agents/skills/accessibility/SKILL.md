---
name: accessibility
description: "Accessible interaction, semantics, feedback, focus, contrast, scaling, and assistive-technology verification."
---
<!-- GENERATED: kind=skills id=accessibility source=skills/accessibility.md -->

# Accessibility

Use this skill whenever a change creates or modifies a user-facing interaction.

## Contract

- Prefer native semantics and accessibility APIs over simulated roles or custom focus systems.
- Make every essential action operable with the platform's primary non-pointer input as well as touch or pointer input where relevant.
- Keep focus order predictable and expose visible focus, selection, busy, error, and success states.
- Use explicit labels and instructions. Do not encode meaning through color, position, sound, hover, gesture, or timing alone.
- Maintain readable contrast, text scaling, spacing, and target sizes for the active platform.
- Preserve reduced-motion, high-contrast, screen-reader, and keyboard behavior when polishing visuals.

## Verification

- Exercise the real navigation order and state announcements.
- Test text scaling, contrast, target size, validation recovery, and at least one platform assistive technology when available.
- Treat accessibility regressions as product defects, not optional polish.
