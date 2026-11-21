import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const larkToken = await getLarkToken();

    const folder = (req.query.folder || 'INBOX').toUpperCase();
    const pageSize = Math.min(parseInt(req.query.page_size || '30', 10), 50);
    const pageToken = req.query.page_token || '';

    let url = `https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages?folder_id=${encodeURIComponent(folder)}&page_size=${pageSize}`;
    if (pageToken) {
      url += `&page_token=${encodeURIComponent(pageToken)}`;
    }

    const listRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${larkToken}` },
    });

    const listData = await listRes.json();
    if (listData.code !== 0) {
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
        messages: [],
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

    // Sort newest first
    messages.sort((a, b) => b.date - a.date);

    return res.status(200).json({
      success: true,
      folder,
      messages,
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
