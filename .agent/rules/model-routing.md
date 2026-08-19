---
trigger: model_decision
description: "Advisory model preference profile."
---
<!-- GENERATED: kind=core id=model-routing source=core/model-routing.md -->

# Model Routing Profile

## Status and evidence label

This is the single operator-controlled model preference profile: advisory, operator-controlled, and non-binding. Agents consult it silently on every request and surface a recommendation only for a clear capability mismatch. The mappings below triangulate three dated research papers commissioned by the operator — `RESEARCH-gpt-2026JUL25.md` (OpenAI/ChatGPT, 2026-07-25), `RESEARCH-gemini-2026JUL25.md` (Google Gemini, 2026-07-25), and `RESEARCH-claude-2026JUL25.md` (Anthropic Claude, 2026-07-25). They are not independently reproduced benchmarks and may become obsolete: provider names, caps, and plan inclusions change frequently and sometimes silently, so treat every plan detail as a 2026-07-25 snapshot. Plan-availability and quota details older than roughly 60 days should be treated as unverified; commission fresh dated research before relying on them for routing changes. Where the papers disagree, the conservative majority read is used and the residual is recorded below.

## Optimization goal

The operator pays for three separate ~$20/month consumer subscriptions (OpenAI/ChatGPT, Google AI Pro, Claude Pro), not API access. Spread load so no single plan exhausts: start at the cheapest capable tier, escalate only on genuine difficulty, and reserve scarce reasoning capacity — GPT 5.6 Sol High, Claude Opus 5 high/xhigh, and Gemini 3.1 Pro extended thinking — for architecture, security review, difficult debugging, and independent audit. Reasoning effort materially affects Anthropic and Google quota consumption; OpenAI has not published a Plus-specific Medium-versus-High meter. Running one top tier for everything is the failure mode this profile exists to prevent.

## Capability profile

| Capability | Preferred models | Fallbacks | Use when |
|---|---|---|---|
| `documentation-specialist` | Gemini 3.6 Flash; Claude Sonnet 5 | Claude Haiku 4.5 when available; Gemini 3.1 Pro for unusually large or difficult synthesis | Creating or adopting substantial product documentation that requires synthesis and editorial judgment. |
| `architecture-planner` | Claude Opus 5; GPT 5.6 Sol High | Gemini 3.1 Pro; Claude Opus 4.8 for compatibility-sensitive work | Resolving architecture, contracts, phase boundaries, migrations, or destructive-change plans. |
| `fast-scaffolder` | Gemini 3.6 Flash; GPT 5.6 Luna (Codex/Work only); Claude Haiku 4.5 when available | Claude Sonnet 5 low; GPT 5.6 Terra (Codex/Work only) | Low-ambiguity structural work where speed and quota efficiency matter. |
| `general-builder` | Claude Sonnet 5; GPT 5.6 Terra (Codex/Work only); Gemini 3.6 Flash | strongest available implementation model | Well-specified regular implementation. |
| `ui-builder` | Gemini 3.6 Flash; Claude Opus 5 medium | GPT 5.6 Sol Medium; Claude Sonnet 5 | UI implementation requiring design judgment; use an independent visual pass when practical. |
| `complex-debugger` | Claude Sonnet 5; GPT 5.6 Sol High; Claude Opus 5 high | Gemini 3.1 Pro as a cross-provider tiebreak | Intermittent, architectural, concurrency, or otherwise difficult failures. |
| `security-reviewer` | GPT 5.6 Sol High; Claude Opus 5 xhigh | Gemini 3.1 Pro; Claude Opus 4.8 for compatibility-sensitive second passes | Security review, sensitive migrations, authorization, or destructive operations. |
| `independent-auditor` | a different provider family than the builder: Gemini 3.1 Pro extended, GPT 5.6 Sol High, or Claude Opus 5 high | Claude Opus 4.8 when compatibility requires it | Post-build review in clean context, from a different model family than the builder whenever practical. |

Localized bugs and small mechanical documentation edits may use a less expensive capable model. A current model listed as preferred or fallback, or otherwise demonstrably capable for the requested boundary, is suitable and produces no recommendation. When it is clearly outside the capability, pause once for Juanfra's choice; after he chooses to continue, preserve the same acceptance contract without repeating the warning.

## Workflow routing

Which capability each explicit workflow requests. The table is checked silently; only a clear mismatch pauses for the operator's choice.

| Workflow | Capability |
|---|---|
| `init`, `check`, `status`, `model-review`, `acceptance-gate` | none — stay on the cheapest capable tier; these are read-only or light |
| `end-session`, `standardize-docs` | `documentation-specialist` |
| `kickstart`, `adopt` | `documentation-specialist`; prefer the large-context tier for an existing corpus |
| `plan` | `architecture-planner` |
| `scaffold` | `fast-scaffolder` |
| `create` | `general-builder`, or `ui-builder` for interface work |
| `fix-terminal` | cheapest capable tier first; escalate to `complex-debugger` only after it stalls |
| `audit` | `independent-auditor`, from a different provider family than the builder |
| `improve` | `architecture-planner` |

Escalate on demonstrated difficulty, not anticipated difficulty. Reserve the most expensive reasoning tiers for `plan`, security review, and independent audit.

## Availability and cost notes (2026-07-25)

- Claude Opus 5 was released on 2026-07-24, supersedes Opus 4.8 as the current Opus tier, and is included on Claude Pro without metered charges. It remains a scarce resource because Anthropic exposes a separate weekly Opus allowance and higher effort consumes limits faster. Opus 4.8 remains available as a compatibility or behavior fallback, not as a cheaper quota lane.
- Fable 5 is not included in the flat Claude Pro allowance as of 2026-07-20; it uses metered usage credits from the first turn. It is therefore excluded from default routing unless the operator explicitly accepts metered spend.
- Claude Sonnet 5 is the included routine Anthropic workhorse. Claude Haiku 4.5 is the latest verified Haiku and the cheapest Anthropic tier, but its presence in the main Claude Pro chat picker was not verified consistently across the papers; use it only where it is actually available.
- GPT 5.6 Terra and Luna are not selectable in standard ChatGPT chat on the $20 Plus plan — they are available in Codex and ChatGPT Work, which share one agentic usage pool. Standard Plus chat exposes GPT 5.6 Sol through Medium and High reasoning; Extra High and Pro are not included there.
- Gemini 3.6 Flash is the current routine Google tier. Gemini 3.1 Pro remains the current released Pro tier and consumes more of AI Pro's dynamic allowance; Deep Think is not on the $20 plan.
- Unresolved disagreement: public OpenAI evidence does not establish whether GPT 5.6 Sol High drains the Plus allowance materially faster than Medium. Business and Enterprise rate cards charge them equally per message, but that does not prove Plus behavior. Treat High as scarce until controlled operator observations or a Plus-specific first-party meter settle it.

## Amendment rule

`model-review` records task-specific operator evidence in `documentation/model-observations.md`. External evidence is optional and must be dated, cited, method-aware, and distinguished from inference. A routing amendment is proposed and approved only through `improve`; one observation never changes this table silently.
