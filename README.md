# MakerBrief

Personal previews. Human decisions. A runnable custom-attire commissioning prototype and implementation kit prepared for Aaditya.

## Start here

Install Node.js 24 or later. No npm packages or network install are needed.

```bash
cd MakerBrief
cp .env.example .env
npm start
```

Open http://127.0.0.1:3000. On Windows copy `.env.example` to `.env` using Explorer or `Copy-Item .env.example .env` in PowerShell. Run `npm test` and `npm run check` for verification.

Start in Buyer studio. Change a specification and save. Switch to Maker desk, confirm it, write a detail-review note and mark details resolved, then issue a quote. Switch back and agree. Change the specification again: the quote becomes outdated and the agreement no longer applies. Export the entire decision record as JSON.

## What is implemented

Responsive buyer/maker demonstration interface; structured specification revisions; optimistic revision checks; immutable quote history; current-version approvals; unresolved-detail blocking; decision timeline; JSON export; separate cookie-based workspaces; local JSON persistence; deletion/reset; illustrative garment asset; server-side optional YouCam Clothes V4 adapter; durable task IDs; bounded polling; input-host allowlist; local integration tests; container configuration.

## What is not established

The default sample is a vector illustration, not a recorded YouCam response. No real provider transaction was performed while creating this kit. No live image quality, user study, payment, production order or commercial result is claimed. Buyer/maker role switching is a demonstration feature, not role authentication. Do not open live inference to the public before implementing the production controls in docs/08-SECURITY.md.

The live adapter accepts HTTPS image URLs on exact operator-approved hosts. File uploads, authenticated maker collaboration, object storage provisioning and provider-side deletion are future work described in the guides. The current garment category is outerwear. A collar/material option change does not itself synthesize a new garment: provide an actual reference depicting that revision and have the maker review it.

## Reading order

Read docs/00-START-HERE.md, 01-PRODUCT.md, 03-ARCHITECTURE.md, 05-YOUCAM.md and 10-DEMO.md. Follow docs/09-BUILD-ROADMAP.md to turn the working prototype into the final submission. Consult STATUS.md for verification limits and docs/12-SUBMISSION.md for the competition package.

The supplied project code is MIT licensed. Third-party API use, photos, garments and maker content require their own permission. The included SVG is original code-created sample artwork.
