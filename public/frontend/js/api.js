// OMG API 共用工具
// 自動偵測 base URL（本地 dev vs Vercel 部署）
const API_BASE = window.location.origin;

async function fetchAPI(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API Error: ${res.status}`);
  }
  return res.json();
}

// 目前登入的使用者（先用 user-001 作為預設）
const CURRENT_USER_ID = 'user-001';
