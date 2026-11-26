import { verifyUser, setCors, errorStatus } from './_lark.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjcnqslvoseyaabjjvkn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_01TSfCXJMwGFVt2PxJQvSA_n8eL2zn7';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user, email, displayName } = await verifyUser(req);

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, html, text, cc, bcc, attachments, inReplyTo, references } = body;

    if (!to || (!Array.isArray(to) && typeof to !== 'string')) {
      return res.status(400).json({ success: false, error: 'Recipient "to" is required' });
    }

    const parseRecipients = (input) => {
      if (!input) return [];
      const list = Array.isArray(input) ? input : String(input).split(/[,;]/);
      return list
        .map(item => {
          if (typeof item === 'object' && item) return item.mail_address || item.email || '';
          const str = String(item).trim();
          const match = str.match(/^(?:(.*)<)?([^>]+)>?$/);
          return (match ? match[2] : str).trim();
        })
        .filter(r => r && r.includes('@'));
    };

    const toList = parseRecipients(to);
    const ccList = parseRecipients(cc);
    const bccList = parseRecipients(bcc);

    if (toList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid recipient email address provided' });
    }

    const htmlContent = html || (text ? `<div style="white-space: pre-wrap; font-family: sans-serif;">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : '<div></div>');
    const textContent = text || (html ? html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '') : '');
    const senderName = displayName || (email.split('@')[0]);

    // Format attachments for Resend: [{ filename, content (base64), content_type }]
    const resendAttachments = Array.isArray(attachments)
      ? attachments
          .filter(a => a && a.filename && a.content)
          .map(a => ({
            filename: String(a.filename),
            content: String(a.content).replace(/^data:[^;]+;base64,/, ''),
            ...(a.contentType ? { content_type: String(a.contentType) } : {}),
          }))
      : [];

    // Threading headers for replies
    const customHeaders = {};
    if (inReplyTo) {
      const cleanReplyId = String(inReplyTo).startsWith('<') ? String(inReplyTo) : `<${inReplyTo}>`;
      customHeaders['In-Reply-To'] = cleanReplyId;
      customHeaders['References'] = references ? `${references} ${cleanReplyId}` : cleanReplyId;
    }

    const payload = {
      from: `${senderName} <${email}>`,
      to: toList,
      cc: ccList.length ? ccList : undefined,
      bcc: bccList.length ? bccList : undefined,
      reply_to: email,
      subject: subject || '(no subject)',
      html: htmlContent,
      text: textContent,
      attachments: resendAttachments.length ? resendAttachments : undefined,
      headers: Object.keys(customHeaders).length ? customHeaders : undefined,
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CaffnCode/1.0',
      },
      body: JSON.stringify(payload),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok || resendData.error) {
      const msg = resendData.error?.message || resendData.message || 'Failed to send email via mail service';
      throw new Error(msg);
    }

    // Save sent email record to Supabase (best effort)
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (token) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/sent_emails`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: resendData.id,
            user_id: user.id,
            from_name: senderName,
            from_email: email,
            to_recipients: toList,
            cc_recipients: ccList,
            subject: subject || '(no subject)',
            body_text: textContent,
            body_html: htmlContent,
          }),
        });
      } catch (saveErr) {
        console.warn('Could not archive sent email to DB:', saveErr);
      }
    }

    return res.status(200).json({
      success: true,
      messageId: resendData.id,
    });
  } catch (err) {
    console.error('Send API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
