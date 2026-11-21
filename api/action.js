import { verifyUser, getLarkToken, setCors } from './_lark.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const larkToken = await getLarkToken();

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = req.query.action || body.action;
    const messageId = req.query.id || body.id;

    if (!messageId) {
      return res.status(400).json({ success: false, error: 'Message ID is required' });
    }

    if (action === 'delete' || req.method === 'DELETE') {
      const larkRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/messages/${encodeURIComponent(messageId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${larkToken}`,
        },
      });

      const data = await larkRes.json();
      if (data.code !== 0) {
        throw new Error(data.msg || 'Failed to delete message');
      }

      return res.status(200).json({ success: true, messageId });
    }

    return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
  } catch (err) {
    console.error('Action API error:', err);
    return res.status(err.message.includes('Unauthorized') ? 401 : 500).json({
      success: false,
      error: err.message,
    });
  }
}
