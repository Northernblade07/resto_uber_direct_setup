// Server-only helpers for talking to Uber. Imported by the API route handlers.

export const UBER_AUTH_URL = 'https://auth.uber.com/oauth/v2/token';
export const UBER_API_BASE = 'https://api.uber.com/v1/direct';

const TIMEOUT_MS = 20000;

/**
 * Calls Uber and always resolves to a uniform shape:
 * { ok, status, data, durationMs }
 * status 0 means the request never got a response (network error / timeout).
 */
export async function forward(url, init) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }
    return { ok: res.ok, status: res.status, data, durationMs: Date.now() - started };
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      data: {
        error: timedOut
          ? `Uber did not respond within ${TIMEOUT_MS / 1000}s`
          : `Could not reach Uber: ${err?.message || String(err)}`,
      },
      durationMs: Date.now() - started,
    };
  }
}

/** Pulls the bearer token the browser sent along. */
export function bearerFrom(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/** Reads the JSON body sent by the browser, or null if it isn't valid JSON. */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function mask(secret) {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
}

/** Shape returned when our own route rejects a request before calling Uber. */
export function localError(message, status = 400) {
  return Response.json({ ok: false, status, data: { error: message }, durationMs: 0 });
}
