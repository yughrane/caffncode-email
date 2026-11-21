// Helper for Lark Open API & Supabase Auth Verification
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

const LARK_APP_ID = process.env.LARK_APP_ID || 'cli_ab8b16900538de25';
const LARK_APP_SECRET = process.env.LARK_APP_SECRET || 'xNc0woskJGV6ror8E3cuffbIdXEa4UDN';

let cachedToken = null;
let tokenExpiresAt = 0;

export async function verifyUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  // Verify token with Supabase Auth
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!res.ok) {
    throw new Error('Unauthorized: Invalid or expired session');
  }

  const user = await res.json();
  let email = user.email || '';
  
  // If email domain is not caffncode.com (e.g. personal email), map to yug@caffncode.com or user's username
  if (!email.endsWith('@caffncode.com')) {
    email = 'yug@caffncode.com';
  }

  return { user, email };
}

export async function getLarkToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt > now + 60) {
    return cachedToken;
  }

  const res = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      app_id: LARK_APP_ID,
      app_secret: LARK_APP_SECRET,
    }),
  });

  const data = await res.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Failed to obtain Lark token: ${data.msg || 'Unknown error'}`);
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
