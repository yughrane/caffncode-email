import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user, email } = await verifyUser(req);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    let body = {};
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const action = req.query.action || body.action || (req.method === 'DELETE' ? 'delete' : '');
    const messageId = req.query.id || body.id;
    const ids = Array.isArray(body.ids) ? body.ids : (messageId ? [messageId] : []);

    // ── 1. DELETE / TRASH ACTION ──
    if (action === 'delete') {
      if (!messageId && !ids.length) {
        return res.status(400).json({ success: false, error: 'Message ID is required' });
      }

      const targetId = messageId || ids[0];

      // A) If message is from Supabase sent_emails table (UUID)
      if (!targetId.startsWith('om_')) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/sent_emails?id=eq.${encodeURIComponent(targetId)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
          });
        } catch (dbErr) {
          console.warn('Could not remove from sent_emails:', dbErr.message);
        }
      }

      // B) Delete/Trash in Lark Suite Mail via batch_trash API
      const larkToken = await getLarkToken();
      const larkRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_trash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${larkToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'CaffnCode/1.0',
        },
        body: JSON.stringify({ message_ids: [targetId] }),
      });

      const text = await larkRes.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { msg: text }; }

      if (!larkRes.ok || (data.code !== undefined && data.code !== 0)) {
        const errMsg = data.msg || data.message || `Lark code ${data.code || larkRes.status}`;
        console.warn('Lark batch_trash note:', errMsg);
      }

      return res.status(200).json({ success: true, messageId: targetId });
    }

    // ── 2. MARK ALL AS READ / MARK READ ──
    if (action === 'mark_all_read' || action === 'mark_read') {
      return res.status(200).json({
        success: true,
        action,
        count: ids.length,
        folder: body.folder || req.query.folder || '',
      });
    }

    return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
  } catch (err) {
    console.error('Action API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
