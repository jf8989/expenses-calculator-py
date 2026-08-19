# Codex Native Architecture

> Codex-native runtime layer. Use a tiny root `AGENTS.md` for always-on repo policy, `.agents/skills/` for native skills and workflow entrypoints, `.codex/agents/` for explicit custom agents, and `documentation/` as the shared project state.

## Loading Protocol

```text
Request
-> root AGENTS.md (always_on repo policy)
-> ignore `.agent/`
-> discover `.agents/skills/` metadata only
-> load only the skill bodies relevant to the task
-> do not auto-run workflow skills unless the user explicitly asks for one; domain skills, `platform-routing`, and `acceptance-gate` activate automatically when relevant
-> if deeper guidance is needed, read `.codex/ARCHITECTURE.md` and the model-selected rules in `.codex/rules/`
-> optional `.codex/local/operator-profile.md`
-> for repo-grounded work beyond a trivial answer, read `documentation/pulse.md` first
-> read `documentation/user-notes.md` (the operator inbox); create it from template if missing during bootstrap
-> if pulse is recent, same-branch, and has no relevant open items, keep the refresh narrow
-> if pulse is stale, branch-divergent, or lists relevant open items, widen shared-doc reads incrementally
-> if the current chat becomes too broad, recommend a fresh chat and use lightweight `init` there
-> detect active platform from repo markers
-> read matched `.agents/platforms/{platform}/PLATFORM.md` only
-> if explicit specialization is needed, use the matching `.codex/agents/*.toml`
-> load only the project docs needed for the task
```

## Context Discipline

- Never read `.agent/`, `CLAUDE.md`, or `.claude/` during normal Codex startup or task execution; they belong to the other agent runtimes.
- Do not bulk-read `.codex/`, `.agents/skills/`, `documentation/`, or the repository tree.
- `.agents/skills/` is the native runtime surface; `.codex/` is the internal reference layer.
- `documentation/pulse.md` is the preferred first shared-doc read for cheap continuity.
- `documentation/user-notes.md` is mandatory active context for repo-grounded work, even when pulse is clean.
- Workflow skills are explicit user-invoked routines, not automatic startup or chaining behavior.
- If a chat grows beyond one cohesive workstream, recommend a fresh chat instead of carrying the bloated thread forward.
- `.codex/templates/` is copy-only bootstrap material.
- Stop loading context once the current task can be handled safely.

## Runtime Surfaces

- `AGENTS.md`: tiny always-on Codex repo policy.
- `.agents/skills/`: native skills, including workflow entrypoints; workflow skills carry `agents/openai.yaml` metadata with `allow_implicit_invocation: false`.
- `.codex/agents/*.toml`: explicit custom agents for specialized or parallel work.
- `documentation/improve/`: the only live runtime-feedback location shared by all three harnesses; only explicit `improve` reads it.
- `.agents/platforms/`: shared platform overlays.
- `.codex/templates/documentation/`: documentation bootstrap templates.
- `documentation/user-notes.md`: operator inbox for ideas that arrive outside a plan; drained into the active `PLAN-{slug}.md` by `plan` sessions (item → destination reported). Agents never author items; outside `plan`, only one short evidence/comment note per affected item.
- `documentation/pulse.md`: the single status and continuity file for both human and agent (`Done`, `Next Steps`, `Test This`, `Needs From You`, plus the `Stage:` / `Open Notes:` / `Session:` footer), shared with the Claude Code and Antigravity runtimes.
- `documentation/credentials.md`: the Credentials table plus other manual steps; records what the operator must provide without ever blocking implementation.
- `documentation/README.md`: folder map that explains which documentation surfaces are active, historical, project-canonical, review-facing, or agent-runtime support.
- `documentation/legacy/`: completed, superseded, stale, or historical documentation that should not distract from active root docs.
- `documentation/`: shared project state used by Claude, Codex, and Antigravity.

## Custom Agents

Custom agents live under `.codex/agents/*.toml` and are explicit specialist tools, not an automatic routing layer. Platform-specific agents cover web, Android, Windows desktop, and audio plugin work. Shared specialists cover design, security, planning, debugging, testing, and performance; when a platform overlay is active, its refinements apply to their work.

## Workflow Shape

Every workflow is discovered through `.agents/skills/{workflow}/SKILL.md`; the full playbook lives directly in the skill file.

- `init` and `end-session` are the only session workflows; each scales its own depth based on how stale `pulse.md` looks, so there are no separate heavyweight re-entry or closeout workflows.
- `standardize-docs` normalizes `documentation/` shape using the portable README and legacy README templates.
- Pipeline workflows map to the delivery stages recorded in the pulse `Stage:` footer: `kickstart` (new project -> `docs`), `adopt` (legacy repo curation -> `docs`), `plan`, `scaffold` (-> `build (phase 1/M)`), `create` (build phases), `audit` (phase review). All explicit-only.
