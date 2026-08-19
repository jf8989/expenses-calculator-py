---
name: database
description: "Schema design, constraints, indexes, migrations, transactions, tenancy, integrity, backups, and measured tuning."
---
<!-- GENERATED: kind=skills id=database source=skills/database.md -->

# Database

Use this skill for persistent data models, queries, migrations, and data lifecycle work.

## Design

- Model invariants explicitly with nullability, uniqueness, checks, relationships, and ownership at the database boundary where supported.
- Normalize transactional data first. Denormalize only for a measured access pattern with a documented consistency strategy.
- Choose identifiers, timestamps, retention, deletion, tenancy, and audit behavior deliberately.
- Make every tenant-scoped access path tenant-safe by construction; test cross-tenant denial.

## Change and operations

- Apply schema changes through versioned, repeatable migrations. Use expand-migrate-contract for incompatible renames or type changes.
- Define rollback or forward-recovery behavior before a destructive or long-running migration.
- Use transactions for atomic invariants and idempotency for retryable operations.
- Add indexes from real filter, join, sort, and uniqueness needs; confirm with query plans and production-like data.
- Protect backups, verify restores, and define retention for data that matters.
