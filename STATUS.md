# Verification and Scope Record

## Automated Test Verification
Verified on Node.js (v22.13.1 / v24 compatible):
- **16 of 16 automated tests pass** (`npm test`) in ~500ms.
- **JavaScript syntax checks pass** (`npm run check`) for server (`src/server.mjs`) and browser (`public/app.js`).
- Test suites cover:
  1. Buyer agreement prerequisites (current quote, maker confirmation, accepted detail review).
  2. Specification change invalidation of agreements and quotes while preserving immutable history.
  3. Quoted revision replacement requiring renewed buyer consent.
  4. Unresolved detail review and production discrepancy revocation of prior agreements.
  5. Stale revision mutation rejection (optimistic concurrency checking).
  6. Duplicate specification detection without redundant revision bumps.
  7. Construction discrepancy blocking and resolution workflow.
  8. Revision diffing (`diffRevisions`) with human-readable change summaries.
  9. Invalidation explanation (`explainInvalidation`) detailing exact blockers.
  10. Garment measurement parsing and dimension boundary constraints.
  11. Currency and integer minor-unit validation across NPR, USD, INR, EUR, and GBP.
  12. Multi-client session isolation, CSRF same-origin blocking, and cross-browser collaboration (`?ws=...&makerKey=...`).
  13. Object-level role authorization: buyers cannot quote or confirm maker feasibility; makers cannot revise buyer brief or accept quotes.
  14. YouCam job normalization, malformed URL rejection, and status tracking.
  15. Image host allowlisting and private network prevention.
  16. Clothes V4 task schema creation and error handling.

## Browser Visual and Interaction Verification
- Headless Microsoft Edge walkthrough executed and verified for:
  - **Desktop viewport (1280x1400)**: Clean two-column atelier layout, visual preview with status chips, agreement verification table, discrepancy tracker, specification form, formal quote breakdown, and decision timeline.
  - **Mobile viewport (390x1200)**: Single-column responsive layout with legible typography, touch-friendly form controls, and wrapping status banners.
  - **Maker Desk**: Role-authenticated view with specification confirmation, discrepancy recording/resolution tools, and structured quotation issuer.
  - **Printable Brief**: Semantic `@media print` stylesheet and dedicated commission sheet generation for bespoke tailor workshops.

## Live YouCam Integration Status
- The server-side adapter for **Clothes V4** (`POST /s2s/v2.0/task/cloth-v4`) is implemented in `src/youcam.mjs` and orchestrated in `src/server.mjs`.
- URL allowlisting, request timeouts, bounded polling (60 attempts over 10 minutes), and restart recovery are active.
- Automated tests verify contract conformance and error recovery against test doubles.
- **Live inference verification completed**: Live inference was successfully executed against the official YouCam Clothes V4 endpoint on `https://yce-api-01.makeupar.com`. A live task was created, polled, and returned `status: success` with a high-fidelity outerwear virtual try-on render. The result was validated and rendered inside the MakerBrief studio canvas with exact revision provenance.

## Architecture and Scope
- Storage: Single-instance JSON persistence with atomic temporary file writes and per-workspace mutex locks.
- Security: Content Security Policy, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, Origin validation, 16KB JSON body limit, and role-token authorization.
- Public deployment: Intended for single-process staging or containers with a persistent data volume mounted to `/app/data`.
