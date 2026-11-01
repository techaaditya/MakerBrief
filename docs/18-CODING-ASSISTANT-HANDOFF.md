# Handoff for continued implementation

Read README.md, STATUS.md and docs/01-PRODUCT.md first. Run npm test and npm run check before making changes. Preserve the core revision and approval invariants. Never mark sample imagery as real inference.

First task: implement authenticated buyer and maker identities and per-workspace authorization, replacing the demonstration role switch. Add tests that one actor cannot approve for another or read another workspace. Use transactional persistence before enabling multiple server instances.

Second task: implement permissioned image upload and private retained results. Attach actual garment references to revisions. Do not assume changing an option label changes the garment image. Verify the exact provider payload against the active account.

Third task: field-level evidence, discrepancy review and printable brief export. Keep all prior approved versions and quotes. New quotes require renewed buyer agreement.

Fourth task: browser verification and maker/buyer evaluation. Record actual outcomes in the evidence register and update STATUS.md. Do not invent screenshots, user quotes, API results or claim broad validation.

Use the supplied tests as a regression baseline, not a complete security audit. Keep setup reproducible. Return a concrete change report with tests, live checks and remaining limitations.
