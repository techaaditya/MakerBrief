/**
 * MakerBrief Domain Module
 * 
 * Core domain model, revision rules, quote validation, discrepancy tracking,
 * and agreement status computation for custom attire commissions.
 */

export const options = {
  garment: ['Studio jacket', 'Evening coat', 'Ceremony vest'],
  material: ['Cotton twill', 'Wool blend', 'Linen blend'],
  collar: ['Stand collar', 'Notched collar', 'Shawl collar'],
  trim: ['No trim', 'Contrast piping', 'Woven edge']
};

export const measurementFields = ['chest', 'shoulder', 'sleeve', 'length'];

export const supportedCurrencies = ['NPR', 'USD', 'INR', 'EUR', 'GBP'];

/**
 * Returns initial workspace state.
 */
export function initial() {
  return {
    version: 1,
    revisions: [
      {
        id: 1,
        at: new Date().toISOString(),
        spec: {
          garment: 'Studio jacket',
          material: 'Cotton twill',
          collar: 'Stand collar',
          trim: 'No trim',
          notes: 'Confirm measurements and actual material before production.'
        }
      }
    ],
    quotes: [],
    approvals: [],
    reviews: [],
    discrepancies: [],
    jobs: [],
    events: []
  };
}

/**
 * Returns the latest revision.
 */
export function current(s) {
  return s.revisions.at(-1);
}

/**
 * Audit trail event logger.
 */
export function audit(s, actor, message, revision = current(s).id, details = {}) {
  s.events.push({
    id: s.events.length + 1,
    at: new Date().toISOString(),
    actor,
    message,
    revision,
    details
  });
}

/**
 * Compare two revisions and return changed fields with human explanations.
 */
export function diffRevisions(revA, revB) {
  if (!revA || !revB) return [];
  const diffs = [];
  const specA = revA.spec || {};
  const specB = revB.spec || {};

  for (const key of Object.keys(options)) {
    if (specA[key] !== specB[key]) {
      diffs.push({
        field: key,
        from: specA[key] ?? null,
        to: specB[key] ?? null,
        summary: `${key[0].toUpperCase() + key.slice(1)} changed from "${specA[key] || 'None'}" to "${specB[key] || 'None'}"`
      });
    }
  }

  if (specA.notes !== specB.notes) {
    diffs.push({
      field: 'notes',
      from: specA.notes,
      to: specB.notes,
      summary: 'Production notes updated'
    });
  }

  if (specA.measurements || specB.measurements) {
    const mA = specA.measurements || {};
    const mB = specB.measurements || {};
    for (const f of measurementFields) {
      if (mA[f] !== mB[f]) {
        diffs.push({
          field: `measurements.${f}`,
          from: mA[f] ?? null,
          to: mB[f] ?? null,
          summary: `Measurement ${f} changed from ${mA[f] ?? 'unset'} to ${mB[f] ?? 'unset'} ${mB.unit || mA.unit || 'cm'}`
        });
      }
    }
  }

  return diffs;
}

/**
 * Revise commission specification.
 * Creates a new immutable revision if changes are detected.
 * Enforces optimistic concurrency via `expected`.
 */
export function revise(s, input, expected) {
  const cur = current(s);
  if (cur.id !== expected) {
    throw new Error('Revision conflict. Refresh and review the latest version.');
  }

  const spec = {};
  for (const [k, values] of Object.entries(options)) {
    if (!values.includes(input[k])) throw new Error('Unsupported ' + k);
    spec[k] = input[k];
  }

  spec.notes = String(input.notes ?? '').trim();
  if (spec.notes.length > 2000) throw new Error('Notes too long');

  // Measurements handling
  if (input.measurements && typeof input.measurements === 'object') {
    spec.measurements = {
      unit: input.measurements.unit === 'in' ? 'in' : 'cm'
    };
    for (const field of measurementFields) {
      if (input.measurements[field] !== undefined && input.measurements[field] !== null && input.measurements[field] !== '') {
        const val = Number(input.measurements[field]);
        if (!Number.isFinite(val) || val < 10 || val > 300) {
          throw new Error(`Invalid measurement value for ${field}`);
        }
        spec.measurements[field] = Math.round(val * 10) / 10;
      }
    }
  } else if (cur.spec.measurements) {
    spec.measurements = { ...cur.spec.measurements };
  }

  // Check for identity against cur.spec
  let isIdentical = Object.keys(options).every(k => spec[k] === cur.spec[k]) &&
    spec.notes === (cur.spec.notes || '');

  if (spec.measurements || cur.spec.measurements) {
    if (JSON.stringify(spec.measurements) !== JSON.stringify(cur.spec.measurements)) {
      isIdentical = false;
    }
  }

  if (isIdentical) return;

  const nextId = cur.id + 1;
  const newRevision = {
    id: nextId,
    at: new Date().toISOString(),
    spec
  };

  s.revisions.push(newRevision);

  const changes = diffRevisions(cur, newRevision);
  audit(s, 'buyer', `Specification revised to V${nextId}: ${changes.map(c => c.summary).join('; ') || 'Updated'}`, nextId, { changes });
}

