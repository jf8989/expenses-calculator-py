---
name: android
description: "Android routing, Kotlin and Compose boundaries, lifecycle, device behavior, Gradle validation, and performance defaults."
---
<!-- GENERATED: kind=platforms id=android source=platforms/android.md -->

# Android Platform Overlay

## Detection

Markers include Gradle settings/build files, Android modules, and `AndroidManifest.xml`. Confirm the active Android module when the repository also contains server or web projects.

## Defaults

- Prefer Kotlin, Compose, lifecycle-aware state ownership, unidirectional data flow, and explicit repository/service boundaries when the project already uses them.
- Keep configuration changes compatible with the existing Gradle catalog, plugin, SDK, and module structure.
- Treat permissions, exported components, intents, deep links, storage, and background execution as security boundaries.
- Verify recomposition, main-thread work, state restoration, rotation, process recreation, offline behavior, TalkBack, focus, text scaling, and touch targets.
- Use the project's Gradle wrapper for lint, tests, and builds; distinguish emulator and physical-device checks still required.

## Typical role and skills

Use `android` for implementation plus the relevant shared domain skills.
