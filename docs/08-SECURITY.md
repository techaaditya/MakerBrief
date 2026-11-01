# Security and privacy before public use

The starter is a local demonstration with simulated roles. The cookie isolates browser workspaces but does not establish a maker's identity. A public live endpoint requires authentication, per-object authorization, per-user rate limits, abuse controls and shared persistent quotas. A persistent single-process live-count ledger survives workspace deletion. It counts submission attempts conservatively; do not reset it casually. Distributed deployments need a transactional shared quota ledger.

Use HTTPS. Set Secure cookies behind correctly configured trusted proxy handling. Add CSRF tokens as defense in depth, validate Host/origin against configured deployment origin and reject requests with invalid session identifiers. Do not trust a role supplied in a request body in production.

Use private object storage. Validate decoded image type, dimensions and size, strip metadata where appropriate, scan uploads as needed, and limit URL fetches to destinations you control. Never fetch arbitrary user URLs or follow redirects into private networks. The starter sends approved image URLs to the provider and does not download their bytes on the server.

Minimize logs. Audit identifiers and state changes; exclude personal images, signed URLs, API headers and raw request payloads. Keep API keys in environment secrets and rotate any exposed key.

Application deletion removes this workspace JSON and clears the browser cookie. It does not delete provider-held resources or user-owned external source images. Active processing blocks reset/delete in the prototype. Implement proper cancellation/deletion reconciliation and retention jobs before a real launch. Do not promise that deleting locally cancels a provider task.

Consent must identify what is sent to YouCam, why, relevant retention behavior and how the user can request deletion. Public demo/photo use needs separate permission. Use adult volunteers for the initial demonstration. Never invent consent or cultural provenance.

Before launch review: authenticated actor boundaries; ownership on each route; safe file serving; secret scan including git history; quotas; JSON body limits; result URL retention; deletion; privacy notice; backup recovery; concurrent updates; provider timeout reconciliation.
