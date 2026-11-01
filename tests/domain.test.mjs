import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initial,
  current,
  revise,
  quote,
  approve,
  review,
  status,
  addDiscrepancy,
  resolveDiscrepancy,
  diffRevisions,
  explainInvalidation,
  options
} from '../src/domain.mjs';

const price = (s, curr = 'NPR', days = 14) =>
  quote(
    s,
    {
      lines: [
        { label: 'Material', amount: 350000 },
        { label: 'Craft', amount: 250000 }
      ],
      currency: curr,
      days
    },
    current(s).id
  );

test('buyer agreement needs quote, maker and detail review', () => {
  const s = initial();
  assert.throws(() => approve(s, 'buyer', 1));
  price(s);
  approve(s, 'maker', 1);
  assert.throws(() => approve(s, 'buyer', 1));
  review(s, 'accepted', 'Details confirmed with sample', 1);
  approve(s, 'buyer', 1);
  assert.equal(status(s).buyerAgreed, true);
});

test('spec change invalidates agreements, quote and review without deleting history', () => {
  const s = initial();
  price(s);
  approve(s, 'maker', 1);
  review(s, 'accepted', 'Confirmed', 1);
  approve(s, 'buyer', 1);
  revise(s, { ...current(s).spec, trim: 'Woven edge' }, 1);
  assert.equal(status(s).quoteCurrent, false);
  assert.equal(status(s).makerConfirmed, false);
  assert.equal(status(s).buyerAgreed, false);
  assert.equal(status(s).review, null);
  assert.equal(s.approvals.length, 2);
  assert.equal(s.quotes.length, 1);
  assert.throws(() => approve(s, 'buyer', 2));
});

test('new quote needs renewed buyer agreement', () => {
  const s = initial();
  price(s);
  approve(s, 'maker', 1);
  review(s, 'accepted', 'Confirmed', 1);
  approve(s, 'buyer', 1);
  price(s);
  assert.equal(status(s).buyerAgreed, false);
});

test('unresolved detail revokes existing agreement', () => {
  const s = initial();
  price(s);
  approve(s, 'maker', 1);
  review(s, 'accepted', 'Confirmed', 1);
  approve(s, 'buyer', 1);
  review(s, 'needs_changes', 'Closure differs from original', 1);
  assert.equal(status(s).buyerAgreed, false);
  assert.equal(status(s).makerConfirmed, false);
});

test('reject stale and invalid mutations', () => {
  const s = initial();
  assert.throws(() => revise(s, { ...current(s).spec, material: 'Imaginary silk' }, 1));
  assert.throws(() => revise(s, current(s).spec, 0));
  assert.throws(() => quote(s, { lines: [{ label: 'x', amount: -1 }], currency: 'NPR', days: 1 }, 1));
  assert.throws(() => quote(s, { lines: [{ label: 'x', amount: 1.2 }], currency: 'NPR', days: 1 }, 1));
  assert.throws(() => approve(s, 'admin', 1));
});

test('identical revision does not create a new version', () => {
  const s = initial();
  revise(s, current(s).spec, 1);
  assert.equal(s.revisions.length, 1);
});

test('unresolved production discrepancy blocks buyer agreement and revokes existing agreement', () => {
  const s = initial();
  price(s);
  approve(s, 'maker', 1);
  review(s, 'accepted', 'Look matches physical template', 1);
  approve(s, 'buyer', 1);
  assert.equal(status(s).buyerAgreed, true);

  // Add an unresolved discrepancy (e.g. preview collar differs from banded pattern)
  const item = addDiscrepancy(s, {
    field: 'collar',
    issue: 'Generated preview shows spread lapel; requested stand collar requires traditional 3.5cm band',
    expected: 1
  });
  assert.equal(item.status, 'unresolved');
  assert.equal(status(s).buyerAgreed, false);
  assert.throws(() => approve(s, 'buyer', 1), /discrepancies must be resolved/);

  // Resolve the discrepancy
  resolveDiscrepancy(s, item.id, 'Confirmed 3.5cm stand band pattern drafted and approved by maker', 1);
  const stResolved = status(s);
  assert.equal(stResolved.unresolvedDiscrepancies.length, 0);

  // Re-approve as buyer
  approve(s, 'buyer', 1);
  assert.equal(status(s).buyerAgreed, true);
});

test('diffRevisions accurately identifies changed attributes and provides human summary', () => {
  const s = initial();
  const v1 = current(s);
  revise(s, { ...v1.spec, collar: 'Shawl collar', trim: 'Contrast piping' }, 1);
  const v2 = current(s);
  const diffs = diffRevisions(v1, v2);

  assert.equal(diffs.length, 2);
  assert.equal(diffs[0].field, 'collar');
  assert.equal(diffs[0].from, 'Stand collar');
  assert.equal(diffs[0].to, 'Shawl collar');
  assert.equal(diffs[1].field, 'trim');
  assert.equal(diffs[1].from, 'No trim');
  assert.equal(diffs[1].to, 'Contrast piping');
});

test('explainInvalidation details exact blockers across revisions', () => {
  const s = initial();
  const reason1 = explainInvalidation(s, status(s));
  assert.match(reason1, /Maker has not yet confirmed/);
  assert.match(reason1, /No quote has been issued/);

  price(s);
  approve(s, 'maker', 1);
  review(s, 'accepted', 'All good', 1);
  approve(s, 'buyer', 1);
  assert.equal(explainInvalidation(s, status(s)), 'Both maker and buyer have agreed to Quote #1 at Revision V1.');

  // After revision V2
  revise(s, { ...current(s).spec, material: 'Wool blend' }, 1);
  const reason2 = explainInvalidation(s, status(s));
  assert.match(reason2, /Revision V2 contains specification updates/);
  assert.match(reason2, /Quote #1 was issued for V1 and is outdated/);
});

test('measurements parsing and validation', () => {
  const s = initial();
  revise(
    s,
    {
      ...current(s).spec,
      measurements: { unit: 'cm', chest: 104, shoulder: 47, sleeve: 65, length: 73 }
    },
    1
  );
  assert.equal(current(s).id, 2);
  assert.equal(current(s).spec.measurements.chest, 104);

  // Reject invalid measurements
  assert.throws(
    () =>
      revise(
        s,
        {
          ...current(s).spec,
          measurements: { unit: 'cm', chest: -50 }
        },
        2
      ),
    /Invalid measurement/
  );
});

test('currency and integer minor unit constraints', () => {
  const s = initial();
  // Valid currencies
  const qUSD = quote(s, { lines: [{ label: 'Garment', amount: 45000 }], currency: 'USD', days: 21 }, 1);
  assert.equal(qUSD.currency, 'USD');
  assert.equal(qUSD.total, 45000);

  const qGBP = quote(s, { lines: [{ label: 'Garment', amount: 35000 }], currency: 'GBP', days: 14 }, 1);
  assert.equal(qGBP.currency, 'GBP');

  // Unsupported currency
  assert.throws(() => quote(s, { lines: [{ label: 'Garment', amount: 100 }], currency: 'BTC', days: 5 }, 1), /Unsupported currency/);

  // Lead time out of bounds
  assert.throws(() => quote(s, { lines: [{ label: 'Garment', amount: 100 }], currency: 'USD', days: 0 }, 1), /Lead time/);
  assert.throws(() => quote(s, { lines: [{ label: 'Garment', amount: 100 }], currency: 'USD', days: 366 }, 1), /Lead time/);
});
