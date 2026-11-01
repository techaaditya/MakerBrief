# Architecture

The archive uses Node's HTTP server and browser-native JavaScript so it runs without dependency installation. This is a deliberate reproducible prototype foundation. You can migrate the UI to React/Next.js while retaining the tested domain module.

`src/domain.mjs` owns specification revisions, quote validation, approval prerequisites and computed status. `src/youcam.mjs` owns provider calls, URL validation and output normalization. `src/server.mjs` owns HTTP routes, session isolation, persistence and polling. `public/app.js` renders the buyer and maker flows.

Each browser receives an unguessable HttpOnly, SameSite cookie. A workspace is stored in a mode-0600 JSON file. Writes use temporary files and rename. This is single-process storage; multiple replicas, shared-network filesystems and horizontal scaling are unsupported. Use a transactional database before scaling.

Provider jobs retain revision, provenance, task ID, state and result. Live jobs also retain consent time and URL hashes; these hashes identify URL strings, not the actual photo bytes. The key stays on the server. The create call is not blindly retried. A timeout becomes submission_unknown. Polling stops locally after a bounded number of attempts. Restart resumes saved running jobs. A startup migration/recovery mechanism is still needed for jobs left in submitting after a crash.

Core invariants are tested independently of the transport. Compute agreement status from the matching revision and latest quote rather than a mutable global approved flag. Use expected revision numbers to reject stale clients. In a database implementation, enforce the checks and write in one transaction.

The sample uses conservative invalidation: every substantive specification edit requires renewed review. A future dependency graph can distinguish notes, material changes, measurement updates and visual changes, but should not weaken correctness silently.
