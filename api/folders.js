import { verifyUser, getLarkToken, setCors } from './_lark.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = await verifyUser(req);
    const larkToken = await getLarkToken();

    const larkRes = await fetch(`https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/${encodeURIComponent(email)}/folders`, {
      headers: {
        'Authorization': `Bearer ${larkToken}`,
      },
    });

    const data = await larkRes.json();
    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to fetch folders');
    }

    const folders = (data.data?.items || []).map(f => ({
      id: f.id,
      name: f.name,
      unreadCount: f.unread_message_count || 0,
      unreadThreadCount: f.unread_thread_count || 0,
    }));

    return res.status(200).json({ success: true, email, folders });
  } catch (err) {
    console.error('Folders API error:', err);
    return res.status(err.message.includes('Unauthorized') ? 401 : 500).json({
      success: false,
      error: err.message,
    });
  }
}