/**
 * Issue a formal quote for the specified revision.
 */
export function quote(s, input, expected) {
  if (current(s).id !== expected) throw new Error('Revision conflict');
  if (!Array.isArray(input.lines) || !input.lines.length || input.lines.length > 20) {
    throw new Error('Add 1–20 quote lines');
  }

  const lines = input.lines.map(x => {
    if (
      typeof x.label !== 'string' ||
      !x.label.trim() ||
      x.label.length > 100 ||
      !Number.isSafeInteger(x.amount) ||
      x.amount < 0 ||
      x.amount > 100000000
    ) {
      throw new Error('Invalid quote line');
    }
    return { label: x.label.trim(), amount: x.amount };
  });

  const total = lines.reduce((a, b) => a + b.amount, 0);
  if (total > 100000000) throw new Error('Total too large');
  if (!supportedCurrencies.includes(input.currency)) {
    throw new Error('Unsupported currency');
  }
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 365) {
    throw new Error('Lead time must be 1–365 days');
  }

  const q = {
    id: s.quotes.length + 1,
    revision: expected,
    lines,
    total,
    currency: input.currency,
    days: input.days,
    depositPercent: Number.isInteger(input.depositPercent) && input.depositPercent >= 0 && input.depositPercent <= 100 ? input.depositPercent : 50,
    terms: typeof input.terms === 'string' ? input.terms.slice(0, 500) : 'Standard bespoke production terms apply.',
    at: new Date().toISOString()
  };

  s.quotes.push(q);
  audit(s, 'maker', `Quote issued #${q.id} (${(q.total / 100).toFixed(2)} ${q.currency}, ${q.days} days lead time)`, expected);
  return q;
}

/**
 * Record a discrepancy between preview/inspiration and physical production.
 */
export function addDiscrepancy(s, { field, issue, resolution, expected }) {
  if (current(s).id !== expected) throw new Error('Revision conflict');
  if (typeof field !== 'string' || !field.trim()) throw new Error('Discrepancy field required');
  if (typeof issue !== 'string' || !issue.trim() || issue.length > 1000) {
    throw new Error('Explain the discrepancy issue');
  }

  if (!s.discrepancies) s.discrepancies = [];

  const item = {
    id: s.discrepancies.length + 1,
    revision: expected,
    field: field.trim(),
    issue: issue.trim(),
    resolution: typeof resolution === 'string' ? resolution.trim() : '',
    status: resolution && resolution.trim() ? 'resolved' : 'unresolved',
    at: new Date().toISOString()
  };

  s.discrepancies.push(item);

  // If newly unresolved discrepancy, any buyer agreement is revoked
  if (item.status === 'unresolved') {
    s.approvals = s.approvals.filter(x => x.revision !== expected || x.actor !== 'buyer');
  }

  audit(s, 'maker', `Discrepancy recorded on ${field}: ${issue}`, expected);
  return item;
}

/**
 * Resolve an existing discrepancy item.
 */
export function resolveDiscrepancy(s, discrepancyId, resolution, expected) {
  if (current(s).id !== expected) throw new Error('Revision conflict');
  if (!s.discrepancies) s.discrepancies = [];
  const item = s.discrepancies.find(x => x.id === discrepancyId && x.revision === expected);
  if (!item) throw new Error('Discrepancy not found for current revision');
  if (typeof resolution !== 'string' || !resolution.trim()) {
    throw new Error('Resolution explanation required');
  }

  item.resolution = resolution.trim();
  item.status = 'resolved';
  item.resolvedAt = new Date().toISOString();

  audit(s, 'maker', `Discrepancy #${discrepancyId} on ${item.field} resolved: ${item.resolution}`, expected);
  return item;
}

/**
 * Explain in clear human terms why the current agreement status is incomplete or outdated.
 */
