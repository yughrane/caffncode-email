import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

const BUILTIN_GROUPS = [
  { name: 'CaffnCode Team', email: 'team@caffncode.com', role: 'Group · Everyone', isGroup: true },
  { name: 'CaffnCode Admins', email: 'admins@caffncode.com', role: 'Group · Admins', isGroup: true },
  { name: 'Welcome Desk', email: 'welcome@caffncode.com', role: 'Onboarding', isGroup: true },
];

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await verifyUser(req);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    const byEmail = new Map();
    const addContact = (c) => {
      const em = String(c.email || '').trim().toLowerCase();
      if (!em || !em.includes('@')) return;
      const prev = byEmail.get(em);
      byEmail.set(em, {
        name: c.name || prev?.name || em.split('@')[0],
        email: em,
        role: c.role || prev?.role || '',
        avatar: c.avatar || prev?.avatar || '',
        isGroup: Boolean(c.isGroup || prev?.isGroup),
      });
    };

    BUILTIN_GROUPS.forEach(addContact);

    // 1. Fetch Lark organization directory (available to all authenticated mailbox users)
    try {
      const larkToken = await getLarkToken();
      const lRes = await fetch('https://open.larksuite.com/open-apis/contact/v3/users?department_id=0&department_id_type=open_department_id&page_size=50', {
        headers: {
          'Authorization': `Bearer ${larkToken}`,
          'User-Agent': 'CaffnCode/1.0',
        },
      });
      const lData = await lRes.json();
      if (lData.code === 0) {
        (lData.data?.items || []).forEach(u => {
          const mail = u.enterprise_email || u.email || '';
          if (mail) {
            addContact({
              name: u.name || '',
              email: mail,
              role: u.job_title || 'Team',
              avatar: u.avatar?.avatar_72 || '',
            });
          }
        });
      }
    } catch (lErr) {
      console.warn('Lark contacts lookup note:', lErr.message);
    }

    // 2. Also merge Supabase profiles if caller has read visibility
    if (token) {
      try {
        const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=display_name,username,email,mailbox,role,job_title,photo_url`, {
          headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
        });
        if (pRes.ok) {
          const rows = await pRes.json();
          (rows || []).forEach(p => {
            const mail = p.mailbox || p.email || '';
            if (mail) {
              addContact({
                name: p.display_name || p.username || '',
                email: mail,
                role: p.job_title || p.role || '',
                avatar: p.photo_url || '',
              });
            }
          });
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      contacts: [...byEmail.values()],
    });
  } catch (err) {
    console.error('Contacts API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
