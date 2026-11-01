import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('HTTP workflow, session isolation, role authorization, and complete collaboration flow', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mb-test-'));
  const port = '31989';
  const proc = spawn(process.execPath, ['src/server.mjs'], {
    env: { ...process.env, PORT: port, HOST: '127.0.0.1', DATA_DIR: dir, ENABLE_LIVE: 'false' }
  });

  try {
    await new Promise((resolve, reject) => {
      proc.stdout.once('data', resolve);
      proc.once('error', reject);
      proc.once('exit', () => reject(new Error('Server exited early')));
    });

    const base = `http://127.0.0.1:${port}`;

    // 1. Initial Buyer Session
    const resA = await fetch(`${base}/api/state`);
    const cookieA = resA.headers.get('set-cookie').split(';')[0];
    const stateA = await resA.json();

    assert.equal(stateA.computed.revision, 1);
    assert.equal(stateA.role, 'buyer');
    assert.ok(stateA.makerKey, 'Maker key must be generated');

    const post = (route, body, origin, cookie = cookieA, query = '') =>
      fetch(`${base}/api/${route}${query}`, {
        method: 'POST',
        headers: {
          Cookie: cookie,
          'Content-Type': 'application/json',
          ...(origin ? { Origin: origin } : {})
        },
        body: JSON.stringify(body)
      });

    // 2. Buyer modifies brief to revision 2
    const revRes = await post('revise', {
      expected: 1,
      spec: { ...stateA.revisions[0].spec, trim: 'Woven edge' }
    });
    assert.equal(revRes.status, 200);

    const stateV2 = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookieA } })).json();
    assert.equal(stateV2.computed.revision, 2);

    // 3. Isolated session check: another client with no cookie gets revision 1
    const resOther = await fetch(`${base}/api/state`);
    const stateOther = await resOther.json();
    assert.equal(stateOther.computed.revision, 1);

    // 4. Role Authorization: Buyer cannot issue quote or approve as maker
    const buyerQuoteRes = await post('quote', {
      expected: 2,
      lines: [{ label: 'Custom', amount: 50000 }],
      currency: 'NPR',
      days: 10
    });
    assert.equal(buyerQuoteRes.status, 403, 'Buyer must be forbidden from issuing quotes');

    const buyerMakerApproveRes = await post('approve', { actor: 'maker', expected: 2 });
    assert.equal(buyerMakerApproveRes.status, 403, 'Buyer must be forbidden from confirming as maker');

    // 5. Maker Session: Access via makerKey
    const makerKey = stateV2.makerKey;
    const resMaker = await fetch(`${base}/api/state?makerKey=${makerKey}`, {
      headers: { Cookie: cookieA }
    });
    const cookieMaker = resMaker.headers.get('set-cookie')
      ? resMaker.headers.get('set-cookie').split(';')[0]
      : cookieA;
    const stateMaker = await resMaker.json();
    assert.equal(stateMaker.role, 'maker', 'Session must be authenticated as maker');

    // Maker cannot revise buyer brief or approve as buyer
    const makerReviseRes = await post(
      'revise',
      {
        expected: 2,
        spec: { ...stateV2.revisions[1].spec, material: 'Wool blend' }
      },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(makerReviseRes.status, 403, 'Maker must be forbidden from revising buyer brief');

    const makerBuyerApproveRes = await post(
      'approve',
      { actor: 'buyer', expected: 2 },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(makerBuyerApproveRes.status, 403, 'Maker must be forbidden from accepting quote as buyer');

    // 6. Maker actions: Confirm specification, record discrepancy, resolve discrepancy, review, and issue quote
    const confirmRes = await post(
      'approve',
      { actor: 'maker', expected: 2 },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(confirmRes.status, 200);

    const discRes = await post(
      'discrepancy',
      {
        field: 'trim',
        issue: 'Woven edge requires manual needle finishing not shown in illustration',
        expected: 2
      },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(discRes.status, 200);

    // Unresolved discrepancy blocks buyer agreement
    const earlyAgreeRes = await post('approve', { actor: 'buyer', expected: 2 });
    assert.equal(earlyAgreeRes.status, 400);

    // Resolve discrepancy
    const resolveRes = await post(
      'discrepancy/resolve',
      {
        discrepancyId: 1,
        resolution: 'Confirmed 0.8cm hand-woven selvedge edge to be applied during construction',
        expected: 2
      },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(resolveRes.status, 200);

    // Detail review: accepted
    const reviewRes = await post(
      'review',
      { verdict: 'accepted', note: 'All construction details reviewed with workshop', expected: 2 },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(reviewRes.status, 200);

    // Issue quote
    const quoteRes = await post(
      'quote',
      {
        expected: 2,
        lines: [
          { label: 'Cotton twill fabric', amount: 350000 },
          { label: 'Tailoring & hand-finished woven edge', amount: 300000 }
        ],
        currency: 'NPR',
        days: 18
      },
      null,
      cookieMaker,
      `?makerKey=${makerKey}`
    );
    assert.equal(quoteRes.status, 200);

    // 7. Buyer agrees to the quoted revision
    const buyerAgreeRes = await post('approve', { actor: 'buyer', expected: 2 });
    assert.equal(buyerAgreeRes.status, 200);

    const stateFinal = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookieA } })).json();
    assert.equal(stateFinal.computed.buyerAgreed, true);
    assert.equal(stateFinal.computed.quoteCurrent, true);
    assert.equal(stateFinal.computed.makerConfirmed, true);

    // 8. Cross-origin protection
    assert.equal((await post('reset', {}, 'https://evil.example')).status, 403);

    // 9. Static file serving and 404 for forbidden paths
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/app.js`)).status, 200);
    assert.equal((await fetch(`${base}/style.css`)).status, 200);
    assert.equal((await fetch(`${base}/assets/jacket.svg`)).status, 200);
    assert.equal((await fetch(`${base}/.env`)).status, 404);

    // 10. Clean workspace deletion
    assert.equal((await post('delete', {})).status, 200);
  } finally {
    proc.kill();
    await new Promise(r => proc.once('exit', r));
    await rm(dir, { recursive: true, force: true });
  }
});
