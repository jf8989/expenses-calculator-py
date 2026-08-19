---
name: security
description: "Trust boundaries, validation, authorization, least privilege, secrets, safe failures, supply chain, and audit evidence."
---
<!-- GENERATED: kind=skills id=security source=skills/security.md -->

# Security

Use this skill for trust boundaries, identity, permissions, sensitive data, dependencies, and release paths.

## Contract

- Deny by default and grant the least privilege required to users, services, files, devices, processes, and networks.
- Validate input and state transitions at the boundary that owns the invariant.
- Verify authorization for every protected read and mutation; UI or client checks are never the final authority.
- Use established cryptographic and identity libraries. Do not invent security primitives.
- Keep secrets, tokens, signing material, and sensitive payloads out of source, logs, analytics, crash reports, and user-visible bundles.
- Fail closed on missing, expired, malformed, or unverifiable credentials.

## Operations

- Review dependencies, build inputs, update channels, and release signing as part of the threat model.
- Log security-relevant outcomes with correlation data but without raw secrets.
- Validate negative paths and privilege boundaries, not only the happy path.
