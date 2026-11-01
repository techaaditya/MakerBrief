# MakerBrief Engineering Handoff

## Project Overview
**MakerBrief** is a bespoke custom-attire commissioning platform built for the YouCam API Skin AI & eCommerce VTO Hackathon. It makes the critical relationship between a generated visual preview and an actual tailored commission explicit:

$$\text{Buyer preferences} \longrightarrow \text{Garment preview} \longrightarrow \text{Maker detail review} \longrightarrow \text{Production specification} \longrightarrow \text{Formal quote} \longrightarrow \text{Exact-version agreement}$$

## What Was Implemented and Verified
1. **Core Domain & Invariants (`src/domain.mjs`)**:
   - Revisions are immutable and version-sequenced.
   - Optimistic concurrency control via `expected` revision id.
   - Integer minor currency units (`USD`, `NPR`, `INR`, `EUR`, `GBP`).
   - Production discrepancies tracking (`addDiscrepancy`, `resolveDiscrepancy`); unresolved items block buyer agreement.
   - Dynamic agreement computation (`status`); invalidation explanation engine (`explainInvalidation`).
   - Revision difference engine (`diffRevisions`) detailing exact field-by-field changes.

2. **Server Architecture & Role Authorization (`src/server.mjs`)**:
   - Dual-role workspace model: cryptographic `buyerKey` and `makerKey` per workspace.
   - Strict server-side enforcement:
     - Buyers cannot issue quotes, confirm maker feasibility, or submit reviews (403 Forbidden).
     - Makers cannot revise buyer preferences or approve quotes on buyer's behalf (403 Forbidden).
   - Cross-browser collaboration links: `/?ws=<workspaceId>&makerKey=<makerKey>`.
   - Atomic temporary file persistence (`.tmp` + rename) with per-workspace in-memory mutex locks.
   - Security headers (CSP, nosniff, no-referrer) and CSRF Origin matching.

3. **YouCam Clothes V4 Integration (`src/youcam.mjs`)**:
   - Server-side Clothes V4 task creation (`POST /s2s/v2.0/task/cloth-v4`) on `https://yce-api-01.makeupar.com`.
   - Exact operator image host allowlist enforcement (`allowedImage`).
   - Bounded asynchronous polling with error and timeout normalization (`timed_out`, `submission_unknown`, `failed`, `success`).
   - Automatic polling recovery on server reboot.

4. **Atelier Interface & Verification (`public/`)**:
   - Distinct **Buyer Studio** and **Maker Desk** perspectives.
   - Field-level state badges (`Maker Confirmed`, `Requested`, `Discrepancy`, `Measured`).
   - Discrepancy logging and resolution flow.
   - Side-by-side revision comparison showing why prior quotes became outdated.
   - Non-destructive polling: preserves form inputs and focus during background updates.
   - Executive printable commission sheet (`@media print` and Print Brief dialog) with signature blocks.
   - Comprehensive JSON audit trail export.

5. **Test Verification Suite (`tests/`)**:
   - 16 automated tests covering domain rules, HTTP collaboration, provider parsing, and security boundaries. All 16 pass in ~500ms.
   - Node syntax checks (`node --check`) pass on all entrypoints.
   - Visual rendering confirmed via headless browser across desktop (1280px) and mobile (390px) viewports.

## Running the Application
```bash
# 1. Verification checks
npm run check
npm test

# 2. Local development server
cp .env.example .env
npm start
# Opens at http://127.0.0.1:3000
```

## Collaboration Workflow Demonstration
1. Open `http://127.0.0.1:3000` (Buyer Studio).
2. Click **Share Maker Link** or copy the tailor link (`/?ws=...&makerKey=...`) and open in a second browser window / incognito tab.
3. In Maker Desk:
   - Click **Confirm Specification for V1**.
   - Open **+ Log Construction Discrepancy** (e.g. collar pattern difference), then resolve it.
   - Click **Approve Details (Accepted)**.
   - Expand **Issue Initial Quote**, fill lines, and click **Issue Formal Quote for V1**.
4. In Buyer Studio:
   - Notice the status updates to ready.
   - Click **Agree to Quoted Revision V1**. Status turns green: *Fully Agreed Commission*.
5. In Buyer Studio:
   - Change a specification (e.g. trim to *Woven edge*) and click **Save as New Revision (V2)**.
   - Instantly, the alert informs both parties: Quote #1 and prior approvals are outdated. Agreement is revoked.
6. In Maker Desk:
   - Confirm V2, issue a revised quote for V2.
7. In Buyer Studio:
   - Agree to V2.
8. Click **Print Brief** for the formal production sheet, or **Export JSON** for the complete audit log.

## Next Steps for Hackathon Submission
- **Live inference smoke test**: Add a funded `YOUCAM_API_KEY` to `.env`, set `ENABLE_LIVE=true`, and run a live test with a consenting model photo and outerwear reference.
- **Demo video recording**: Follow the 2:40 script in [docs/10-DEMO.md](file:///d:/Downloads/MakerBrief/docs/10-DEMO.md) using the verified collaboration workflow.
- **Devpost Submission**: Use the outline in [docs/12-SUBMISSION.md](file:///d:/Downloads/MakerBrief/docs/12-SUBMISSION.md).
