/**
 * MakerBrief Server
 * 
 * HTTP server providing session isolation, dual-role workspace authentication
 * (buyer and maker), optimistic concurrency validation, transactional persistence,
 * security headers, and YouCam Clothes V4 task orchestration.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  initial,
  current,
  revise,
  quote,
  approve,
  review,
  status,
  audit,
  options,
  addDiscrepancy,
  resolveDiscrepancy,
  diffRevisions
} from './domain.mjs';
import { allowedImage, createTask, request, normalize } from './youcam.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.DATA_DIR || path.join(root, 'data');
fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

const sessions = new Map();
const sessionLocks = new Map();

const live = process.env.ENABLE_LIVE === 'true' && Boolean(process.env.YOUCAM_API_KEY);
const hosts = (process.env.IMAGE_HOSTS || '')
  .split(',')
  .map(x => x.trim())
  .filter(Boolean);
const cap = Number(process.env.MAX_LIVE_JOBS || 20);

/**
 * Executes an asynchronous function under a per-workspace mutex lock.
 */
async function withLock(id, fn) {
  let prev = sessionLocks.get(id) || Promise.resolve();
  let release;
  const next = new Promise(resolve => {
    release = resolve;
  });
  sessionLocks.set(id, prev.then(() => next));
  try {
    return await fn();
  } finally {
    release();
    if (sessionLocks.get(id) === next) {
      sessionLocks.delete(id);
    }
  }
}

/**
 * Persists workspace state transactionally using atomic temporary file write and rename.
 */
function persist(id, s) {
  const p = path.join(dir, id + '.json');
  fs.writeFileSync(p + '.tmp', JSON.stringify(s, null, 2), { mode: 0o600 });
  fs.renameSync(p + '.tmp', p);
}

/**
 * Retrieves or initializes workspace state.
 */
function state(id) {
  if (!sessions.has(id)) {
    const p = path.join(dir, id + '.json');
    if (fs.existsSync(p)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(p, 'utf8'));
        // Ensure auth keys exist
        if (!loaded.auth) {
          loaded.auth = {
            buyerKey: crypto.randomBytes(16).toString('hex'),
            makerKey: crypto.randomBytes(16).toString('hex')
          };
        }
        sessions.set(id, loaded);
      } catch {
        sessions.set(id, initWorkspace());
      }
    } else {
      const s = initWorkspace();
      sessions.set(id, s);
      persist(id, s);
    }
  }
  return sessions.get(id);
}

/**
 * Creates initial workspace state with distinct auth keys.
 */
function initWorkspace() {
  const s = initial();
  s.auth = {
    buyerKey: crypto.randomBytes(16).toString('hex'),
    makerKey: crypto.randomBytes(16).toString('hex')
  };
  return s;
}

/**
 * Helper to respond with JSON.
 */
function reply(res, code, data, headers = {}) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(JSON.stringify(data));
}

/**
 * Safely parses JSON request body with 16KB limit.
 */
async function body(req) {
  let size = 0;
  const buf = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new Error('Request payload exceeds 16KB limit');
    buf.push(chunk);
  }
  const raw = Buffer.concat(buf).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Malformed JSON payload');
  }
}

/**
 * Asynchronously polls YouCam Clothes V4 task until completion, failure, or timeout.
 */
async function poll(id, jobId) {
  const s = state(id);
  const j = s.jobs?.find(x => x.id === jobId);
  if (!j?.taskId || !['running', 'submitted'].includes(j.status)) return;

  try {
    const result = normalize(
      await request(`/s2s/v2.0/task/cloth-v4/${encodeURIComponent(j.taskId)}`, {
        key: process.env.YOUCAM_API_KEY
      })
    );
    Object.assign(j, result);
    j.attempts = (j.attempts || 0) + 1;
    if (j.status === 'running' && j.attempts >= 60) {
      j.status = 'timed_out';
      j.message = 'Local polling stopped after 10 minutes. Provider completion is unknown.';
    }
    persist(id, s);
  } catch {
    j.status = 'failed';
    j.message = 'Could not retrieve provider result. Operator should inspect the task before retrying.';
    persist(id, s);
  }

  if (j.status === 'running') {
    setTimeout(() => poll(id, jobId), 10000).unref();
  }
}

/**
 * Main HTTP Server.
 */
