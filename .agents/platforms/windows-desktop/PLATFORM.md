---
name: windows-desktop
description: "Windows desktop routing, .NET and WPF boundaries, MVVM, local integration, accessibility, and desktop validation."
---
<!-- GENERATED: kind=platforms id=windows-desktop source=platforms/windows-desktop.md -->

# Windows Desktop Platform Overlay

## Detection

Markers include `.sln`, `.csproj`, `App.xaml`, WPF references, or `UseWPF`. Confirm the desktop target when a solution also contains services or web projects.

## Defaults

- Preserve the existing .NET target, XAML conventions, MVVM boundaries, dependency injection, and packaging model.
- Keep UI-thread work bounded and make cancellation, background work, dispatch, and object lifetime explicit.
- Treat filesystem, registry, process launch, IPC, local secrets, updates, and native interop as security boundaries.
- Verify XAML compilation, bindings, commands, focus, keyboard navigation, scaling, high contrast, window resize, startup, shutdown, and installer/update behavior when relevant.
- Use the solution's existing restore, build, test, analyzer, packaging, and desktop diagnostic paths.

## Typical role and skills

Use `desktop` for implementation plus the relevant shared domain skills.
