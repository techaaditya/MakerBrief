# Data and application API

All application POST routes require JSON and reject a mismatched Origin when supplied. GET /api/state returns the current browser workspace and computed agreement status. It does not authenticate independent actors.

| Route | Purpose | Input |
|---|---|---|
| POST /api/revise | Append specification | expected, spec |
| POST /api/quote | Issue quote | expected, lines, currency, days |
| POST /api/review | Record detail review | expected, verdict, note |
| POST /api/approve | Record demonstration role approval | expected, actor |
| POST /api/preview | Sample or provider preview | expected, mode; live also source, reference, consent |
| POST /api/reset | Start fresh | empty object |
| POST /api/delete | Delete application workspace | empty object |

Example spec: garment Studio jacket, material Cotton twill, collar Stand collar, trim No trim, notes Confirm measurements. The option catalog is fictional and fixed in src/domain.mjs.

Persisted collections: revisions, quotes, approvals, reviews, jobs and events. Revisions and quote history are append-only. A needs_changes review revokes approvals at that revision; the audit event retains the reason. A production database should use explicit revocation records rather than deleting approval objects.

Export is JSON, including history and current computed status. It is not a signed legal contract or a provider certificate. Before sharing an export publicly, remove personal content and temporary result URLs. Add a printable buyer-facing production sheet as a final-product enhancement.