export const server = http.createServer(async (req, res) => {
  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
  );

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/api/')) {
      const cookies = req.headers.cookie || '';
      let id = cookies.match(/(?:^|; )mb=([a-f0-9]{48})(?:;|$)/)?.[1];

      // Support workspace linkage via ?ws=<id> for cross-browser collaboration
      const paramWs = url.searchParams.get('ws');
      if (paramWs && /^[a-f0-9]{48}$/.test(paramWs) && fs.existsSync(path.join(dir, paramWs + '.json'))) {
        id = paramWs;
      }

      if (!id) {
        id = crypto.randomBytes(24).toString('hex');
      }

      const s = state(id);

      // Role Authentication:
      // Check query param (?makerKey=...) or bearer token or cookie
      const paramMakerKey = url.searchParams.get('makerKey');
      const paramRole = url.searchParams.get('role');
      const authHeader = req.headers.authorization || '';
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      const cookieMakerAuth = cookies.match(/(?:^|; )mb_maker_auth=([a-f0-9]{32})(?:;|$)/)?.[1];

      let role = 'buyer'; // default workspace creator is buyer
      const setCookies = [`mb=${id}; HttpOnly; SameSite=Strict; Path=/`];

      if (
        (paramMakerKey && paramMakerKey === s.auth?.makerKey) ||
        (bearerToken && bearerToken === s.auth?.makerKey) ||
        (cookieMakerAuth && cookieMakerAuth === s.auth?.makerKey)
      ) {
        role = 'maker';
        setCookies.push(`mb_maker_auth=${s.auth.makerKey}; HttpOnly; SameSite=Strict; Path=/`);
      } else if (paramRole === 'buyer') {
        role = 'buyer';
      }

      res.setHeader('Set-Cookie', setCookies);

      // GET /api/state returns current state and computed properties
      if (req.method === 'GET' && url.pathname === '/api/state') {
        const computed = status(s);
        const { auth, ...publicState } = s;
        return reply(res, 200, {
          ...publicState,
          workspaceId: id,
          computed,
          options,
          live,
          role,
          makerKey: s.auth?.makerKey,
          buyerKey: s.auth?.buyerKey
        });
      }

      if (req.method !== 'POST') {
        return reply(res, 405, { error: 'Method not allowed' });
      }

      // Cross-origin protection
      if (req.headers.origin) {
        const expectedHttp = `http://${req.headers.host}`;
        const expectedHttps = `https://${req.headers.host}`;
        if (req.headers.origin !== expectedHttp && req.headers.origin !== expectedHttps) {
          return reply(res, 403, { error: 'Cross-origin request blocked' });
        }
      }

      if (!req.headers['content-type']?.startsWith('application/json')) {
        return reply(res, 415, { error: 'JSON required' });
      }

      const b = await body(req);

      return await withLock(id, async () => {
        switch (url.pathname) {
          case '/api/revise': {
            if (role !== 'buyer') {
              return reply(res, 403, { error: 'Only the buyer may revise the commission brief specification.' });
            }
            revise(s, b.spec, b.expected);
            break;
          }

          case '/api/quote': {
            if (role !== 'maker') {
              return reply(res, 403, { error: 'Only the maker may issue quotes.' });
            }
            quote(s, b, b.expected);
            break;
          }

          case '/api/review': {
            if (role !== 'maker') {
              return reply(res, 403, { error: 'Only the maker may conduct detail reviews.' });
            }
            review(s, b.verdict, b.note, b.expected);
            break;
          }

          case '/api/discrepancy': {
            if (role !== 'maker') {
              return reply(res, 403, { error: 'Only the maker may record production discrepancies.' });
            }
            addDiscrepancy(s, {
              field: b.field,
              issue: b.issue,
              resolution: b.resolution,
              expected: b.expected
            });
            break;
          }

          case '/api/discrepancy/resolve': {
            if (role !== 'maker') {
              return reply(res, 403, { error: 'Only the maker may resolve production discrepancies.' });
            }
            resolveDiscrepancy(s, b.discrepancyId, b.resolution, b.expected);
            break;
          }

          case '/api/approve': {
            // Verify actor permission matches authenticated role
            if (b.actor === 'maker' && role !== 'maker') {
              return reply(res, 403, { error: 'Only the maker may confirm production feasibility.' });
            }
            if (b.actor === 'buyer' && role !== 'buyer') {
              return reply(res, 403, { error: 'Only the buyer may accept the commission quote.' });
            }
            approve(s, b.actor, b.expected);
            break;
          }

          case '/api/reset': {
            if (s.jobs.some(j => ['submitting', 'running', 'submitted'].includes(j.status))) {
              throw new Error('Wait for active processing before resetting');
            }
            sessions.set(id, initWorkspace());
            persist(id, state(id));
            return reply(res, 200, { ok: true });
          }

          case '/api/delete': {
            if (s.jobs.some(j => ['submitting', 'running', 'submitted'].includes(j.status))) {
              throw new Error('Wait for active processing before deleting');
            }
            sessions.delete(id);
            fs.rmSync(path.join(dir, id + '.json'), { force: true });
            res.setHeader('Set-Cookie', [
              'mb=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/',
              'mb_maker_auth=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/'
            ]);
            return reply(res, 200, { ok: true });
          }

          case '/api/preview': {
            if (current(s).id !== b.expected) throw new Error('Revision conflict');
            if (s.jobs.length >= 50) throw new Error('Session preview limit reached');

            const j = {
              id: crypto.randomUUID(),
              revision: b.expected,
              status: 'success',
              provenance: 'illustration',
              image: '/assets/jacket.svg',
              at: new Date().toISOString()
            };

            if (b.mode === 'live') {
              if (!live) throw new Error('Live processing is not enabled');
              if (b.consent !== true) throw new Error('Explicit photo consent required');

              const ledger = path.join(dir, 'live-count.txt');
              const count = fs.existsSync(ledger) ? Number(fs.readFileSync(ledger, 'utf8')) : 0;
              if (count >= cap) throw new Error('Operator live-job cap reached');
              if (s.jobs.some(x => ['running', 'submitting', 'submitted'].includes(x.status))) {
                throw new Error('A job is already running');
              }

              const source = allowedImage(b.source, hosts);
              const ref = allowedImage(b.reference, hosts);

              fs.writeFileSync(ledger, String(count + 1), { mode: 0o600 });
              j.consentAt = new Date().toISOString();
              j.sourceUrlHash = crypto.createHash('sha256').update(source).digest('hex');
              j.referenceUrlHash = crypto.createHash('sha256').update(ref).digest('hex');
              j.provenance = 'live_youcam';
              j.status = 'submitting';
              delete j.image;
              s.jobs.push(j);
              persist(id, s);

              try {
                j.taskId = await createTask(source, ref, process.env.YOUCAM_API_KEY);
                j.status = 'running';
                persist(id, s);
                setTimeout(() => poll(id, j.id), 1000).unref();
              } catch {
                j.status = 'submission_unknown';
                j.message = 'Submission failed or timed out. Do not resubmit until operator checks provider history.';
                persist(id, s);
              }

              return reply(res, 200, { ok: true });
            }

            s.jobs.push(j);
            audit(s, role, 'Illustrative preview opened', b.expected);
            break;
          }

          default:
            return reply(res, 404, { error: 'Not found' });
        }

        persist(id, s);
        return reply(res, 200, { ok: true });
      });
    }

    // Static Asset Serving
    if (req.method !== 'GET') {
      return reply(res, 405, { error: 'Method not allowed' });
    }

    const files = {
      '/': 'index.html',
      '/app.js': 'app.js',
      '/style.css': 'style.css',
      '/assets/jacket.svg': 'assets/jacket.svg'
    };

    const targetFile = files[url.pathname];
    if (!targetFile) {
      return reply(res, 404, { error: 'Not found' });
    }

    const filePath = path.join(root, 'public', targetFile);
    if (!fs.existsSync(filePath)) {
      return reply(res, 404, { error: 'Not found' });
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.svg': 'image/svg+xml'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    reply(res, 400, { error: e.message || 'Request failed' });
  }
});

// Resumes background polling for running jobs on server startup
export function resumePolling() {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir).filter(x => /^[a-f0-9]{48}\.json$/.test(x))) {
    const id = f.slice(0, -5);
    try {
      const s = state(id);
      for (const j of s.jobs || []) {
        if (['running', 'submitted'].includes(j.status)) {
          setTimeout(() => poll(id, j.id), 1000).unref();
        }
      }
    } catch {
      // Ignore unparseable files
    }
  }
}

// Start server if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  server.listen(port, host, () => {
    console.log(`MakerBrief ready at http://${host}:${port}`);
    resumePolling();
  });
}
