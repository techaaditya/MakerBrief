/**
 * MakerBrief Atelier Application
 * 
 * Manages buyer preferences, tailor detail reviews, discrepancy tracking,
 * formal quotations, exact-version agreements, and YouCam preview orchestration.
 */

let data = null;
let activeRole = 'buyer'; // 'buyer' or 'maker'
let pollTimer = null;
let isSubmitting = false;

const root = document.querySelector('#root');
const noticeEl = document.querySelector('#notice');
const roleNoticeEl = document.querySelector('#roleNotice');
const makerLinkInput = document.querySelector('#makerLinkInput');
const printableBriefEl = document.querySelector('#printableBrief');

// Helper: Escape HTML strings
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

// Helper: Format currency
const money = (n, c = 'NPR') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format((n || 0) / 100);
  } catch {
    return `${(n / 100).toFixed(2)} ${c}`;
  }
};

// Helper: Flash message
function notice(msg, isError = false) {
  if (!noticeEl) return;
  noticeEl.textContent = msg;
  noticeEl.className = isError ? 'chip danger' : 'chip good';
  if (msg) {
    setTimeout(() => {
      if (noticeEl.textContent === msg) noticeEl.textContent = '';
    }, 8000);
  }
}

// Get effective maker key
function getEffectiveMakerKey() {
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = urlParams.get('makerKey');
  if (fromUrl) return fromUrl;
  if (activeRole === 'maker' && data?.makerKey) return data.makerKey;
  return '';
}

/**
 * Fetch latest state from server.
 * When isPoll is true, preserves form focus and active inputs.
 */
async function load(isPoll = false) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const wsParam = urlParams.get('ws');
    const paramKey = urlParams.get('makerKey');
    const makerKey = getEffectiveMakerKey();
    const queryParts = [];
    if (wsParam) queryParts.push(`ws=${encodeURIComponent(wsParam)}`);
    if (makerKey) queryParts.push(`makerKey=${encodeURIComponent(makerKey)}`);
    const query = queryParts.length ? '?' + queryParts.join('&') : '';
    const url = '/api/state' + query;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();

    // If accessed via maker link, activate maker view by default
    if (!isPoll) {
      if (paramKey && data.role === 'maker') {
        activeRole = 'maker';
      }
    }

    updateHeaderAndSidebar();
    render(isPoll);

    // Setup polling if any job is currently running
    clearTimeout(pollTimer);
    if (data.jobs && data.jobs.some(j => ['running', 'submitting', 'submitted'].includes(j.status))) {
      pollTimer = setTimeout(() => load(true), 10000);
    }
  } catch (err) {
    notice(`Failed to sync state: ${err.message}`, true);
  }
}

/**
 * Post an action to the server API.
 */
