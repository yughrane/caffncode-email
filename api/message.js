import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const larkToken = await getLarkToken();

    const messageId = req.query.id;
    if (!messageId) {
      return res.status(400).json({ success: false, error: 'Missing message id parameter' });
    }

    const batchRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/batch_get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${larkToken}`,
        'Content-Type': 'application/json; charset=utf-8',
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

    const m = messages[0];
    let html = '';
    let plainText = '';

    if (m.body_html) {
      try {
        html = Buffer.from(m.body_html, 'base64').toString('utf-8');
      } catch (e) {
        html = m.body_html;
      }
    }

    if (m.body_plain_text) {
      try {
        plainText = Buffer.from(m.body_plain_text, 'base64').toString('utf-8');
      } catch (e) {
        plainText = m.body_plain_text;
      }
    }

    return res.status(200).json({
      success: true,
      message: {
        id: m.message_id,
        threadId: m.thread_id,
        subject: m.subject || '(no subject)',
        from: {
          name: m.head_from?.name || '',
          email: m.head_from?.mail_address || '',
        },
        to: (m.to || []).map(t => ({ name: t.name || '', email: t.mail_address || '' })),
        cc: (m.cc || []).map(c => ({ name: c.name || '', email: c.mail_address || '' })),
        date: parseInt(m.internal_date || '0', 10),
        labels: m.label_ids || [],
        html: html || (plainText ? `<pre style="font-family: inherit; white-space: pre-wrap;">${plainText}</pre>` : ''),
        plainText,
        attachments: m.attachments || [],
      },
    });
  } catch (err) {
    console.error('Message API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
