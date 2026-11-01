# Devpost Submission Package: MakerBrief

*Copy and paste these sections directly into your Devpost submission form at [youcam-api-skin-ai-ecommerce.devpost.com](https://youcam-api-skin-ai-ecommerce.devpost.com/).*

---

## 1. Project Title
**MakerBrief**

---

## 2. Tagline / Elevator Pitch
*Personal AI previews meet human decisions. An auditable bespoke tailoring platform connecting YouCam virtual try-ons to maker-confirmed specifications, binding quotes, and exact-version agreements.*

---

## 3. Project Description (Devpost Markdown)

### 💡 Inspiration
Virtual try-on (VTO) is revolutionizing online shopping, but in custom tailoring and bespoke attire, a generated preview is **not** an actual commission. An AI try-on cannot prove physical fit, fabric drape, pattern construction feasibility, structural seam allowance, or cultural authenticity. 

When remote buyers send AI-generated inspiration images to tailors or ateliers, makers are often left guessing about fabric weight, closures, lining, and pattern feasibility. Discrepancies between what the customer saw on screen and what the tailor constructed lead to costly disputes and wasted fabric.

We built **MakerBrief** to make the relationship between a generated preview and an actual commission explicit:
$$\text{Buyer preferences} \longrightarrow \text{Personal VTO Preview} \longrightarrow \text{Tailor detail review} \longrightarrow \text{Production specification} \longrightarrow \text{Formal quote} \longrightarrow \text{Exact-version agreement}$$

---

### ✨ What It Does

MakerBrief connects remote buyers and independent custom attire makers through an auditable, collaborative commissioning studio:

1. **Buyer Specification & Live VTO**:
   - The buyer selects a garment category, fabric type, collar, and trim, provides personal body measurements (chest, shoulders, sleeves, length), and uploads a portrait.
   - Using **YouCam Clothes V4**, MakerBrief generates a high-fidelity virtual try-on preview.
   - The preview is labeled with explicit atelier warnings: it represents visual aesthetic intent, not physical pattern construction.

2. **Tailor Review Desk (`/?ws=<id>&makerKey=<key>`)**:
   - The buyer shares a secure tailor review link with their maker.
   - The tailor confirms structural feasibility, inspects the buyer's measurements, and logs **Construction Discrepancies** (e.g. *"Generated preview shows wide open lapel; physical sample requires a traditional 3.5cm banded stand collar"*).
   - Any unresolved physical discrepancy **strictly blocks** final buyer agreement until resolved.

3. **Binding Quotation & Exact-Version Locking**:
   - The tailor issues an itemized quote (materials, craft/labor, trims) with lead time, currency units, and deposit terms.
   - The buyer reviews the quote and approves the exact revision. Once agreed, the brief is locked into a **✓ Fully Agreed Commission**.

4. **Automatic Invalidation on Specification Changes (The Core Demo)**:
   - If the buyer changes a detail later (e.g. collar or trim to *Woven edge* in V2), the system immediately revokes prior approvals.
   - An intelligent invalidation engine explains the exact blockers: *"Quote #1 was issued for V1 and is outdated for V2. Maker confirmation and a revised quote are required before agreement."*

5. **Printable Atelier Production Sheet**:
   - Generates a bespoke workshop production brief (`@media print`) complete with measurements, resolved discrepancy records, quotation breakdown, and dual physical signature lines.

---

### ⚙️ How We Built It

- **YouCam Clothes V4 Integration**:
  - Direct server-to-server task orchestration against Perfect Corp's official endpoint (`https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4`) using `garment_category: "outer"`, strict multi-person filtering, and Bearer token authentication.
  - Asynchronous background polling worker querying `GET /s2s/v2.0/task/cloth-v4/{task_id}` with bounded retry controls (up to 10 minutes) and automated reboot recovery.
  - Strict operator hostname allowlists (`IMAGE_HOSTS`) preventing SSRF and private-network probing.

- **Zero-Dependency Native Node.js Architecture**:
  - Implemented entirely in native modern Node.js ES modules (`node:http`, `node:crypto`, `node:fs`, `node:test`).
  - **Zero npm runtime dependencies**—runs out of the box with zero installation overhead.
  - Fully transactional atomic file persistence (`.tmp` + rename) with per-workspace concurrency mutex locks.

- **Dual-Role Object Authorization**:
  - Workspaces generate distinct cryptographic tokens (`buyerKey` and `makerKey`).
  - Server-enforced permissions: buyers cannot issue quotes or confirm maker feasibility (HTTP 403); makers cannot approve quotes on the buyer's behalf (HTTP 403).

- **Atelier Visual Design System**:
  - High-contrast, warm paper and deep forest ink typography styled for fine bespoke tailoring houses, with full responsive support for mobile phones and desktop displays.

---

### 🚧 Challenges We Ran Into

1. **Bridging AI Hallucinations with Physical Tailoring**:
   Generative try-on algorithms frequently blend fabric seams or hallucinate collar styles that cannot be cut from a flat 2D pattern. We solved this not by hiding AI flaws, but by building an explicit **Discrepancy Tracker** where tailors record and resolve differences before cutting fabric.
2. **State Invalidation & Invariant Protection**:
   Ensuring that a quote or approval can never be orphaned or falsely attached to an updated brief required rigorous revision-locking and testing. We authored a 16-test automated regression suite covering optimistic concurrency, currency boundaries, and approval dependencies.
3. **Asynchronous Polling & UX Preservation**:
   Standard frontend re-rendering would blow away active user input during background poll intervals. We designed a non-destructive polling architecture that updates only dynamic badges and inference state while keeping user focus intact.

---

### 🏆 Accomplishments We're Proud Of

- **Verified Live YouCam Integration**: Executed and verified real end-to-end cloud inference with the YouCam Clothes V4 API, streaming real AI try-on images directly into the studio brief.
- **Genuine Collaborative Flow**: Implemented cross-browser link sharing so a real tailor on a phone or laptop can review and quote a brief created by a buyer on another device.
- **Robustness**: 16/16 automated test suites passing in ~500ms with zero runtime dependencies.

---

### 📚 What We Learned

- How to architect asynchronous AI tasks resiliently with timeout handling, restart recovery, and rate-limit preservation.
- The critical importance of making AI limitations transparent in e-commerce: customers and craftsmen trust AI far more when the platform explicitly distinguishes conceptual styling from physical production reality.

---

### 🔮 What's Next for MakerBrief

- **Merchant Tailor Profiles**: Allow bespoke ateliers to upload pre-approved garment reference templates and material swatch libraries.
- **Integrated Escrow Payments**: Connect Stripe or local bank deposits held in escrow until the maker-confirmed brief is approved.
- **Multi-angle 3D Fit Views**: Expand to multi-pose try-on previews to verify back and side seam drape.

---

## 4. Built With
- `youcam-api`
- `clothes-v4`
- `virtual-try-on`
- `node.js`
- `javascript`
- `e-commerce`
- `html5`
- `css3`

---

## 5. Demo Video Script (2 Minutes 30 Seconds)

*Use this storyboard script when recording your screen demonstration:*

- **0:00 – 0:20 (The Problem & Intro)**:
  *"When ordering custom clothing remotely, an inspiration photo or virtual try-on looks great, but it leaves the tailor guessing about seams, fabric weight, and measurements. MakerBrief solves this by connecting personal YouCam try-on previews to maker-confirmed specifications and binding quotes."*
- **0:20 – 0:50 (Buyer Studio & Live YouCam Try-On)**:
  *Show Buyer Studio at `http://127.0.0.1:3000`. Enter measurements (chest, shoulders, sleeves). Open 'Generate Live YouCam Preview', click 'Load Permitted Sample Photo Pair', check consent, and click 'Submit to YouCam Clothes V4'. Show the task polling and the real try-on jacket appearing on the model! Point out the atelier warning notice.*
- **0:50 – 1:25 (Maker Desk Review & Discrepancies)**:
  *Click 'Share Maker Link' or switch to Maker Desk. Show the tailor's perspective. Click 'Confirm Specification'. Open '+ Log Construction Discrepancy' (e.g., collar pattern difference) and resolve it. Approve details as 'Accepted'. Issue an itemized quote ($720 total, 14 days lead time).*
- **1:25 – 1:55 (Buyer Agreement)**:
  *Switch back to Buyer Studio. Show the quotation table. Click 'Agree to Quoted Revision V1'. Highlight the green badge: '✓ Fully Agreed Commission'.*
- **1:55 – 2:20 (The Centerpiece: Revision Invalidation)**:
  *In Buyer Studio, change the trim to 'Woven edge' and click 'Save as New Revision (V2)'. Show the amber invalidation alert appearing immediately: Quote #1 and prior approvals are now outdated! Show how agreement is locked until the maker confirms V2 and issues a new quote.*
- **2:20 – 2:40 (Printable Brief & Conclusion)**:
  *Click 'Print Brief' to show the beautiful printable workshop commission sheet with signature blocks. Conclude on how MakerBrief makes bespoke attire clear before it is made.*

---

## 6. Testing Instructions for Judges

Judges can run MakerBrief locally in less than 60 seconds with zero installations:

```bash
# 1. Clone repository
git clone https://github.com/techaaditya/MakerBrief.git
cd MakerBrief

# 2. Run test verification suite
npm test
npm run check

# 3. Start server
cp .env.example .env
npm start
# Opens at http://127.0.0.1:3000
```

*(Note for judges: MakerBrief runs out-of-the-box in Offline/Sample mode with full collaboration and quoting capabilities. To enable live YouCam API calls, set `ENABLE_LIVE=true` and paste your `YOUCAM_API_KEY` in `.env`).*
