// Browser-side helpers: calling our API routes, token storage, clipboard.

const AUTH_KEY = 'uberDirect.auth.v1';

export async function apiPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, status: 0, data: { error: `Could not reach the app server: ${err.message}` } };
  }
}

/** Turns Uber's (or our) error payload into one readable line. */
export function errorMessage(result) {
  const d = result?.data;
  const text =
    (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error_description === 'string' && d.error_description) ||
    (typeof d?.error === 'string' && d.error) ||
    (typeof d?.raw === 'string' && d.raw.slice(0, 200)) ||
    '';
  const status = result?.status ? `HTTP ${result.status}` : 'Network error';
  if (result?.status === 401) return `${status} — the token was rejected. Get a new token in step 3. ${text}`.trim();
  return text ? `${status} — ${text}` : `${status} — request failed`;
}

// ---- token storage (the token is valid ~30 days, so we keep it between visits) ----

export function saveAuth(result) {
  const expiresIn = Number(result.data.expires_in) || 0;
  const auth = {
    token: result.data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
    savedAt: Date.now(),
    result,
  };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // storage unavailable (private mode) — the token still works for this session
  }
  return auth;
}

export function loadAuth() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    if (auth?.token && auth.expiresAt > Date.now() + 60_000) return auth;
  } catch {
    // ignore
  }
  return null;
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}

export function timeLeft(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'expired';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d left`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
}

// ---- clipboard (falls back for plain-http internal hosts where navigator.clipboard is blocked) ----

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}
