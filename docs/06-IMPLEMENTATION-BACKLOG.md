# Prioritized implementation backlog

## P0: credible submitted product

- Run one real YouCam transaction using allowed photos; record the evidence.
- Replace fictional catalog entries with one maker's actual garment records and photographs.
- Attach a reference image to each spec revision, so a new visual claim is tied to the correct reference.
- Add authenticated maker/buyer identities and authorization on every write.
- Implement persistent private input/output assets and deletion semantics.
- Preserve edits during polling; update only job status instead of replacing the whole form.
- Add downloadable production summary with discrepancy notes and maker confirmations.
- Test the workflow with a maker and a buyer; report actual results.

## P1: differentiated depth

- Field-level evidence: requested, illustrated, maker-confirmed, measured or unresolved.
- Version-aware quote expiry, measurement status and unresolved blockers.
- Compare two revisions, highlight changes, and show why each approval became stale.
- Verified catalog option compatibility; unknown means review, not automatic pass.
- Partial quote changes tied to affected components.
- Separate garment, accessory and material-detail reference panels.

## P2: expansion after the central workflow works

Maker storefronts, shared customer reviews, multilingual field labels, optional accessory previews, approved request-parsing assistant, actual inquiry delivery, payments through a suitable provider, order tracking and maker catalog integrations.

Do not add a marketplace, automatic fit assurance, cultural-identity inference, unsupported material physics or invented fidelity certificates to increase apparent scope.

Each task should produce an observable user behavior and a meaningful test. Avoid copying every UI component into unit tests. Protect state transitions, ownership and provider contracts first.