async function post(route, payload = {}) {
  const cur = data?.revisions?.at(-1);
  const expected = cur ? cur.id : 1;
  const urlParams = new URLSearchParams(window.location.search);
  const wsParam = urlParams.get('ws') || data?.workspaceId;
  const makerKey = getEffectiveMakerKey();
  const queryParts = [];
  if (wsParam) queryParts.push(`ws=${encodeURIComponent(wsParam)}`);
  if (activeRole === 'maker' && makerKey) queryParts.push(`makerKey=${encodeURIComponent(makerKey)}`);
  const query = queryParts.length ? '?' + queryParts.join('&') : '';

  isSubmitting = true;
  try {
    const res = await fetch(`/api/${route}${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeRole === 'maker' && makerKey ? { Authorization: `Bearer ${makerKey}` } : {})
      },
      body: JSON.stringify({ expected, ...payload })
    });

    const out = await res.json();
    if (!res.ok) {
      throw new Error(out.error || 'Request failed');
    }

    notice('Saved. Commission brief and history updated.');
    await load();
  } finally {
    isSubmitting = false;
  }
}

/**
 * Update Header and Sidebar controls.
 */
function updateHeaderAndSidebar() {
  const navBuyer = document.querySelector('#navBuyer');
  const navMaker = document.querySelector('#navMaker');
  const roleBadge = document.querySelector('#roleBadge');

  if (navBuyer && navMaker) {
    if (activeRole === 'buyer') {
      navBuyer.classList.add('active');
      navMaker.classList.remove('active');
      navBuyer.setAttribute('aria-pressed', 'true');
      navMaker.setAttribute('aria-pressed', 'false');
    } else {
      navMaker.classList.add('active');
      navBuyer.classList.remove('active');
      navMaker.setAttribute('aria-pressed', 'true');
      navBuyer.setAttribute('aria-pressed', 'false');
    }
  }

  if (roleBadge) {
    roleBadge.textContent = activeRole === 'maker' ? 'Active' : 'Tailor Desk';
  }

  if (roleNoticeEl) {
    if (activeRole === 'buyer') {
      roleNoticeEl.innerHTML = `Viewing <strong>Buyer Studio</strong>. Customize specifications, generate previews, and approve quotes.`;
    } else {
      roleNoticeEl.innerHTML = `Viewing <strong>Maker Desk</strong>. Confirm construction feasibility, log discrepancies, and issue binding quotes.`;
    }
  }

  if (makerLinkInput && data?.makerKey && data?.workspaceId) {
    const fullMakerUrl = `${window.location.origin}/?ws=${encodeURIComponent(data.workspaceId)}&makerKey=${encodeURIComponent(data.makerKey)}`;
    makerLinkInput.value = fullMakerUrl;
  }
}

/**
 * Renders the studio interface.
 */
function render(isPoll = false) {
  if (!data || !root) return;

  // If this is a background poll and the user is interacting with an input, avoid blowing away their edits
  const activeEl = document.activeElement;
  const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
  if (isPoll && isInputFocused) {
    updateDynamicBadgesOnly();
    return;
  }

  const curRev = data.revisions.at(-1);
  const st = data.computed;
  const q = st.quote;
  const curJob = data.jobs?.findLast(x => x.revision === curRev.id) || data.jobs?.at(-1);
  const prevRev = curRev.id > 1 ? data.revisions.find(x => x.id === curRev.id - 1) : null;
  const diffs = prevRev ? computeLocalDiffs(prevRev, curRev) : [];

  const discrepancies = st.discrepancies || [];
  const unresolvedDiscrepancies = st.unresolvedDiscrepancies || [];

  root.innerHTML = `
    <!-- Revision & Agreement Headline Banner -->
    <div class="row" style="margin-bottom: 20px;">
      <div>
        <p class="eyebrow">${activeRole === 'buyer' ? 'BUYER SPECIFICATION STUDIO' : 'MAKER ATELIER DESK'} / REVISION ${curRev.id}</p>
        <h2 style="border:none; margin:0;">${esc(curRev.spec.garment)} in ${esc(curRev.spec.material)}</h2>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <span class="chip ${st.buyerAgreed ? 'good' : 'warn'}">
          ${st.buyerAgreed ? '✓ Fully Agreed Commission' : 'In Progress (Review Pending)'}
        </span>
        <span class="chip info">Revision V${curRev.id}</span>
      </div>
    </div>

    <!-- Invalidation Alert if approvals/quotes are stale -->
    ${st.invalidationReason ? `
      <div class="invalidation-alert" role="alert">
        <span class="alert-icon" aria-hidden="true">⚠️</span>
        <div>
          <h4>Status Notice for Revision V${curRev.id}</h4>
          <p>${esc(st.invalidationReason)}</p>
        </div>
      </div>
    ` : ''}

    <!-- Main Grid -->
    <div class="grid">
      <!-- Left Column: Visual Direction & Agreement Status -->
      <div class="column">
        <!-- Visual Direction Card -->
        <div class="card">
          <div class="card-header">
            <h2>The Visual Direction</h2>
            <span class="chip ${curJob?.provenance === 'live_youcam' ? 'good' : 'info'}">
              ${curJob?.provenance === 'live_youcam' ? 'YouCam Clothes V4' : 'Vector Illustration (Sample)'}
            </span>
          </div>

          <div class="visual">
            <span class="visual-badge">
              ${curJob?.provenance === 'live_youcam' ? 'Inference Preview' : 'Conceptual Reference'}
            </span>
            <img id="previewImg" 
                 src="${esc(curJob?.status === 'success' && curJob.image ? curJob.image : '/assets/jacket.svg')}" 
                 alt="${curJob?.provenance === 'live_youcam' ? 'YouCam AI try-on garment preview' : 'Illustrative sample jacket artwork'}">
            <span class="visual-revision-tag">
              Preview V${curJob?.revision ?? curRev.id} ${curJob && curJob.revision !== curRev.id ? '· OUTDATED' : ''}
            </span>
          </div>

          <p class="small" style="margin-top:14px;">
            ${curJob ? `Preview tied to Revision V${curJob.revision} · Status: <strong>${esc(curJob.status)}</strong>` : 'No preview generated yet.'}
          </p>
          ${curJob?.message ? `<p class="small chip warn">${esc(curJob.message)}</p>` : ''}

          <p class="small">
            <strong>Atelier Notice:</strong> The visual preview represents appearance and aesthetic intent. Physical fit, structural pattern drafting, fabric drape, and seam behavior require maker confirmation.
          </p>

          <div class="actions" style="margin-top:16px;">
            <button id="btnSamplePreview" type="button">Open Illustrative Preview</button>
          </div>

          <!-- YouCam Try-on Drawer -->
          <details style="margin-top:16px; border-top:1px solid var(--line-light); padding-top:10px;">
            <summary style="font-weight:600; font-size:13px; color:var(--forest);">
              Generate Live YouCam Preview ${data.live ? '✓' : '(Operator Setup Needed)'}
            </summary>
            <div style="margin-top:14px;">
              <p class="small">
                Clothes V4 requires HTTPS URLs for a permissioned full-body photo and an actual garment reference, hosted on approved domains.
              </p>
              <div style="margin-bottom:10px;">
                <button type="button" id="btnFillSampleUrls" class="btn-sm secondary">
                  Load Permitted Sample Photo Pair
                </button>
              </div>
              <label>
                Your Portrait URL (Full body / Upper body):
                <input id="sourceUrlInput" type="url" placeholder="https://storage.example/model.jpg">
              </label>
              <label>
                Garment Reference URL:
                <input id="referenceUrlInput" type="url" placeholder="https://storage.example/jacket-ref.jpg">
              </label>
              <label class="check">
                <input id="consentCheckbox" type="checkbox">
                <span>I confirm I have explicit permission and consent to process both images through the YouCam API.</span>
              </label>
              <button id="btnLivePreview" class="primary" ${data.live ? '' : 'disabled'}>
                Submit to YouCam Clothes V4
              </button>
            </div>
          </details>
        </div>

        <!-- Agreement Status Card -->
        <div class="card">
          <div class="card-header">
            <h2>Agreement Verification</h2>
            <span class="chip ${st.buyerAgreed ? 'good' : 'warn'}">
              ${st.buyerAgreed ? 'Locked & Confirmed' : 'Action Required'}
            </span>
          </div>

          <table>
            <tbody>
              <tr>
                <th>Production Specification</th>
                <td>
                  <span class="badge-state ${st.makerConfirmed ? 'maker_confirmed' : 'requested'}">
                    ${st.makerConfirmed ? '✓ Maker Confirmed' : 'Awaiting Confirmation'}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Detail Review Verdict</th>
                <td>
                  <span class="badge-state ${st.review?.verdict === 'accepted' ? 'maker_confirmed' : (st.review?.verdict === 'needs_changes' ? 'discrepancy' : 'requested')}">
                    ${st.review?.verdict === 'accepted' ? '✓ Details Accepted' : (st.review?.verdict === 'needs_changes' ? '⚠ Changes Required' : 'Not Reviewed')}
                  </span>
                  ${st.review?.note ? `<br><small class="small">"${esc(st.review.note)}"</small>` : ''}
                </td>
              </tr>
              <tr>
                <th>Discrepancy Log</th>
                <td>
                  <span class="badge-state ${unresolvedDiscrepancies.length === 0 ? 'maker_confirmed' : 'discrepancy'}">
                    ${unresolvedDiscrepancies.length === 0 ? '0 Open Issues' : `${unresolvedDiscrepancies.length} Unresolved Blocker(s)`}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Commission Quote</th>
                <td>
                  <span class="badge-state ${st.quoteCurrent ? 'maker_confirmed' : (q ? 'discrepancy' : 'requested')}">
                    ${q ? (st.quoteCurrent ? `✓ Current (Quote #${q.id})` : `⚠ Outdated (Quote #${q.id} was for V${q.revision})`) : 'No Quote Issued'}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Buyer Acceptance</th>
                <td>
                  <span class="badge-state ${st.buyerAgreed ? 'maker_confirmed' : 'requested'}">
                    ${st.buyerAgreed ? '✓ Quoted Terms Accepted' : 'Pending Buyer Acceptance'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="small">
            Invariants: Every approval belongs to an exact revision number. A specification change invalidates prior quotes and maker confirmations.
          </p>
        </div>

        <!-- Discrepancy Registry Card -->
        <div class="card">
          <div class="card-header">
            <h2>Discrepancies & Physical Clarifications</h2>
            <span class="chip ${unresolvedDiscrepancies.length === 0 ? 'good' : 'warn'}">
              ${unresolvedDiscrepancies.length} Open
            </span>
          </div>

          <p class="small">
            Record differences between generated previews and real physical tailoring feasibility (e.g. lapel proportions, fabric seams, lining construction).
          </p>

          ${discrepancies.length ? discrepancies.map(d => `
            <div class="discrepancy-item ${d.status === 'resolved' ? 'resolved' : ''}">
              <div class="discrepancy-header">
                <span class="discrepancy-field">${esc(d.field)}</span>
                <span class="badge-state ${d.status === 'resolved' ? 'maker_confirmed' : 'discrepancy'}">
                  ${d.status === 'resolved' ? '✓ Resolved' : '⚠ Unresolved Blocker'}
                </span>
              </div>
              <div class="discrepancy-issue">
                <strong>Issue:</strong> ${esc(d.issue)}
              </div>
              ${d.resolution ? `
                <div class="discrepancy-resolution">
                  <strong>Resolution:</strong> ${esc(d.resolution)}
                </div>
              ` : ''}
              ${activeRole === 'maker' && d.status === 'unresolved' ? `
                <div style="margin-top:10px;">
                  <input type="text" id="resolveNote_${d.id}" placeholder="Enter tailor physical resolution plan..." style="font-size:12px; margin-bottom:6px;">
                  <button type="button" class="btn-sm primary" onclick="window.resolveItem(${d.id})">Mark Resolved</button>
                </div>
              ` : ''}
            </div>
          `).join('') : '<p class="small" style="font-style:italic;">No discrepancies logged for this revision.</p>'}

          ${activeRole === 'maker' ? `
            <details style="margin-top:16px; border-top:1px solid var(--line-light); padding-top:12px;">
              <summary style="font-size:13px; font-weight:600; cursor:pointer;">+ Log Construction Discrepancy</summary>
              <form id="discrepancyForm" style="margin-top:12px;">
                <label>Affected Component / Field:
                  <select name="field">
                    <option value="collar">Collar & Lapel</option>
                    <option value="trim">Trim & Edge Finishing</option>
                    <option value="material">Material Drape & Weight</option>
                    <option value="garment">Garment Silhouette / Pockets</option>
                    <option value="measurements">Measurements & Fit</option>
                  </select>
                </label>
                <label>Discrepancy Description:
                  <textarea name="issue" placeholder="Describe the physical tailoring limitation or discrepancy with the preview..." required></textarea>
                </label>
                <label>Proposed Workshop Resolution:
                  <input type="text" name="resolution" placeholder="How the tailor will construct it physically...">
                </label>
                <button type="submit" class="primary btn-sm" style="margin-top:8px;">Add Discrepancy</button>
              </form>
            </details>
          ` : ''}
        </div>
      </div>

      <!-- Right Column: Specification, Quote, Revisions, Timeline -->
      <div class="column">
        <!-- Specification Brief Card -->
        <div class="card">
          <div class="card-header">
            <h2>${activeRole === 'buyer' ? 'Customize Your Specification' : 'Production Specification Review'}</h2>
            <span class="chip info">Revision V${curRev.id}</span>
          </div>

          ${activeRole === 'buyer' ? `
            <form id="specForm">
              <div class="fields">
                ${Object.entries(data.options).map(([k, opts]) => `
                  <label>
                    ${esc(k[0].toUpperCase() + k.slice(1))}
                    <select name="${k}">
                      ${opts.map(v => `<option value="${esc(v)}" ${v === curRev.spec[k] ? 'selected' : ''}>${esc(v)}</option>`).join('')}
                    </select>
                  </label>
                `).join('')}

                <label class="full">
                  Tailoring & Atelier Notes
                  <textarea name="notes" placeholder="Specify special lining, buttonhole requests, or custom adjustments...">${esc(curRev.spec.notes)}</textarea>
                </label>
              </div>

              <!-- Body Measurements Subsection -->
              <details style="margin-bottom:16px;">
                <summary style="font-size:13px; font-weight:600; cursor:pointer;">Garment Dimensions / Measurements (cm)</summary>
                <div class="fields" style="margin-top:10px;">
                  <label>Chest (cm)
                    <input type="number" step="0.5" name="m_chest" value="${curRev.spec.measurements?.chest || 102}">
                  </label>
                  <label>Shoulder (cm)
                    <input type="number" step="0.5" name="m_shoulder" value="${curRev.spec.measurements?.shoulder || 46}">
                  </label>
                  <label>Sleeve (cm)
                    <input type="number" step="0.5" name="m_sleeve" value="${curRev.spec.measurements?.sleeve || 64}">
                  </label>
                  <label>Back Length (cm)
                    <input type="number" step="0.5" name="m_length" value="${curRev.spec.measurements?.length || 72}">
                  </label>
                </div>
              </details>

              <button type="submit" class="primary" id="btnSaveSpec">
                Save as New Revision (V${curRev.id + 1})
              </button>
            </form>
          ` : `
            <table>
              <tbody>
                ${Object.entries(curRev.spec).filter(([k]) => k !== 'measurements').map(([k, v]) => `
                  <tr>
                    <th>${esc(k)}</th>
                    <td><strong>${esc(v)}</strong></td>
                  </tr>
                `).join('')}
                ${curRev.spec.measurements ? `
                  <tr>
                    <th>Measurements</th>
                    <td>
                      Chest: ${curRev.spec.measurements.chest || '-'}cm, 
                      Shoulder: ${curRev.spec.measurements.shoulder || '-'}cm, 
                      Sleeve: ${curRev.spec.measurements.sleeve || '-'}cm, 
                      Length: ${curRev.spec.measurements.length || '-'}cm
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>

            <div style="margin-top:18px; display:flex; gap:10px; flex-wrap:wrap;">
              <button id="btnMakerConfirm" class="primary" ${st.makerConfirmed ? 'disabled' : ''}>
                ${st.makerConfirmed ? '✓ Specification Confirmed' : 'Confirm Specification for V' + curRev.id}
              </button>
            </div>

            <div style="margin-top:20px; border-top:1px solid var(--line-light); padding-top:16px;">
              <label>Detail Review Notes:
                <textarea id="reviewNoteInput" placeholder="Record atelier assessment on construction feasibility, fabric matching, and pattern drafting..."></textarea>
              </label>
              <div class="actions" style="margin-top:10px;">
                <button id="btnReviewAccept" class="primary">Approve Details (Accepted)</button>
                <button id="btnReviewReject" class="secondary">Flag Construction Issues (Needs Changes)</button>
              </div>
            </div>
          `}
        </div>

        <!-- Maker Quote Card -->
        <div class="card">
          <div class="card-header">
            <h2>Atelier Quotation</h2>
            ${q ? `
              <span class="chip ${st.quoteCurrent ? 'good' : 'warn'}">
                Quote #${q.id} ${st.quoteCurrent ? '(Current for V' + q.revision + ')' : '(OUTDATED for V' + q.revision + ')'}
              </span>
            ` : '<span class="chip warn">Awaiting Quote</span>'}
          </div>

          ${q ? `
            <table class="quote-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${q.lines.map(l => `
                  <tr>
                    <td>${esc(l.label)}</td>
                    <td class="amount">${money(l.amount, q.currency)}</td>
                  </tr>
                `).join('')}
                <tr class="quote-total-row">
                  <th>Total Quoted</th>
                  <td class="amount">${money(q.total, q.currency)}</td>
                </tr>
              </tbody>
            </table>
            <p class="small">
              <strong>Estimated Lead Time:</strong> ${q.days} days · <strong>Deposit Required:</strong> ${q.depositPercent || 50}%<br>
              <strong>Terms:</strong> ${esc(q.terms || 'Standard bespoke production terms apply.')}
            </p>
          ` : '<p class="small">No formal quote has been issued for this specification.</p>'}

          ${activeRole === 'maker' ? `
            <details style="margin-top:16px; border-top:1px solid var(--line-light); padding-top:14px;">
              <summary style="font-size:13px; font-weight:600; cursor:pointer;">
                ${q ? 'Issue Revised Quotation for V' + curRev.id : 'Issue Initial Quote'}
              </summary>
              <form id="quoteForm" style="margin-top:12px;">
                <div class="fields">
                  <label>Currency
                    <select name="currency">
                      ${['NPR', 'USD', 'INR', 'EUR', 'GBP'].map(c => `<option value="${c}" ${q?.currency === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                  </label>
                  <label>Lead Time (days)
                    <input type="number" name="days" min="1" max="365" value="${q?.days || 14}" required>
                  </label>
                  <label>Material & Linings
                    <input type="number" step="0.01" min="0" name="materialAmount" value="3500.00" required>
                  </label>
                  <label>Bespoke Tailoring & Craft
                    <input type="number" step="0.01" min="0" name="craftAmount" value="2500.00" required>
                  </label>
                  <label>Hand Finishing & Trims
                    <input type="number" step="0.01" min="0" name="trimAmount" value="800.00" required>
                  </label>
                  <label>Deposit Percentage (%)
                    <input type="number" min="10" max="100" name="depositPercent" value="50" required>
                  </label>
                </div>
                <button type="submit" class="primary">Issue Formal Quote for V${curRev.id}</button>
              </form>
            </details>
          ` : `
            <div style="margin-top:20px;">
              <button id="btnBuyerAgree" class="primary" style="width:100%; padding:14px; font-size:15px;"
                ${st.buyerAgreed || !st.quoteCurrent || !st.makerConfirmed || st.review?.verdict !== 'accepted' || unresolvedDiscrepancies.length > 0 ? 'disabled' : ''}>
                ${st.buyerAgreed ? '✓ Commission Quoted Brief Agreed' : 'Agree to Quoted Revision V' + curRev.id}
              </button>
              ${!st.buyerAgreed ? `
                <p class="small" style="margin-top:8px; text-align:center;">
                  ${!st.quoteCurrent ? 'Requires current maker quote' : (!st.makerConfirmed ? 'Awaiting maker specification confirmation' : (unresolvedDiscrepancies.length > 0 ? 'Unresolved discrepancies must be settled first' : 'Ready for your acceptance'))}
                </p>
              ` : ''}
            </div>
          `}
        </div>

        <!-- Revision Comparison & History Card -->
        <div class="card">
          <div class="card-header">
            <h2>Revision Comparison & Evolution</h2>
            <span class="chip info">${data.revisions.length} Revision(s)</span>
          </div>

          ${diffs.length ? `
            <div class="diff-card">
              <div class="diff-header">
                <span>Changes in V${curRev.id} (compared to V${prevRev.id})</span>
              </div>
              <div class="diff-list">
                ${diffs.map(d => `
                  <div class="diff-item">
                    <span class="diff-field">${esc(d.field)}:</span>
                    <span class="diff-old">${esc(d.from || 'none')}</span>
                    <span>→</span>
                    <span class="diff-new">${esc(d.to || 'none')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : (curRev.id === 1 ? '<p class="small">Initial commission baseline (Revision V1).</p>' : '<p class="small">No specification changes detected.</p>')}

          <details style="margin-top:14px;">
            <summary style="font-size:13px; font-weight:600; cursor:pointer;">View All Past Revisions</summary>
            <div style="margin-top:10px;">
              ${data.revisions.slice().reverse().map(r => `
                <p class="small" style="padding:6px 0; border-bottom:1px solid var(--line-light);">
                  <strong>V${r.id} (${esc(new Date(r.at).toLocaleDateString())}):</strong> 
                  ${esc(r.spec.garment)} · ${esc(r.spec.material)} · ${esc(r.spec.collar)} · ${esc(r.spec.trim)}
                </p>
              `).join('')}
            </div>
          </details>
        </div>

        <!-- Audit Timeline Card -->
        <div class="card">
          <div class="card-header">
            <h2>Audit Trail & Decision Timeline</h2>
            <span class="chip info">${data.events.length} Events</span>
          </div>

          <div class="log">
            ${data.events.length ? data.events.slice().reverse().map(e => `
              <div class="log-entry">
                <span class="log-actor ${e.actor}">${esc(e.actor)}</span>
                <strong>V${e.revision}</strong> — ${esc(e.message)}
                <div class="small" style="color:var(--muted); margin-top:2px;">
                  ${esc(new Date(e.at).toLocaleTimeString())} · ${esc(new Date(e.at).toLocaleDateString())}
                </div>
              </div>
            `).join('') : '<p class="small">No events recorded yet.</p>'}
          </div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

/**
 * Partial update for background poll: updates dynamic status and image without touching form controls.
 */
function updateDynamicBadgesOnly() {
  if (!data) return;
  const curRev = data.revisions.at(-1);
  const curJob = data.jobs?.findLast(x => x.revision === curRev.id) || data.jobs?.at(-1);
  const previewImg = document.querySelector('#previewImg');
  if (previewImg && curJob?.status === 'success' && curJob.image) {
    previewImg.src = curJob.image;
  }
}

/**
 * Compute differences between two revisions on the client.
 */
function computeLocalDiffs(revA, revB) {
  if (!revA || !revB) return [];
  const diffs = [];
  const specA = revA.spec || {};
  const specB = revB.spec || {};

  for (const k of ['garment', 'material', 'collar', 'trim']) {
    if (specA[k] !== specB[k]) {
      diffs.push({ field: k, from: specA[k], to: specB[k] });
    }
  }

  if (specA.notes !== specB.notes) {
    diffs.push({ field: 'notes', from: specA.notes, to: specB.notes });
  }

  return diffs;
}

/**
 * Bind interactive events to DOM elements.
 */
function bindEvents() {
  // Sample Preview
  const btnSample = document.querySelector('#btnSamplePreview');
  if (btnSample) {
    btnSample.onclick = () => post('preview', { mode: 'sample' });
  }

  // Pre-fill Sample YouCam Test Pair
  const btnFillSample = document.querySelector('#btnFillSampleUrls');
  if (btnFillSample) {
    btnFillSample.onclick = () => {
      const srcInput = document.querySelector('#sourceUrlInput');
      const refInput = document.querySelector('#referenceUrlInput');
      const consentBox = document.querySelector('#consentCheckbox');
      if (srcInput) srcInput.value = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
      if (refInput) refInput.value = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80';
      if (consentBox) consentBox.checked = true;
      notice('Loaded sample test URLs for Unsplash.');
    };
  }

  // Live YouCam Preview
  const btnLive = document.querySelector('#btnLivePreview');
  if (btnLive) {
    btnLive.onclick = () => {
      const source = document.querySelector('#sourceUrlInput')?.value;
      const reference = document.querySelector('#referenceUrlInput')?.value;
      const consent = document.querySelector('#consentCheckbox')?.checked;
      if (!source || !reference) {
        notice('Please enter both source and reference HTTPS URLs.', true);
        return;
      }
      if (!consent) {
        notice('Photo processing consent checkbox is required.', true);
        return;
      }
      post('preview', { mode: 'live', source, reference, consent });
    };
  }

  // Buyer Spec Form Save
  const specForm = document.querySelector('#specForm');
  if (specForm) {
    specForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(specForm);
      const spec = {
        garment: fd.get('garment'),
        material: fd.get('material'),
        collar: fd.get('collar'),
        trim: fd.get('trim'),
        notes: fd.get('notes'),
        measurements: {
          unit: 'cm',
          chest: Number(fd.get('m_chest')),
          shoulder: Number(fd.get('m_shoulder')),
          sleeve: Number(fd.get('m_sleeve')),
          length: Number(fd.get('m_length'))
        }
      };
      post('revise', { spec });
    };
  }

  // Maker Confirm Spec
  const btnMakerConfirm = document.querySelector('#btnMakerConfirm');
  if (btnMakerConfirm) {
    btnMakerConfirm.onclick = () => post('approve', { actor: 'maker' });
  }

  // Maker Detail Review
  const btnReviewAccept = document.querySelector('#btnReviewAccept');
  if (btnReviewAccept) {
    btnReviewAccept.onclick = () => {
      const note = document.querySelector('#reviewNoteInput')?.value || 'Details reviewed and accepted for production';
      post('review', { verdict: 'accepted', note });
    };
  }

  const btnReviewReject = document.querySelector('#btnReviewReject');
  if (btnReviewReject) {
    btnReviewReject.onclick = () => {
      const note = document.querySelector('#reviewNoteInput')?.value;
      if (!note || !note.trim()) {
        notice('Please explain the construction discrepancy or needed changes.', true);
        return;
      }
      post('review', { verdict: 'needs_changes', note });
    };
  }

  // Maker Discrepancy Form
  const discrepancyForm = document.querySelector('#discrepancyForm');
  if (discrepancyForm) {
    discrepancyForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(discrepancyForm);
      post('discrepancy', {
        field: fd.get('field'),
        issue: fd.get('issue'),
        resolution: fd.get('resolution')
      });
    };
  }

  // Maker Issue Quote Form
  const quoteForm = document.querySelector('#quoteForm');
  if (quoteForm) {
    quoteForm.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(quoteForm);
      const currency = fd.get('currency');
      const days = Number(fd.get('days'));
      const depositPercent = Number(fd.get('depositPercent'));
      const lines = [
        { label: 'Garment Material & Linings', amount: Math.round(Number(fd.get('materialAmount')) * 100) },
        { label: 'Bespoke Tailoring & Workshop Craft', amount: Math.round(Number(fd.get('craftAmount')) * 100) },
        { label: 'Hand Finishing, Trims & Closures', amount: Math.round(Number(fd.get('trimAmount')) * 100) }
      ];
      post('quote', { currency, days, depositPercent, lines });
    };
  }

  // Buyer Agree to Quote
  const btnBuyerAgree = document.querySelector('#btnBuyerAgree');
  if (btnBuyerAgree) {
    btnBuyerAgree.onclick = () => post('approve', { actor: 'buyer' });
  }

  // Window global for resolving discrepancy items
  window.resolveItem = id => {
    const input = document.querySelector(`#resolveNote_${id}`);
    const resolution = input?.value || 'Resolved according to physical atelier standard';
    post('discrepancy/resolve', { discrepancyId: id, resolution });
  };
}

/**
 * Top-level navigation buttons and export bindings.
 */
document.querySelector('#navBuyer').onclick = () => {
  activeRole = 'buyer';
  updateHeaderAndSidebar();
  render();
};

document.querySelector('#navMaker').onclick = () => {
  activeRole = 'maker';
  updateHeaderAndSidebar();
  render();
};

// Copy Maker Link
document.querySelector('#copyMakerLinkBtn').onclick = () => {
  if (makerLinkInput?.value) {
    navigator.clipboard?.writeText(makerLinkInput.value)
      .then(() => notice('Tailor review link copied to clipboard!'))
      .catch(() => notice('Select and copy the tailor link from the box.'));
  }
};

document.querySelector('#btnShareMaker').onclick = () => {
  if (makerLinkInput?.value) {
    prompt('Share this direct link with your tailor/maker:', makerLinkInput.value);
  }
};

// JSON Export
document.querySelector('#btnExport').onclick = () => {
  if (!data) return;
  const curRev = data.revisions.at(-1);
  const payload = {
    platform: 'MakerBrief',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    currentRevision: curRev.id,
    agreementStatus: data.computed,
    revisions: data.revisions,
    quotes: data.quotes,
    approvals: data.approvals,
    reviews: data.reviews,
    discrepancies: data.discrepancies || [],
    events: data.events
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `makerbrief-commission-revision-${curRev.id}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  notice('JSON commission brief and audit history exported.');
};

// Print Brief View
document.querySelector('#btnPrint').onclick = () => {
  if (!data || !printableBriefEl) return;
  const curRev = data.revisions.at(-1);
  const st = data.computed;
  const q = st.quote;

  printableBriefEl.innerHTML = `
    <div class="print-header">
      <div>
        <h1 class="print-title">MakerBrief Production Commission Sheet</h1>
        <p style="margin:4px 0 0; font-family:sans-serif; font-size:14px; color:#555;">
          Custom Attire Atelier Agreement · Specification Revision V${curRev.id}
        </p>
      </div>
      <div class="print-meta">
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Status:</strong> ${st.buyerAgreed ? 'CONFIRMED & AGREED' : 'IN REVIEW'}</div>
      </div>
    </div>

    <h2 style="font-size:20px; border-bottom:1px solid #000; padding-bottom:4px;">1. Commission Specification</h2>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">
      <tr><td style="width:30%; padding:6px 0; font-weight:bold;">Garment Silhouette:</td><td>${esc(curRev.spec.garment)}</td></tr>
      <tr><td style="padding:6px 0; font-weight:bold;">Material & Fabric:</td><td>${esc(curRev.spec.material)}</td></tr>
      <tr><td style="padding:6px 0; font-weight:bold;">Collar & Lapel:</td><td>${esc(curRev.spec.collar)}</td></tr>
      <tr><td style="padding:6px 0; font-weight:bold;">Trim & Finishing:</td><td>${esc(curRev.spec.trim)}</td></tr>
      <tr><td style="padding:6px 0; font-weight:bold;">Special Production Notes:</td><td>${esc(curRev.spec.notes || 'None')}</td></tr>
    </table>

    <h2 style="font-size:20px; border-bottom:1px solid #000; padding-bottom:4px;">2. Client Dimensions (cm)</h2>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">
      <tr>
        <td><strong>Chest:</strong> ${curRev.spec.measurements?.chest || '-'} cm</td>
        <td><strong>Shoulder:</strong> ${curRev.spec.measurements?.shoulder || '-'} cm</td>
        <td><strong>Sleeve:</strong> ${curRev.spec.measurements?.sleeve || '-'} cm</td>
        <td><strong>Length:</strong> ${curRev.spec.measurements?.length || '-'} cm</td>
      </tr>
    </table>

    <h2 style="font-size:20px; border-bottom:1px solid #000; padding-bottom:4px;">3. Discrepancy & Physical Feasibility Record</h2>
    ${st.discrepancies?.length ? `
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid #000;">
            <th style="text-align:left; padding:4px;">Component</th>
            <th style="text-align:left; padding:4px;">Observed Discrepancy</th>
            <th style="text-align:left; padding:4px;">Agreed Physical Resolution</th>
          </tr>
        </thead>
        <tbody>
          ${st.discrepancies.map(d => `
            <tr style="border-bottom:1px solid #ddd;">
              <td style="padding:6px 4px; font-weight:bold;">${esc(d.field)}</td>
              <td style="padding:6px 4px;">${esc(d.issue)}</td>
              <td style="padding:6px 4px;">${esc(d.resolution || 'Unresolved')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="font-size:13px; font-style:italic;">No discrepancies recorded between preview and production.</p>'}

    <h2 style="font-size:20px; border-bottom:1px solid #000; padding-bottom:4px;">4. Quoted Production Terms</h2>
    ${q ? `
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">
        ${q.lines.map(l => `
          <tr>
            <td style="padding:6px 0;">${esc(l.label)}</td>
            <td style="text-align:right; font-weight:bold;">${money(l.amount, q.currency)}</td>
          </tr>
        `).join('')}
        <tr style="border-top:2px solid #000; font-size:16px;">
          <th style="text-align:left; padding:8px 0;">Total Bespoke Fee</th>
          <th style="text-align:right; padding:8px 0;">${money(q.total, q.currency)}</th>
        </tr>
      </table>
      <p style="font-size:13px;">
        <strong>Estimated Lead Time:</strong> ${q.days} days · <strong>Deposit Required:</strong> ${q.depositPercent || 50}%<br>
        <strong>Terms:</strong> ${esc(q.terms || 'Standard bespoke atelier terms apply.')}
      </p>
    ` : '<p style="font-size:13px;">No quote issued.</p>'}

    <div class="print-signatures">
      <div>
        <div class="sign-line">Tailor / Maker Confirmation & Signature</div>
        <div style="font-size:11px; margin-top:4px;">Confirmed: ${st.makerConfirmed ? 'YES' : 'PENDING'}</div>
      </div>
      <div>
        <div class="sign-line">Commissioner / Buyer Acceptance & Signature</div>
        <div style="font-size:11px; margin-top:4px;">Agreed: ${st.buyerAgreed ? 'YES' : 'PENDING'}</div>
      </div>
    </div>
  `;

  printableBriefEl.style.display = 'block';
  window.print();
  setTimeout(() => {
    printableBriefEl.style.display = 'none';
  }, 1000);
};

// Workspace Start Fresh and Delete
document.querySelector('#btnStartFresh').onclick = () => {
  if (confirm('Start fresh with a new initial brief? All revisions in this workspace will be reset.')) {
    post('reset', {});
  }
};

document.querySelector('#btnDeleteWorkspace').onclick = () => {
  if (confirm('Permanently delete this workspace and all associated commission data? This action cannot be undone.')) {
    post('delete', {});
  }
};

// Initialize
load();
