---
name: audio-plugin
description: "JUCE audio-plugin routing, processor/editor boundaries, real-time safety, state, host validation, and DSP performance."
---
<!-- GENERATED: kind=platforms id=audio-plugin source=platforms/audio-plugin.md -->

# Audio Plugin Platform Overlay

## Detection

Markers include JUCE project or CMake files, `PluginProcessor.*`, `PluginEditor.*`, plugin formats, and host integration targets. Confirm the plugin target when the repository also builds standalone tools.

## Defaults

- Preserve processor/editor separation and the project's parameter/state contract.
- The audio thread must avoid allocation, locks, file or network I/O, UI work, unbounded loops, and unpredictable blocking.
- Pass data between real-time and non-real-time contexts with bounded, ownership-safe mechanisms.
- Treat preset/state parsing, filesystem access, native dependencies, signing, and host-provided data as trust boundaries.
- Validate builds through the existing JUCE/CMake/exporter path and verify automation, state restore, sample-rate/buffer changes, bypass, teardown, and at least one target host.

## Typical role and skills

Use `audio-plugin` for implementation plus performance, testing, security, accessibility, and UI domains as needed.
