---
name: improve
description: "Explicit-only runtime feedback diagnosis and one approved canonical release."
disable-model-invocation: true
---
<!-- GENERATED: kind=workflows id=improve source=workflows/improve.md -->

# Improve

This workflow is explicit-only.

Process confirmed runtime-rule, workflow, routing, or agent-behavior problems through one canonical release. Invoke explicitly; it is the only workflow that reads improvement buffers.

## Entry points

1. From an affected project, the operator may write `documentation/improve/user-feedback.md`; `end-session` may append concrete friction to `system-self-assessment.md`. Either durable buffer supports `improve` now or later. A direct current prompt is also valid; manual duplication is unnecessary.
2. From the canonical runtime checkout, use the direct prompt and that checkout as `SourceRepo`; feedback files need no synthetic entry and no project refresh occurs. Both paths use the same canonical prepare/finalize release. `init` never reads improvement buffers.

## Diagnose without mutation

3. Read only the current prompt and both improvement buffers in `SourceRepo`; read model observations only for an authorized routing change. Inventory entries with transient IDs, select exact inputs, preserve all others, and classify cause/solution as shared component, adapter, tooling/budget, operator behavior, or design premise. Rank recurring signatures and operator corrections above one-off friction. Evaluate the premise when a signature recurs, a fix would be a third narrowing, or Juanfra questions the approach. Prefer changes that alter installed-agent behavior over repository machinery, and say when work drifts from that goal.
4. Run `runtime-improve-release.ps1 -Prepare` with exact source repo, caller, selected IDs/direct-prompt scope, components, and summary. Show canonical root/remote/main, versions, dirty paths, consumer hashes, anticipated files, and refresh target.
5. Ask once for approval of the Release ID and scope. Approval covers exact patch identity, generation/version/changelog/hash updates, release gates, commit/push, optional source-project refresh/locks, and selected-feedback cleanup. Prepare is read-only.

## Release after approval

6. Materialize the approved canonical-source patch outside the clean checkout. Use `new:<relative-shared-runtime-source>` for a new catalog source and `governance` for approved root lifecycle changes. When tooling changes, run the release-transaction test against the materialized scratch state before finalize; the live finalizer cannot recursively validate its own replacement.
7. Generate all runtimes in scratch and run fast generation, template, contract, parity, and context-budget checks. For operator-visible behavior or delivery-contract changes, install the candidate into disposable fixtures for Claude, Codex, and Antigravity, then pause before expensive finalization. Give Juanfra exact prompts and expected outcomes for each runtime and wait for his manual confirmation. If the runtime cannot practically be launched until installation, Juanfra may explicitly defer the check: preserve the prompts, record the dated deferral as a separate approval, finalize and install, then make those prompts the first post-install gate. Never represent a deferral as a pass. Do not alter the source project or live consumer runtimes before confirmation or explicit deferral.
8. Run finalize only after required manual confirmation or explicit post-install deferral, with identical prepare inputs, approved Release ID, patch file, SHA-256, and a dated operator-approval list containing the original scope approval plus every later scope/manual approval. Finalize applies only that patch in an isolated worktree, generates, rejects scope drift, validates, versions, classifies the patch as `documentation`, `content`, or `full`, and runs the smallest trustworthy exact-worktree gates. Runtime validation subsumes generation, templates, context budgets, hashes, and boundaries; independent gates run in a bounded parallel batch with individual and wall-clock durations. Only after all gates pass does finalize commit, push canonical `main`, fast-forward the checkout, optionally refresh a distinct source project, and clear selected feedback. Consumer claims cite repository path, branch, commit, and resulting commit or runtime-lock payload hash.
9. If scope changes, prepare again and obtain new approval. Before push, failures retain all feedback. After published release with failed refresh, preserve an annotated operator-feedback entry. `-LocalOnly` runs the same transaction, gates, versions, hashes, and commit metadata without push and records local mode; it is not a bypass.
10. Closeout owns archival. Every consumed artifact—brief, candidate plan, audit, research, review, or confirmed-spent operator drop-in—moves to its legacy location in the same release, and the ledger names what was extracted and what remains. A finished input left in a decision/inbox folder is an incomplete release.
