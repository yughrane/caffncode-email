import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function shapeLarkMessage(m) {
  let html = '';
  let plainText = '';

  if (m.body_html) {
    try {
      html = Buffer.from(m.body_html, 'base64').toString('utf-8');
    } catch {
      html = m.body_html;
    }
  }

  if (m.body_plain_text) {
    try {
      plainText = Buffer.from(m.body_plain_text, 'base64').toString('utf-8');
    } catch {
      plainText = m.body_plain_text;
    }
  }

  const labels = m.label_ids || [];
  const attachments = (m.attachments || [])
    .filter(a => !a.is_inline)
    .map(a => ({
      id: a.id || a.attachment_id || '',
      filename: a.filename || a.name || 'attachment',
      contentType: a.content_type || '',
      attachmentType: a.attachment_type || 1,
      size: a.size || 0,
    }));

  return {
    id: m.message_id,
    threadId: m.thread_id || m.message_id,
    smtpMessageId: m.smtp_message_id || '',
    references: m.references || '',
    subject: m.subject || '(no subject)',
    from: {
      name: m.head_from?.name || '',
      email: m.head_from?.mail_address || '',
    },
    replyTo: m.reply_to || '',
    to: (m.to || []).map(t => ({ name: t.name || '', email: t.mail_address || '' })),
    cc: (m.cc || []).map(c => ({ name: c.name || '', email: c.mail_address || '' })),
    date: parseInt(m.internal_date || '0', 10),
    unread: labels.includes('UNREAD'),
    starred: labels.includes('FLAGGED'),
    labels,
    html: html || (plainText ? `<pre style="font-family: inherit; white-space: pre-wrap;">${plainText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : ''),
    plainText,
    snippet: m.body_preview || plainText.slice(0, 140),
    attachments,
  };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

    const messageId = req.query.id || '';
    const threadId = req.query.thread_id || '';
    const attachmentId = req.query.attachment_id || '';

    // ── Mode 1: Get signed download URL for an attachment ──
    if (messageId && attachmentId) {
      const larkToken = await getLarkToken();
      const dlUrl = `https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/${encodeURIComponent(messageId)}/attachments/download_url?attachment_ids=${encodeURIComponent(attachmentId)}`;
      const dlRes = await fetch(dlUrl, {
        headers: {
          'Authorization': `Bearer ${larkToken}`,
          'User-Agent': 'CaffnCode/1.0',
        },
      });
      const dlData = await dlRes.json();
      if (dlData.code !== 0) {
        throw new Error(dlData.msg || 'Failed to generate attachment download link');
      }
      const item = (dlData.data?.download_urls || [])[0];
      if (!item?.download_url) {
        throw new Error('Attachment download URL unavailable');
      }
      return res.status(200).json({
        success: true,
        attachmentId,
        downloadUrl: item.download_url,
      });
    }

    if (!messageId && !threadId) {
      return res.status(400).json({ success: false, error: 'Missing message id or thread_id parameter' });
    }

    // ── Mode 2: Check Supabase sent_emails if UUID ──
    if (messageId && UUID_RE.test(messageId)) {
      try {
        const sRes = await fetch(`${SUPABASE_URL}/rest/v1/sent_emails?id=eq.${encodeURIComponent(messageId)}&select=*`, {
          headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
        });
        if (sRes.ok) {
          const rows = await sRes.json();
          if (rows && rows.length > 0) {
            const s = rows[0];
            const shaped = {
              id: s.id,
              threadId: s.id,
              smtpMessageId: '',
              references: '',
              subject: s.subject || '(no subject)',
              from: { name: s.from_name || '', email: s.from_email || '' },
              to: (s.to_recipients || []).map(r => typeof r === 'string' ? { name: '', email: r } : r),
              cc: (s.cc_recipients || []).map(r => typeof r === 'string' ? { name: '', email: r } : r),
              date: new Date(s.created_at).getTime(),
              unread: false,
              starred: false,
              labels: ['SENT'],
              html: s.body_html || (s.body_text ? `<pre style="font-family: inherit; white-space: pre-wrap;">${s.body_text}</pre>` : ''),
              plainText: s.body_text || '',
              snippet: (s.body_text || '').slice(0, 140),
              attachments: [],
            };
            return res.status(200).json({
              success: true,
              message: shaped,
              messages: [shaped],
            });
          }
        }
      } catch (err) {
        console.warn('Could not read from sent_emails:', err);
      }
    }

    const larkToken = await getLarkToken();

    // ── Mode 3: Fetch full thread if requested or available ──
    const wantThread = Boolean(threadId || req.query.include_thread === '1');
    if (wantThread) {
      const targetThreadId = threadId || messageId;
      try {
        const tRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/threads/${encodeURIComponent(targetThreadId)}`, {
          headers: {
            'Authorization': `Bearer ${larkToken}`,
            'User-Agent': 'CaffnCode/1.0',
          },
        });
        const tData = await tRes.json();
        const rawThreadMsgs = tData.data?.thread?.messages || [];
        if (tData.code === 0 && rawThreadMsgs.length > 0) {
          const shapedList = rawThreadMsgs.map(shapeLarkMessage).sort((a, b) => a.date - b.date);
          const primary = (messageId && shapedList.find(x => x.id === messageId)) || shapedList[shapedList.length - 1];

          // Mark unread messages in thread as read on Lark (best-effort)
          const unreadIds = shapedList.filter(x => x.unread).map(x => x.id);
          if (unreadIds.length > 0) {
            fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_modify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${larkToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'CaffnCode/1.0',
              },
              body: JSON.stringify({ message_ids: unreadIds.slice(0, 20), remove_label_ids: ['UNREAD'] }),
            }).catch(() => {});
          }

          return res.status(200).json({
            success: true,
            message: primary,
            messages: shapedList,
          });
        }
      } catch (tErr) {
        console.warn('Thread lookup fallback to batch_get:', tErr.message);
      }
    }

    // ── Mode 4: Single message batch_get ──
    const batchRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${larkToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'CaffnCode/1.0',
      },
      body: JSON.stringify({ message_ids: [messageId] }),
    });

    const data = await batchRes.json();
    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to fetch message details');
    }

    const messages = data.data?.messages || [];
    if (!messages.length) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const shaped = shapeLarkMessage(messages[0]);

    // Mark as read on Lark when opened (best-effort)
    if (shaped.unread) {
      fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_modify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${larkToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CaffnCode/1.0',
        },
        body: JSON.stringify({ message_ids: [shaped.id], remove_label_ids: ['UNREAD'] }),
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: shaped,
      messages: [shaped],
    });
  } catch (err) {
    console.error('Message API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
