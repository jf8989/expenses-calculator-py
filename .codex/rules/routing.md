---
name: routing
description: "Request, platform, role, and skill routing with progressive disclosure."
activation: on-demand
---
<!-- GENERATED: kind=core id=routing source=core/routing.md -->

# Routing Rules

## Request routing

- Questions, explanations, reviews, and diagnoses are read-only unless the user also requests a change. For a simple change, edit directly; for complex work, state the approach briefly and execute within scope.
- Stop loading context once the request can be handled safely.

## Platform, role, and skill routing

- Use `platform-routing` to select one primary `web`, `android`, `audio-plugin`, or `windows-desktop` overlay from real markers and the stated target. Add a second only for explicitly multiplatform work.
- Role selection is not a workflow feature. A bare operator prompt with no workflow — a quick UI fix, a one-off bug, a direct instruction — gets the same role consideration as `create` does. The installed roles are `fullstack`, `planner`, `designer`, `debugger`, `tester`, `security`, `optimizer`, `android`, `audio-plugin`, and `desktop`.
- Use at most one primary implementation or specialist role. Load only the role, relevant automatic domain skills, and selected platform refinements. If delegation is unavailable, the primary agent follows the same role contract.
- A workflow's absence from a harness's auto-listed skills is not evidence that it is missing. Explicit workflows are deliberately kept out of model-invocable listings and stay available by exact name in the installed skills or workflows directory; when the operator names one, load it by that name instead of searching for it or reporting it unavailable.
- Surface active workflow and role vertically as `@Workflow:` and `@Role:` only when that metadata is meaningful. Never emit `none` placeholders; a bare instruction with no explicit workflow is normal.

## Model capability routing

- Consult the installed `model-routing` profile silently on every request. Workflows request a capability—`documentation-specialist`, `architecture-planner`, `fast-scaffolder`, `general-builder`, `ui-builder`, `complex-debugger`, `security-reviewer`, or `independent-auditor`—rather than hardcoding vendors.
- A preferred model existing is not itself a mismatch. When the current model is capable or is an approved fallback, emit no model metadata. When it is clearly outside the requested capability, pause before substantive work, show `@Attention: Current model is a poor fit` and `@Recommended model: <model>`, explain the consequence briefly, and ask Juanfra whether to switch or continue. His choice settles the question for that workflow run.
- Prefer a clean context and, when practical, a different model family from the builder at two boundaries: post-build audit, and final acceptance of a complete plan. A model recalls fewer high-severity defects in its own output than in another model's, so a same-model pass at those boundaries is weaker evidence and must be named as such. Ordinary in-progress gates stay on the current session; switching costs a session and a context reload. Routing changes require evidence and explicit `improve` approval; `model-review` never mutates the profile.
