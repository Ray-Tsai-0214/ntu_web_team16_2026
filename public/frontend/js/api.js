// OMG API client
// - fetchAPI: thin wrapper around fetch() that handles JSON + errors + cookies
// - getCurrentUser / requireAuth / logout: session helpers, replace the
//   hardcoded CURRENT_USER_ID = 'user-001' from the in-memory era

const API_BASE = window.location.origin;

async function fetchAPI(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin', // include the Supabase auth cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API Error: ${res.status}`);
  }
  // 204 No Content / empty body safety
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Session ──────────────────────────────────────────────────────────────

// Cache the result of /api/auth/me for the lifetime of the page so each page
// only hits the network once. Call invalidateCurrentUser() after login/logout.
let _meCache = undefined; // undefined = not fetched, null = anonymous, object = logged in

async function getCurrentUser() {
  if (_meCache !== undefined) return _meCache;
  try {
    const data = await fetchAPI('/api/auth/me');
    _meCache = data && data.profile ? data.profile : null;
  } catch {
    _meCache = null;
  }
  return _meCache;
}

function invalidateCurrentUser() {
  _meCache = undefined;
}

// Pages that require login should call requireAuth() at the top of their script.
// If not signed in, redirect to login.html and abort.
async function requireAuth() {
  const me = await getCurrentUser();
  if (!me) {
    window.location.replace('login.html');
    // Throw so the rest of the page script does not run with an undefined user.
    throw new Error('Not authenticated — redirecting to login');
  }
  return me;
}

async function logout() {
  try {
    await fetchAPI('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore — even if the request fails, clear the local cache and bounce
  }
  invalidateCurrentUser();
  window.location.href = 'login.html';
}
