# Credentials

Credential setup the agent cannot perform alone. Never store a secret or ask Juanfra to paste one in chat; direct him to the named environment, secret store, file section, or provider page. Missing values block only dependent units while unrelated safe work continues.

## Credentials

| Env var / name | Environment | Used for | Exact setup location | Interface and safe fallback | Setup status | Real-service validation status/date | Exact blocked IMP/PRE unit |
|---|---|---|---|---|---|---|---|
| _None yet._ | | | | | | | |

Setup status:

- `placeholder`: the env reference and safe mock/minimal fallback exist; this is not real-service proof.
- `configured`: Juanfra configured the value outside documentation/chat; validation may still be pending.
- `required`: no safe runnable fallback exists for the dependent unit.

Validation status: `not run | passed | failed | not applicable`, followed by the evidence date when run.

The exact key is stable across this register and the active plan. Credential plumbing/adapters are implementation; the value is setup. If real-service proof is required for the current feature, its validation gate stays in the relevant IMP unit. Staging/deployment-only proof belongs to PRE. Never count one check twice. On first touch of an older customized file, add only missing fields and in-scope rows; preserve all custom guidance and unrelated rows.

## Other Manual Steps

- Add non-secret platform, account, cloud, or deployment setup introduced by planned work and link the owning PRE unit.
