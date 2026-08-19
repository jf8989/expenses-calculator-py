---
name: backend
description: "Backend boundaries, API contracts, validation, authorization, concurrency, errors, configuration, and observability."
---
<!-- GENERATED: kind=skills id=backend source=skills/backend.md -->

# Backend

Use this skill for APIs, services, jobs, server-side integrations, and privileged mutations.

## Boundaries and contracts

- Define request, response, error, idempotency, pagination, and versioning behavior before implementation.
- Validate type, length, format, range, and authorization at the trusted server boundary even when the client also validates.
- Return stable machine-readable error codes with safe human messages. Do not expose stack traces, internal paths, secrets, or raw dependency failures.
- Keep authentication separate from authorization and check permissions on every protected operation.

## Reliability

- Make concurrency, retries, timeouts, cancellation, partial failure, and transaction boundaries explicit.
- Use bounded parallelism for independent work and preserve ordering only when the contract requires it.
- Keep configuration behind one validated boundary. Secrets come from the environment or platform secret store.
- Emit enough structured diagnostics to trace failures without logging sensitive payloads.
- Use adapters for external services so missing credentials can fall back to a minimal local implementation without changing the public interface.
