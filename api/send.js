import { verifyUser, getLarkToken, setCors, errorStatus } from './_lark.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, displayName } = await verifyUser(req);
    const larkToken = await getLarkToken();

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, html, text, cc, bcc } = body;

    if (!to || (!Array.isArray(to) && typeof to !== 'string')) {
      return res.status(400).json({ success: false, error: 'Recipient "to" is required' });
    }

    // Format recipient list
    const parseRecipients = (input) => {
      if (!input) return [];
      const list = Array.isArray(input) ? input : input.split(/[,;]/);
      return list
        .map(item => {
          if (typeof item === 'object' && item.mail_address) return item;
          const str = String(item).trim();
          const match = str.match(/^(?:(.*)<)?([^>]+)>?$/);
          if (match) {
            return {
              name: (match[1] || '').trim(),
              mail_address: (match[2] || '').trim(),
            };
          }
          return { mail_address: str };
        })
        .filter(r => r.mail_address && r.mail_address.includes('@'));
    };

    const toList = parseRecipients(to);
    const ccList = parseRecipients(cc);
    const bccList = parseRecipients(bcc);

    if (toList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid recipient email address provided' });
    }

    const htmlContent = html || (text ? `<p>${text.replace(/\n/g, '<br/>')}</p>` : '<p></p>');
    const textContent = text || (html ? html.replace(/<[^>]+>/g, '') : '');

    const payload = {
      head_from: {
        name: displayName,
        mail_address: email,
      },
      to: toList,
      cc: ccList,
      bcc: bccList,
      subject: subject || '(no subject)',
      body_html: Buffer.from(htmlContent).toString('base64'),
      body_plain_text: Buffer.from(textContent).toString('base64'),
    };

    const larkRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${larkToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const data = await larkRes.json();
    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to send email via Lark');
    }

    return res.status(200).json({
      success: true,
      messageId: data.data?.message_id,
    });
  } catch (err) {
    console.error('Send API error:', err);
    return res.status(errorStatus(err)).json({
      success: false,
      error: err.message,
    });
  }
}
