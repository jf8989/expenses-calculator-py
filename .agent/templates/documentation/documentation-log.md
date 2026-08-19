# Documentation Change Log

> Append-only semantic audit trail for controlled truth and evidence-backed lifecycle/active-plan events. Git owns exact line history and author identity; the log does not log its own row recursively. Routine phase evidence, pulse stage/notes/session, credentials, and Repo Map updates do not create log noise.

## DOC-YYYYMMDD-001

- **Timestamp:** YYYY-MM-DD HH:mm Z
- **Workflow:** kickstart | adopt | plan | standardize-docs | scaffold | create | acceptance-gate | operator-authorized scoped edit
- **Operation:** create | adopt | amend | supersede | retire | reactivate | block | certify | approve | begin-execution
- **Operator request / approval and reason:**
- **Lifecycle / plan transition:** previous → next, or none
- **Files changed:**
- **Affected IDs:** F / US / SPEC / AC / NFR / DEC, or none
- **Move or supersession:** source → destination, or none
- **Validation:**
- **Git commit:** pending | hash

Use one compact entry for every persisted blocking/certification lifecycle event, active-plan/plan-state transition, draft planning-authority revision, or approved amendment/supersession. `State Evidence` points to the newest such DOC entry.

### Disposition manifest

> Required in an adoption handoff; include every inventoried source.

| Source | Evidence and semantic state | Approved disposition | Authority or destination | Remaining structural action |
|---|---|---|---|---|

### Certification

> Required in a standardization certification, including an evidence-backed no-op.

| Check | Result | Evidence or action |
|---|---|---|
