import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { user, email } = await verifyUser(req);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

    const folder = (req.query.folder || 'INBOX').toUpperCase();
    const pageSize = Math.min(Math.max(parseInt(req.query.page_size || '20', 10), 1), 20);
    const pageToken = req.query.page_token || '';

    // If viewing SENT folder, include sent emails from Supabase
    let sentDbMessages = [];
    if (folder === 'SENT' && !pageToken) {
      try {
        const sRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_emails?user_id=eq.${user.id}&order=created_at.desc&limit=20`, {
          headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
        });
        if (sRes.ok) {
          const rows = await sRes.json();
          sentDbMessages = (rows || []).map(s => ({
            id: s.id,
            threadId: s.id,
            subject: s.subject || '(no subject)',
            from: { name: s.from_name || '', email: s.from_email || '' },
            to: (s.to_recipients || []).map(r => typeof r === 'string' ? { email: r } : r),
            date: new Date(s.created_at).getTime(),
            unread: false,
            labels: ['SENT'],
            snippet: (s.body_text || '').slice(0, 140),
            hasAttachments: false,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch sent_emails from DB:', err);
      }
    }

    const larkToken = await getLarkToken();

    let url = `https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages?folder_id=${encodeURIComponent(folder)}&page_size=${pageSize}`;
    if (pageToken) {
      url += `&page_token=${encodeURIComponent(pageToken)}`;
    }

    const listRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${larkToken}` },
    });

    const listData = await listRes.json();
    if (listData.code !== 0) {
      // If Lark folder listing failed but we have sent messages from DB, return those
      if (sentDbMessages.length > 0) {
        return res.status(200).json({
          success: true,
          folder,
          messages: sentDbMessages,
          hasMore: false,
          pageToken: '',
        });
      }
      throw new Error(listData.msg || 'Failed to list messages');
    }

    const rawItems = listData.data?.items || [];
    const messageIds = rawItems.map(item => {
      if (typeof item === 'string') return item;
      return item?.message_id || item?.id || '';
    }).filter(Boolean);

    if (!messageIds.length) {
      return res.status(200).json({
        success: true,
        folder,
        messages: sentDbMessages,
        hasMore: false,
        pageToken: '',
      });
    }

    // Batch get message details
    const batchRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${larkToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_ids: messageIds }),
    });

    const batchData = await batchRes.json();
    if (batchData.code !== 0) {
      console.error('Lark batch_get failed:', batchData);
      throw new Error(batchData.msg || 'Failed to fetch message details');
    }

    const rawMessages = batchData.data?.messages || [];

    const messages = rawMessages.map(m => {
      let snippet = '';
      if (m.body_plain_text) {
        try {
          snippet = Buffer.from(m.body_plain_text, 'base64').toString('utf-8').slice(0, 140);
        } catch {
          snippet = '';
        }
      }

      return {
        id: m.message_id,
        threadId: m.thread_id,
        subject: m.subject || '(no subject)',
        from: {
          name: m.head_from?.name || '',
          email: m.head_from?.mail_address || '',
        },
        to: (m.to || []).map(t => ({ name: t.name || '', email: t.mail_address || '' })),
        date: parseInt(m.internal_date || '0', 10),
        unread: (m.label_ids || []).includes('UNREAD'),
        labels: m.label_ids || [],
        snippet,
        hasAttachments: Array.isArray(m.attachments) && m.attachments.length > 0,
      };
    });

    // Merge and sort newest first
    const allMessages = [...sentDbMessages, ...messages];
    allMessages.sort((a, b) => b.date - a.date);

    return res.status(200).json({
      success: true,
      folder,
      messages: allMessages,
      hasMore: listData.data?.has_more || false,
      pageToken: listData.data?.page_token || '',
    });

  } catch (err) {
    console.error('Inbox API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
