# Antigravity Native Architecture

> Antigravity IDE runtime layer. The always-on core is the shared root `AGENTS.md`. Skills and platform overlays live in `.agents/` (shared byte-for-byte with Codex). Runtime-private rules, workflows, agents, and templates live in `.agent/`. Load context progressively, not all at once.

## Loading Protocol

```text
Request
-> root AGENTS.md (always_on shared core contract)
-> .agent/rules/routing.md, delivery.md, and response.md when selected by the model
-> .agent/rules/documentation.md for documentation/**
-> required .agent/local/operator-profile.md
-> if the `documentation/` scaffold is missing, create only the safe bootstrap files from `.agent/templates/documentation/`
-> ignore `.agent/templates/` unless bootstrapping docs or editing templates
-> ignore `.codex/`, `CLAUDE.md`, and `.claude/`; they belong to the other agent runtimes
-> detect the active platform from repo markers (`platform-routing` skill)
-> read the matched .agents/platforms/{platform}/PLATFORM.md only
-> explicitly invoked workflow only, from .agent/workflows/
-> route to one agent from .agent/agents/ only when specialization adds value
-> load only that agent's declared shared skills from .agents/skills/
-> load only the project memory/docs needed for the current task
```

## Context Discipline

- Never bulk-read `.agent/`, `.agents/`, `documentation/`, or the repository tree "just in case".
- Treat `.agent/templates/` as copy-only material. Use it only for documentation bootstrap or template work.
- Ignore `.codex/`, `CLAUDE.md`, and `.claude/` during normal Antigravity loading and routing; they belong to the other agent runtimes. The root `AGENTS.md`, `.agents/skills/`, and `.agents/platforms/` are shared surfaces that Antigravity does load.
- Do not preload all workflows, all agents, all skills, all platform overlays, or all session logs.
- Read only files on the active decision path for the current request.
- Prefer reading only the relevant sections of a file when the format allows it.
- Stop loading new context once the current task can be handled safely.

## Runtime Surfaces

- `AGENTS.md`: always-on core contract, shared byte-for-byte with Codex.
- `.agents/skills/`: shared skill inventory — the automatic domain skills, the automatic `platform-routing` and `acceptance-gate` skills, and the explicit workflow skills. Workflow skills carry `agents/openai.yaml` metadata with `allow_implicit_invocation: false`.
- `.agents/platforms/{platform}/PLATFORM.md`: shared platform overlays.
- `.agent/rules/`: private rule surfaces — `routing.md`, `delivery.md`, and `response.md` are model-selected; `documentation.md` applies to `documentation/**`. Each rule file stays under 12,000 characters.
- `.agent/workflows/`: native explicit workflow entrypoints (one file per explicit workflow).
- `.agent/agents/*.md`: private role definitions.
- `.agent/local/operator-profile.md`: required repo-local operator preferences; generated from the catalog source `core/operator-profile.md`, so edit the canonical source instead of this file.
- `.agent/templates/documentation/`: copy-only documentation bootstrap templates.
- `documentation/`: shared project state used by Claude, Codex, and Antigravity; `documentation/agent-knowledge/` is project memory, not platform memory.

## Platforms (4)

| Platform | Default Stack | Typical Markers |
|----------|---------------|-----------------|
| `web` | Current web stack | `package.json`, `src/app`, `public`, `next.config.*`, `vite.config.*` |
| `android` | Kotlin + Jetpack Compose + MVVM | `settings.gradle(.kts)`, `build.gradle(.kts)`, `AndroidManifest.xml` |
| `windows-desktop` | C#/.NET + WPF + MVVM | `*.sln`, `*.csproj`, `App.xaml`, `UseWPF` |
| `audio-plugin` | JUCE + C++ + VST3-first | `.jucer`, JUCE CMake files, `PluginProcessor.cpp`, `PluginEditor.cpp` |

- Platform overlays live under `.agents/platforms/{platform}/` and own detection guidance, architecture defaults, and validation, accessibility, security, and performance refinements.
- Select one primary overlay from real markers. If markers conflict and the choice changes the implementation, ask one concise question; if no marker matches, remain platform-neutral instead of guessing.
- Shared domain skills remain the primary contract. An overlay may specialize them but may not weaken core safety.

## Agents (10)

| Agent | Role | Scope |
|-------|------|-------|
| `fullstack` | Web implementation | Web only |
| `android` | Android implementation | Android only |
| `desktop` | Windows desktop implementation | Windows desktop only |
| `audio-plugin` | Audio plugin implementation | Audio plugin only |
| `designer` | UI/UX design | Shared |
| `security` | Security auditing | Shared |
| `planner` | Planning | Shared |
| `debugger` | Debugging | Shared |
| `tester` | Testing | Shared |
| `optimizer` | Performance | Shared |

Each agent declares its shared skills in frontmatter; implementation agents also declare their platform. When an active platform overlay is loaded, its refinements apply to the agent's work. If native subagent support is unavailable, the primary agent follows the same role contract.

## Skills (shared, in `.agents/skills/`)

| Skill | Knowledge Domain |
|-------|------------------|
| `clean-code` | Coding standards, naming, function rules |
| `ui-design` | Cross-platform design foundations |
| `accessibility` | Cross-platform accessibility foundations |
| `security` | Cross-platform security foundations |
| `testing` | Cross-platform test strategy |
| `performance` | Cross-platform performance foundations |
| `frontend` | Web UI implementation |
| `backend` | Web/server implementation |
| `database` | Data layer implementation |

Domain skills activate automatically when relevant. `platform-routing` and `acceptance-gate` are also automatic skills, not explicit workflows.

## Response Declaration

- Name an active workflow or specialized role in one short opening line.
- Skip the declaration when no workflow or role is active.
- Do not enumerate loaded skills or adapters.

## Workflows (explicit, in `.agent/workflows/`)

| Command | Purpose |
|---------|---------|
| `kickstart` | Bootstrap docs and standards for a new project (pipeline step 1); ends at `Stage: docs` |
| `adopt` | Interactively cure a legacy repo (old docs, huge user-notes) into the runtime system |
| `init` | Detect the platform, load context, report stage + inbox items awaiting triage + discrepancies |
| `plan` | Create a scoped decision-complete plan and drain the operator inbox |
| `scaffold` | Turn the approved plan into structure, configs, and stubs; ends at `Stage: build (phase 1/M)` |
| `create` | Implement the active approved phase using the active platform overlay |
| `check` | Run the repository's real validation with platform-specific checks |
| `audit` | Read-only phase review against the plan; findings to chat, actionables to pulse |
| `standardize-docs` | Normalize the `documentation/` tree shape (active vs legacy) |
| `end-session` | Sync docs and pulse footer (Stage / Open Notes / Session), record evidence-based friction, close cleanly |
| `improve` | User-triggered canonical runtime release from shared feedback |
| `fix-terminal` | Diagnose startup or toolchain failures for the active platform |

These workflows are explicit-only; never chain or infer one from another. The `acceptance-gate` skill activates automatically when work or a phase is claimed complete. Pipeline position lives in the pulse footer `Stage:` line (`kickoff`, `docs`, `scaffold`, `build (phase N/M)`, `audit`, `ui-polish`, `done`, `maintenance`).
