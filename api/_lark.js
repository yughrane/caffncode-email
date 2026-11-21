// Helper for Lark Open API & Supabase Auth Verification
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

const LARK_APP_ID = process.env.LARK_APP_ID;
const LARK_APP_SECRET = process.env.LARK_APP_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/**
 * Verifies the Supabase session and resolves which Lark mailbox the user may access.
 * Mailbox = profiles.mailbox (set by a super admin) or, failing that, the user's own
 * auth email if it is an @caffncode.com address. No mailbox → 403.
 */
export async function verifyUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw httpError(401, 'Unauthorized: No token provided');

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!res.ok) throw httpError(401, 'Unauthorized: Invalid or expired session');
  const user = await res.json();

  // Read own profile with the user's token (RLS: users can read their own row)
  let profile = null;
  try {
    const pRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=mailbox,display_name,username,role`,
      { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY } },
    );
    if (pRes.ok) profile = (await pRes.json())?.[0] || null;
  } catch { /* ignore */ }

  const authEmail = (user.email || '').toLowerCase();
  const mailbox = (profile?.mailbox || (authEmail.endsWith('@caffncode.com') ? authEmail : '')).toLowerCase();
  if (!mailbox) {
    throw httpError(403, 'No mailbox assigned to your account. Ask a super admin to assign one.');
  }

  return {
    user,
    email: mailbox,
    displayName: profile?.display_name || profile?.username || mailbox.split('@')[0],
    role: profile?.role || 'member',
  };
}

export async function getLarkToken() {
  if (!LARK_APP_ID || !LARK_APP_SECRET) {
    throw httpError(500, 'Server is missing LARK_APP_ID / LARK_APP_SECRET');
  }
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt > now + 60) return cachedToken;

  const res = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
  });

  const data = await res.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw httpError(502, `Failed to obtain Lark token: ${data.msg || 'Unknown error'}`);
  }

  cachedToken = data.tenant_access_token;
  tokenExpiresAt = now + (data.expire || 7200);
  return cachedToken;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function errorStatus(err) {
  if (err.status) return err.status;
  return /Unauthorized/.test(err.message) ? 401 : 500;
}