export function explainInvalidation(s, st) {
  const r = current(s).id;
  const reasons = [];

  if (r > 1) {
    const prev = s.revisions.find(x => x.id === r - 1);
    const diffs = diffRevisions(prev, current(s));
    if (diffs.length > 0) {
      reasons.push(`Revision V${r} contains specification updates: ${diffs.map(d => d.summary).join('; ')}.`);
    }
  }

  if (!st.makerConfirmed) {
    reasons.push(`Maker has not yet confirmed the current production specification (V${r}).`);
  }

  if (!st.review) {
    reasons.push(`Maker detail review has not been performed for V${r}.`);
  } else if (st.review.verdict === 'needs_changes') {
    reasons.push(`Maker flagged detail review as requiring changes: "${st.review.note}".`);
  }

  if (!st.quote) {
    reasons.push('No quote has been issued yet.');
  } else if (!st.quoteCurrent) {
    reasons.push(`Latest Quote #${st.quote.id} was issued for V${st.quote.revision} and is outdated for V${r}. A revised quote is required.`);
  }

  if (st.unresolvedDiscrepancies && st.unresolvedDiscrepancies.length > 0) {
    reasons.push(`${st.unresolvedDiscrepancies.length} unresolved construction discrepancy items remain open.`);
  }

  if (st.buyerAgreed) {
    return `Both maker and buyer have agreed to Quote #${st.quote.id} at Revision V${r}.`;
  }

  return reasons.join(' ');
}

/**
 * Compute the agreement status for the current workspace state.
 */
export function status(s) {
  const r = current(s).id;
  const q = s.quotes.at(-1);
  const maker = s.approvals.findLast(x => x.actor === 'maker' && x.revision === r);
  const buyer = s.approvals.findLast(x => x.actor === 'buyer' && x.revision === r && x.quoteId === q?.id);
  const reviewRecord = s.reviews.findLast(x => x.revision === r);

  const discrepancies = s.discrepancies || [];
  const currentDiscrepancies = discrepancies.filter(x => x.revision === r);
  const unresolvedDiscrepancies = currentDiscrepancies.filter(x => x.status === 'unresolved');

  const quoteCurrent = q?.revision === r;
  const makerConfirmed = !!maker;
  const detailsResolved = reviewRecord?.verdict === 'accepted' && unresolvedDiscrepancies.length === 0;
  const buyerAgreed = !!buyer && quoteCurrent && makerConfirmed && detailsResolved;

  const baseStatus = {
    revision: r,
    quote: q ?? null,
    quoteCurrent,
    makerConfirmed,
    buyerAgreed,
    review: reviewRecord ?? null,
    discrepancies: currentDiscrepancies,
    unresolvedDiscrepancies,
    preview: s.jobs.findLast(x => x.revision === r && x.status === 'success') ?? null
  };

  return {
    ...baseStatus,
    invalidationReason: buyerAgreed ? null : explainInvalidation(s, baseStatus)
  };
}

/**
 * Record maker or buyer approval.
 */
export function approve(s, actor, expected) {
  if (current(s).id !== expected) throw new Error('Revision conflict');
  if (!['buyer', 'maker'].includes(actor)) throw new Error('Invalid role');
  const st = status(s);

  if (actor === 'buyer') {
    if (!st.quoteCurrent || !st.makerConfirmed || st.review?.verdict !== 'accepted') {
      throw new Error('A current quote, maker confirmation and resolved detail review are required.');
    }
    if (st.unresolvedDiscrepancies && st.unresolvedDiscrepancies.length > 0) {
      throw new Error('All production discrepancies must be resolved before buyer agreement.');
    }
  }

  s.approvals.push({
    id: s.approvals.length + 1,
    actor,
    revision: expected,
    quoteId: actor === 'buyer' ? st.quote.id : null,
    at: new Date().toISOString()
  });

  audit(
    s,
    actor,
    actor === 'buyer'
      ? `Agreed to quoted brief (Quote #${st.quote.id}, Revision V${expected})`
      : `Confirmed production specification for Revision V${expected}`,
    expected
  );
}

/**
 * Record maker detail review.
 */
export function review(s, verdict, note, expected) {
  if (current(s).id !== expected) throw new Error('Revision conflict');
  if (!['accepted', 'needs_changes'].includes(verdict)) throw new Error('Invalid verdict');
  if (typeof note !== 'string' || !note.trim() || note.length > 1000) {
    throw new Error('Explain the detail review');
  }

  s.reviews.push({
    id: s.reviews.length + 1,
    revision: expected,
    verdict,
    note: note.trim(),
    at: new Date().toISOString()
  });

  if (verdict === 'needs_changes') {
    s.approvals = s.approvals.filter(x => x.revision !== expected);
  }

  audit(s, 'maker', `Detail review: ${verdict} — ${note.trim()}`, expected);
}
