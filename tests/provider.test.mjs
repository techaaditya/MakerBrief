import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, allowedImage, request, createTask } from '../src/youcam.mjs';

test('normalize job states and reject malformed success', () => {
  assert.equal(normalize({ task_status: 'running' }).status, 'running');
  assert.equal(normalize({ task_status: 'error' }).status, 'failed');
  assert.equal(normalize({ task_status: 'error', error_message: 'Image blurred' }).message, 'Image blurred');
  assert.equal(normalize({ task_status: 'success', results: { url: 'https://example.com/a.jpg' } }).status, 'success');
  assert.equal(normalize({ task_status: 'success', results: [{ download_url: 'https://example.com/b.jpg' }] }).status, 'success');

  assert.throws(() => normalize({ task_status: 'success', results: { url: 'javascript:alert(1)' } }), /Invalid provider image URL/);
  assert.throws(() => normalize({ task_status: 'success', results: { url: 'http://insecure.example.com/a.jpg' } }), /Invalid provider image URL/);
  assert.throws(() => normalize({ task_status: 'success' }), /Unexpected provider result shape/);
  assert.throws(() => normalize(null), /Invalid provider status payload/);
});

test('image URLs require explicit exact host approval', () => {
  assert.equal(allowedImage('https://photos.example/a.jpg', ['photos.example']), 'https://photos.example/a.jpg');
  for (const u of [
    'http://photos.example/a',
    'https://evil.example/a',
    'https://photos.example.evil/a',
    'https://user:pass@photos.example/a',
    'https://photos.example:444/a',
    'ftp://photos.example/a.jpg',
    'not-a-url'
  ]) {
    assert.throws(() => allowedImage(u, ['photos.example']));
  }
});

test('provider authentication stays in server request and HTTP errors surface', async () => {
  let seen;
  await request('/test', {
    key: 'fake-test-key',
    fetcher: async (u, o) => {
      seen = o;
      return { ok: true, json: async () => ({ data: { task_id: 'fake' } }) };
    }
  });

  assert.equal(seen.headers.Authorization, 'Bearer fake-test-key');
  assert.equal(seen.redirect, 'error');

  await assert.rejects(
    request('/test', {
      key: 'fake',
      fetcher: async () => ({ ok: false, status: 429 })
    }),
    /429/
  );

  await assert.rejects(
    request('/test', {
      key: 'fake',
      fetcher: async () => ({ ok: true, json: async () => ({}) })
    }),
    /Unexpected provider response/
  );
});

test('createTask sends proper Clothes V4 schema and requires valid task_id', async () => {
  let payload;
  const taskId = await createTask(
    'https://storage.example/model.jpg',
    'https://storage.example/jacket.jpg',
    'test-key',
    {
      fetcher: async (u, o) => {
        payload = JSON.parse(o.body);
        return { ok: true, json: async () => ({ data: { task_id: 'task_abc_123' } }) };
      }
    }
  );

  assert.equal(taskId, 'task_abc_123');
  assert.equal(payload.garment_category, 'outer');
  assert.equal(payload.filter_multi_person, 'strict');
  assert.equal(payload.change_shoes, false);
  assert.equal(payload.src_file_url, 'https://storage.example/model.jpg');
  assert.equal(payload.ref_file_url, 'https://storage.example/jacket.jpg');
});
