import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function chunkArray(arr, size = 20) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function larkBatchPost(email, larkToken, endpoint, basePayload, ids) {
  const larkIds = ids.filter(id => id && !UUID_RE.test(id));
  if (!larkIds.length) return;
  for (const chunk of chunkArray(larkIds, 20)) {
    const larkRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${larkToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'CaffnCode/1.0',
      },
      body: JSON.stringify({ ...basePayload, message_ids: chunk }),
    });
    const text = await larkRes.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { msg: text }; }
    if (!larkRes.ok || (data.code !== undefined && data.code !== 0)) {
      console.warn(`Lark ${endpoint} warning:`, data.msg || larkRes.status);
    }
  }
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    let body = {};
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const action = req.query.action || body.action || (req.method === 'DELETE' ? 'delete' : '');
    const messageId = req.query.id || body.id;
    const ids = Array.isArray(body.ids) && body.ids.length
      ? body.ids.map(String).filter(Boolean)
      : (messageId ? [String(messageId)] : []);

    if (!ids.length && action !== 'mark_all_read') {
      return res.status(400).json({ success: false, error: 'At least one message ID is required' });
    }

    const larkToken = await getLarkToken();

    // ── 1. DELETE / TRASH ──
    if (action === 'delete') {
      const uuidIds = ids.filter(id => UUID_RE.test(id));
      for (const uid of uuidIds) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/sent_emails?id=eq.${encodeURIComponent(uid)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
          });
        } catch (dbErr) {
          console.warn('Could not remove from sent_emails:', dbErr.message);
        }
      }
      await larkBatchPost(email, larkToken, 'batch_trash', {}, ids);
      return res.status(200).json({ success: true, action, count: ids.length, ids });
    }

    // ── 2. MARK READ / MARK ALL READ ──
    if (action === 'mark_all_read' || action === 'mark_read') {
      if (ids.length) {
        await larkBatchPost(email, larkToken, 'batch_modify', { remove_label_ids: ['UNREAD'] }, ids);
      }
      return res.status(200).json({ success: true, action, count: ids.length });
    }

    // ── 3. MARK UNREAD ──
    if (action === 'mark_unread') {
      await larkBatchPost(email, larkToken, 'batch_modify', { add_label_ids: ['UNREAD'] }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
    }

    // ── 4. STAR / UNSTAR ──
    if (action === 'star') {
      await larkBatchPost(email, larkToken, 'batch_modify', { add_label_ids: ['FLAGGED'] }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
    }
    if (action === 'unstar') {
      await larkBatchPost(email, larkToken, 'batch_modify', { remove_label_ids: ['FLAGGED'] }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
    }

    // ── 5. MOVE FOLDER (ARCHIVE / RESTORE TO INBOX / SPAM) ──
    if (action === 'archive') {
      await larkBatchPost(email, larkToken, 'batch_modify', { add_folder: 'ARCHIVED' }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
    }
    if (action === 'move_inbox') {
      await larkBatchPost(email, larkToken, 'batch_modify', { add_folder: 'INBOX' }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
    }
    if (action === 'spam') {
      await larkBatchPost(email, larkToken, 'batch_modify', { add_folder: 'SPAM' }, ids);
      return res.status(200).json({ success: true, action, count: ids.length });
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
