# Deployment and operations

Run locally with npm start. For a private staging server, set HOST and PORT appropriately. A container recipe is included; mount /app/data as writable persistent storage owned by the node user. The archive itself contains no personal workspace state.

The starter uses one process and local files. Do not deploy it to an ephemeral serverless filesystem or several replicas and expect consistent persistence. Use a private long-running container with a persistent volume for staging, or migrate to a transactional database and durable job worker.

Before public live processing, implement the security controls in 08-SECURITY.md. Add a configured public origin, real user roles, secure cookie handling, retention jobs, global quota ledger and monitored provider job reconciliation. Keep runtime keys in the hosting provider's secret store.

Operational checklist: health check GET /; private error logs; job-state metrics without personal payloads; backups and restore test; remaining-unit monitoring; unknown-submission reconciliation; expired-result handling; API downtime message; deletion queue; operator key rotation plan.

Deployment, account setup and live smoke testing were not performed for this kit. Prefer a reliable recorded-real-result sample over a fragile public demo that spends credits on every visit. Never substitute a synthetic illustration for a recorded provider result.
