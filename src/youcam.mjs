/**
 * MakerBrief YouCam Provider Adapter
 * 
 * Handles authenticated server-side communication with YouCam Clothes V4 API.
 * Validates HTTPS image host allowlists, creates durable background tasks,
 * and normalizes provider status responses.
 */

const BASE = 'https://yce-api-01.makeupar.com';

/**
 * Validates that an image URL is secure HTTPS, uses standard port 443,
 * contains no credentials, and belongs to an exact operator-approved host.
 */
export function allowedImage(value, hosts = []) {
  let u;
  try {
    u = new URL(value);
  } catch {
    throw new Error('Use a valid HTTPS image URL');
  }

  if (
    u.protocol !== 'https:' ||
    u.username ||
    u.password ||
    (u.port && u.port !== '443') ||
    !hosts.includes(u.hostname)
  ) {
    throw new Error('Image host is not approved by the operator');
  }

  return u.href;
}

/**
 * Performs authenticated JSON HTTP request to YouCam API endpoint.
 */
export async function request(path, { key, method = 'GET', body, fetcher = fetch, timeoutMs = 25000 }) {
  if (!key || typeof key !== 'string') {
    throw new Error('YouCam API key is required on the server');
  }

  const res = await fetcher(BASE + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'error'
  });

  if (!res.ok) {
    throw new Error(`Provider HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.data) {
    throw new Error('Unexpected provider response');
  }

  return json.data;
}

/**
 * Submits Clothes V4 task to YouCam API.
 * Uses outer category, strict multi-person filtering, and no shoe replacement.
 */
export async function createTask(source, reference, key, { fetcher = fetch } = {}) {
  const data = await request('/s2s/v2.0/task/cloth-v4', {
    key,
    method: 'POST',
    body: {
      src_file_url: source,
      ref_file_url: reference,
      garment_category: 'outer',
      filter_multi_person: 'strict',
      change_shoes: false
    },
    fetcher
  });

  if (typeof data.task_id !== 'string' || !data.task_id.trim()) {
    throw new Error('Provider omitted task ID');
  }

  return data.task_id;
}

/**
 * Normalizes provider task query response into a structured job status.
 */
export function normalize(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid provider status payload');
  }

  if (data.task_status === 'error') {
    return {
      status: 'failed',
      message: data.error_message || 'Provider could not process these images.'
    };
  }

  if (data.task_status !== 'success') {
    return {
      status: 'running',
      progress: typeof data.progress === 'number' ? data.progress : null
    };
  }

  // Extract result image URL
  const raw = data.results?.url ?? data.results?.[0]?.download_url;
  if (!raw || typeof raw !== 'string') {
    throw new Error('Unexpected provider result shape');
  }

  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('Unexpected provider result shape');
  }

  if (u.protocol !== 'https:') {
    throw new Error('Invalid provider image URL');
  }

  return {
    status: 'success',
    image: u.href
  };
}
