/*!
 * CaffnCode Mail UI - shared webmail widget
 * Used by email.caffncode.com and admin.caffncode.com
 *
 *   CaffnMail.mount(element, {
 *     apiBase: 'https://email.caffncode.com',   // '' when same origin
 *     getToken: async () => supabaseAccessToken,
 *   });
 */
(function () {
  const STYLES = `
  .cm{--cm-cream:var(--cream,#fdf6f0);--cm-espresso:var(--espresso,#2c1a0e);--cm-caramel:var(--caramel,#c87941);
      --cm-latte:var(--latte,#e8c9a0);--cm-foam:var(--foam,#f5ede3);--cm-steam:var(--steam,#d4a574);--cm-mocha:var(--mocha,#6b3d1e);
      --cm-red:var(--red,#8b1a1a);--cm-red-lt:var(--red-lt,#fde8e8);
      display:grid;grid-template-columns:190px minmax(260px,340px) 1fr;height:100%;min-height:0;
      font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;color:var(--cm-espresso);background:var(--cm-cream);
      border:2px solid var(--cm-espresso);box-shadow:4px 4px 0 var(--cm-latte);position:relative;overflow:hidden}
  .cm *{box-sizing:border-box}
  .cm button{font-family:'Helvetica Neue', Helvetica, Arial, sans-serif}
  .cm::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;z-index:2;
      background:repeating-linear-gradient(90deg,var(--cm-caramel) 0,var(--cm-caramel) 5px,var(--cm-espresso) 5px,var(--cm-espresso) 8px)}

  /* folders */
  .cm-folders{background:var(--cm-foam);border-right:2px solid var(--cm-espresso);padding:1.1rem 0 0;display:flex;flex-direction:column;min-height:0}
  .cm-compose{margin:0 .9rem 1rem;background:var(--cm-espresso);color:var(--cm-cream);border:none;padding:10px 12px;
      font-weight:700;font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;box-shadow:4px 4px 0 var(--cm-caramel);
      cursor:pointer;transition:all .12s}
  .cm-compose:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--cm-caramel)}
  .cm-compose:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--cm-caramel)}
  .cm-section{font-size:.55rem;text-transform:uppercase;letter-spacing:.18em;color:var(--cm-steam);padding:0 1rem;margin:.4rem 0}
  .cm-folder{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 1rem;font-size:.7rem;
      color:var(--cm-mocha);cursor:pointer;border-left:3px solid transparent;transition:all .12s;user-select:none}
  .cm-folder:hover{background:var(--cm-latte);color:var(--cm-espresso)}
  .cm-folder.active{background:var(--cm-cream);color:var(--cm-caramel);border-left-color:var(--cm-caramel);font-weight:700}
  .cm-badge{font-size:.55rem;font-weight:700;background:var(--cm-caramel);color:var(--cm-espresso);padding:1px 6px;box-shadow:2px 2px 0 var(--cm-espresso)}
  .cm-mailbox{margin-top:auto;padding:.8rem 1rem;border-top:2px solid var(--cm-espresso);font-size:.58rem;color:var(--cm-mocha);word-break:break-all;line-height:1.6}
  .cm-mailbox strong{display:block;color:var(--cm-caramel);font-size:.52rem;text-transform:uppercase;letter-spacing:.14em}

  /* list */
  .cm-list{border-right:2px solid var(--cm-espresso);display:flex;flex-direction:column;min-height:0;background:var(--cm-cream)}
  .cm-list-head{display:flex;align-items:center;gap:8px;padding:.9rem 1rem .8rem;border-bottom:2px solid var(--cm-espresso)}
  .cm-list-title{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:-.03em}
  .cm-count{font-size:.58rem;background:var(--cm-latte);padding:2px 7px;font-weight:700}
  .cm-btn.cm-mark-all{padding:3px 8px;font-size:.56rem;white-space:nowrap;margin-left:auto;display:inline-flex;align-items:center;gap:3px;box-shadow:1px 1px 0 var(--cm-latte)}
  .cm-icon-btn{background:transparent;border:2px solid var(--cm-espresso);width:30px;height:30px;cursor:pointer;font-size:.85rem;
      display:inline-flex;align-items:center;justify-content:center;box-shadow:2px 2px 0 var(--cm-latte);transition:all .12s;color:var(--cm-espresso)}
  .cm-icon-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--cm-caramel)}
  .cm-icon-btn.spin{animation:cmspin .8s linear infinite}
  @keyframes cmspin{to{transform:rotate(360deg)}}
  .cm-items{flex:1;overflow-y:auto}
  .cm-item{padding:.75rem 1rem;border-bottom:1.5px dashed rgba(44,26,14,.15);cursor:pointer;border-left:3px solid transparent;transition:background .1s}
  .cm-item:hover{background:var(--cm-foam)}
  .cm-item.active{background:var(--cm-foam);border-left-color:var(--cm-caramel)}
  .cm-item-top{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:2px}
  .cm-from{font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cm-mocha)}
  .cm-date{font-size:.58rem;color:var(--cm-steam);white-space:nowrap}
  .cm-subj{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cm-snip{font-size:.6rem;color:var(--cm-steam);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
  .cm-item.unread .cm-from{color:var(--cm-espresso);font-weight:700}
  .cm-item.unread .cm-subj{font-weight:800}
  .cm-item.unread .cm-from::before{content:'';display:inline-block;width:7px;height:7px;background:var(--cm-caramel);box-shadow:1px 1px 0 var(--cm-espresso);margin-right:6px;vertical-align:middle}
  .cm-state{padding:2.5rem 1.2rem;text-align:center;font-size:.68rem;color:var(--cm-steam);line-height:1.8}
  .cm-state.err{color:var(--cm-red)}
  .cm-more{display:block;width:calc(100% - 2rem);margin:.8rem 1rem;background:transparent;border:2px solid var(--cm-espresso);padding:7px;
      font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;box-shadow:2px 2px 0 var(--cm-latte)}

  /* reader */
  .cm-view{display:flex;flex-direction:column;min-height:0;min-width:0;background:var(--cm-cream)}
  .cm-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--cm-steam);font-size:.68rem}
  .cm-empty-mark{width:46px;height:46px;border:2px solid var(--cm-latte);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:4px 4px 0 var(--cm-latte)}
  .cm-msg{display:flex;flex-direction:column;flex:1;min-height:0}
  .cm-msg[hidden]{display:none}
  .cm-msg-head{padding:1rem 1.3rem;border-bottom:2px solid var(--cm-espresso);background:var(--cm-foam)}
  .cm-msg-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.8rem}
  .cm-btn{background:transparent;color:var(--cm-espresso);border:2px solid var(--cm-espresso);padding:5px 11px;font-weight:700;font-size:.6rem;
      text-transform:uppercase;letter-spacing:.08em;cursor:pointer;box-shadow:2px 2px 0 var(--cm-latte);transition:all .12s}
  .cm-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--cm-caramel)}
  .cm-btn.danger{background:var(--cm-red);border-color:var(--cm-red);color:#fff;box-shadow:2px 2px 0 rgba(139,26,26,.35)}
  .cm-btn.back{display:none}
  .cm-msg-subj{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:-.03em;line-height:1.25;margin-bottom:.7rem;word-break:break-word}
  .cm-msg-meta{display:flex;align-items:center;gap:10px}
  .cm-avatar{width:36px;height:36px;flex-shrink:0;border:2px solid var(--cm-espresso);background:var(--cm-latte);display:flex;align-items:center;justify-content:center;
      font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:800;color:var(--cm-caramel);font-size:.95rem}
  .cm-meta-text{flex:1;min-width:0;font-size:.62rem;line-height:1.6}
  .cm-meta-text b{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:.85rem}
  .cm-meta-text span{color:var(--cm-steam);word-break:break-all}
  .cm-meta-date{font-size:.58rem;color:var(--cm-mocha);white-space:nowrap;align-self:flex-start}
  .cm-attach{display:flex;gap:6px;flex-wrap:wrap;margin-top:.7rem}
  .cm-attach span{font-size:.58rem;background:var(--cm-latte);border:1px solid var(--cm-steam);padding:2px 8px}
  .cm-frame-wrap{flex:1;min-height:0;margin:1rem;border:2px solid var(--cm-espresso);background:#fff;box-shadow:3px 3px 0 var(--cm-latte)}
  .cm-frame{width:100%;height:100%;border:0;display:block;background:#fff}

  /* compose */
  .cm-modal{position:fixed;inset:0;background:rgba(26,15,7,.55);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem}
  .cm-modal[hidden]{display:none}
  .cm-card{width:100%;max-width:640px;background:var(--cm-foam);border:2px solid var(--cm-espresso);box-shadow:8px 8px 0 var(--cm-caramel);
      position:relative;display:flex;flex-direction:column;max-height:90vh;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;color:var(--cm-espresso)}
  .cm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:repeating-linear-gradient(90deg,var(--cm-caramel) 0,var(--cm-caramel) 6px,var(--cm-espresso) 6px,var(--cm-espresso) 9px)}
  .cm-card-head{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.3rem .6rem}
  .cm-card-title{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:-.03em}
  .cm-card-body{padding:.4rem 1.3rem 1rem;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem}
  .cm-field{display:flex;flex-direction:column;gap:5px}
  .cm-field label{font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:var(--cm-mocha);font-weight:700}
  .cm-field input,.cm-field textarea{border:2px solid var(--cm-espresso);background:var(--cm-cream);padding:8px 11px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size:.75rem;color:var(--cm-espresso);outline:none;width:100%}
  .cm-field input:focus,.cm-field textarea:focus{border-color:var(--cm-caramel)}
  .cm-field input[readonly]{opacity:.65}
  .cm-field textarea{min-height:220px;resize:vertical;line-height:1.6}
  .cm-card-foot{display:flex;justify-content:space-between;align-items:center;padding:.9rem 1.3rem 1.2rem;gap:10px}
  .cm-send{background:var(--cm-espresso);color:var(--cm-cream);border:none;padding:10px 20px;font-weight:700;font-size:.7rem;text-transform:uppercase;
      letter-spacing:.1em;box-shadow:4px 4px 0 var(--cm-caramel);cursor:pointer;transition:all .12s}
  .cm-send:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--cm-caramel)}
  .cm-send:disabled{opacity:.5;transform:none;box-shadow:none;cursor:not-allowed}
  .cm-error{background:var(--cm-red-lt);border:2px solid var(--cm-red);color:var(--cm-red);padding:8px 12px;font-size:.66rem}
  .cm-error[hidden]{display:none}
  .cm-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(12px);background:var(--cm-espresso);color:var(--cm-cream);
      border:1.5px solid var(--cm-caramel);font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
      padding:9px 18px;box-shadow:3px 3px 0 var(--cm-caramel);opacity:0;pointer-events:none;transition:all .25s;z-index:10001;white-space:nowrap}
  .cm-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

  /* responsive */
  @media(max-width:900px){
    .cm{grid-template-columns:minmax(240px,320px) 1fr}
    .cm-folders{display:none}
    .cm.cm-show-folders .cm-folders{display:flex;position:absolute;inset:0 auto 0 0;width:200px;z-index:5;box-shadow:6px 0 0 rgba(44,26,14,.15)}
  }
  @media(max-width:640px){
    .cm{grid-template-columns:1fr}
    .cm-view{display:none}
    .cm.cm-reading .cm-list{display:none}
    .cm.cm-reading .cm-view{display:flex}
    .cm-btn.back{display:inline-block}
  }
  .cm-menu{display:none}
  @media(max-width:900px){.cm-menu{display:inline-flex}}
  `;

  const FOLDERS = [
    ['INBOX', 'Inbox', '📥'],
    ['SENT', 'Sent', '📤'],
    ['DRAFT', 'Drafts', '📝'],
    ['SPAM', 'Spam', '⚠'],
    ['TRASH', 'Trash', '🗑'],
  ];

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function injectCss() {
    if (document.getElementById('cm-style')) return;
    const s = document.createElement('style');
    s.id = 'cm-style';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function fmtDate(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function mount(root, opts = {}) {
    injectCss();
    const apiBase = (opts.apiBase || '').replace(/\/$/, '');
    const getToken = opts.getToken;
    const st = { folder: 'INBOX', msgs: [], pageToken: '', hasMore: false, current: null, mailbox: '', displayName: '', readIds: new Set() };

    function getReadStorageKey() {
      return 'cm_read_' + (st.mailbox || 'default');
    }
    function initReadIds() {
      try {
        const stored = JSON.parse(localStorage.getItem(getReadStorageKey()) || '[]');
        st.readIds = new Set(stored);
      } catch {
        st.readIds = new Set();
      }
    }
    function saveReadIds() {
      try {
        localStorage.setItem(getReadStorageKey(), JSON.stringify([...st.readIds]));
      } catch {}
    }

    root.innerHTML = `
      <div class="cm">
        <aside class="cm-folders">
          <button class="cm-compose" data-act="compose">✎ Compose</button>
          <div class="cm-section">Folders</div>
          ${FOLDERS.map(([id, name, ic]) => `
            <div class="cm-folder${id === 'INBOX' ? ' active' : ''}" data-folder="${id}">
              <span>${ic}&nbsp; ${name}</span><span class="cm-badge" data-badge="${id}" hidden></span>
            </div>`).join('')}
          <div class="cm-mailbox"><strong>Mailbox</strong><span data-el="mailbox">-</span></div>
        </aside>

        <section class="cm-list">
          <div class="cm-list-head">
            <button class="cm-icon-btn cm-menu" data-act="menu" title="Folders">☰</button>
            <span class="cm-list-title" data-el="title">Inbox</span>
            <span class="cm-count" data-el="count">0</span>
            <button class="cm-btn cm-mark-all" data-act="mark-all-read" title="Mark all messages in this folder as read">✓ Mark all read</button>
            <button class="cm-icon-btn" data-act="compose-mini" title="Compose">✎</button>
            <button class="cm-icon-btn" data-act="refresh" title="Refresh">↻</button>
          </div>
          <div class="cm-items" data-el="items"><div class="cm-state">Brewing your inbox…</div></div>
        </section>

        <main class="cm-view">
          <div class="cm-empty" data-el="empty">
            <div class="cm-empty-mark">☕</div>
            <div>Select a message to read</div>
          </div>
          <div class="cm-msg" data-el="msg" hidden>
            <div class="cm-msg-head">
              <div class="cm-msg-actions">
                <button class="cm-btn back" data-act="back">← Back</button>
                <button class="cm-btn" data-act="reply">↩ Reply</button>
                <button class="cm-btn" data-act="forward">↪ Forward</button>
                <button class="cm-btn" data-act="toggle-read" data-el="btn-toggle-read">✉ Mark unread</button>
                <button class="cm-btn danger" data-act="delete">🗑 Delete</button>
              </div>
              <div class="cm-msg-subj" data-el="subj"></div>
              <div class="cm-msg-meta">
                <div class="cm-avatar" data-el="avatar">?</div>
                <div class="cm-meta-text">
                  <b data-el="from-name"></b> <span data-el="from-email"></span><br/>
                  <span data-el="to"></span>
                </div>
                <div class="cm-meta-date" data-el="date"></div>
              </div>
              <div class="cm-attach" data-el="attach"></div>
            </div>
            <div class="cm-frame-wrap">
              <iframe class="cm-frame" data-el="frame" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" title="Email content"></iframe>
            </div>
          </div>
        </main>

        <div class="cm-modal" data-el="modal" hidden>
          <form class="cm-card" data-el="form">
            <div class="cm-card-head">
              <div class="cm-card-title" data-el="compose-title">New message</div>
              <button type="button" class="cm-icon-btn" data-act="close">✕</button>
            </div>
            <div class="cm-card-body">
              <div class="cm-field"><label>From</label><input data-el="c-from" readonly/></div>
              <div class="cm-field"><label>To</label><input data-el="c-to" placeholder="someone@example.com, another@example.com" required/></div>
              <div class="cm-field"><label>Cc</label><input data-el="c-cc" placeholder="optional"/></div>
              <div class="cm-field"><label>Subject</label><input data-el="c-subj" placeholder="Subject"/></div>
              <div class="cm-field"><label>Message</label><textarea data-el="c-body" placeholder="Write something good…"></textarea></div>
              <div class="cm-error" data-el="c-err" hidden></div>
            </div>
            <div class="cm-card-foot">
              <button type="button" class="cm-btn" data-act="close">Discard</button>
              <button type="submit" class="cm-send" data-el="c-send">Send ↗</button>
            </div>
          </form>
        </div>
        <div class="cm-toast" data-el="toast"></div>
      </div>`;

    const cm = root.querySelector('.cm');
    const $ = (name) => root.querySelector(`[data-el="${name}"]`);

    let toastT;
    function toast(msg) {
      const t = $('toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(() => t.classList.remove('show'), 2800);
    }

    async function api(path, options = {}) {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const res = await fetch(apiBase + path, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
      });
      let data = {};
      try { data = await res.json(); } catch { /* ignore */ }
      if (!res.ok || data.success === false) {
        const e = new Error(data.error || `Request failed (${res.status})`);
        e.status = res.status;
        throw e;
      }
      return data;
    }

    async function loadFolders() {
      try {
        const data = await api('/api/folders');
        st.mailbox = data.email || '';
        st.displayName = data.displayName || '';
        initReadIds();
        $('mailbox').textContent = st.mailbox || '-';
        $('c-from').value = st.displayName ? `${st.displayName} <${st.mailbox}>` : st.mailbox;
        (data.folders || []).forEach((f) => {
          const b = root.querySelector(`[data-badge="${f.id}"]`);
          if (!b) return;
          b.textContent = f.unreadCount;
          b.hidden = !(f.unreadCount > 0);
        });
        return true;
      } catch (err) {
        if (err.status === 403) {
          $('items').innerHTML = `<div class="cm-state err">📭 ${esc(err.message)}</div>`;
          $('mailbox').textContent = 'not assigned';
          return false;
        }
        console.warn('folders:', err);
        return true;
      }
    }

    function renderList() {
      $('count').textContent = st.msgs.length + (st.hasMore ? '+' : '');
      if (!st.msgs.length) {
        $('items').innerHTML = '<div class="cm-state">Nothing here. Enjoy your coffee ☕</div>';
        return;
      }
      $('items').innerHTML = st.msgs.map((m) => {
        const who = st.folder === 'SENT' || st.folder === 'DRAFT'
          ? 'To: ' + ((m.to || []).map((t) => t.name || t.email).join(', ') || '-')
          : (m.from?.name || m.from?.email || 'Unknown');
        return `
          <div class="cm-item${m.unread ? ' unread' : ''}${st.current?.id === m.id ? ' active' : ''}" data-id="${esc(m.id)}">
            <div class="cm-item-top"><span class="cm-from">${esc(who)}</span><span class="cm-date">${fmtDate(m.date)}</span></div>
            <div class="cm-subj">${m.hasAttachments ? '📎 ' : ''}${esc(m.subject || '(no subject)')}</div>
            <div class="cm-snip">${esc(m.snippet || '')}</div>
          </div>`;
      }).join('') + (st.hasMore ? '<button class="cm-more" data-act="more">Load more</button>' : '');
    }

    async function loadMessages(append = false) {
      const btn = root.querySelector('[data-act="refresh"]');
      btn.classList.add('spin');
      if (!append) $('items').innerHTML = '<div class="cm-state">Brewing your inbox…</div>';
      try {
        let q = `/api/inbox?folder=${encodeURIComponent(st.folder)}&page_size=20`;
        if (append && st.pageToken) q += `&page_token=${encodeURIComponent(st.pageToken)}`;
        const data = await api(q);
        const incoming = (data.messages || []).map((m) => {
          if (st.readIds.has(m.id)) m.unread = false;
          return m;
        });
        st.msgs = append ? st.msgs.concat(incoming) : incoming;
        st.hasMore = !!data.hasMore;
        st.pageToken = data.pageToken || '';
        renderList();
      } catch (err) {
        $('items').innerHTML = `<div class="cm-state err">${err.status === 403 ? '📭 ' : '⚠ '}${esc(err.message)}</div>`;
      } finally {
        btn.classList.remove('spin');
      }
    }

    function showEmpty() {
      st.current = null;
      $('msg').hidden = true;
      $('empty').style.display = '';
      cm.classList.remove('cm-reading');
    }

    async function openMessage(id) {
      root.querySelectorAll('.cm-item').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
      const listItem = root.querySelector(`.cm-item[data-id="${window.CSS && CSS.escape ? CSS.escape(id) : id}"]`);
      if (listItem) listItem.classList.remove('unread');
      const cached = st.msgs.find((m) => m.id === id);
      if (cached) cached.unread = false;
      st.readIds.add(id);
      saveReadIds();

      const btnToggleRead = $('btn-toggle-read');
      if (btnToggleRead) btnToggleRead.textContent = '✉ Mark unread';

      // Update badge if any
      const b = root.querySelector(`[data-badge="${st.folder}"]`);
      if (b && !b.hidden) {
        const cur = parseInt(b.textContent || '1', 10);
        if (cur <= 1) b.hidden = true;
        else b.textContent = String(cur - 1);
      }

      $('empty').style.display = 'none';
      $('msg').hidden = false;
      cm.classList.add('cm-reading');
      $('subj').textContent = cached?.subject || 'Loading…';
      $('frame').srcdoc = `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#999;padding:16px">Loading…</p>`;

      try {
        const { message: m } = await api(`/api/message?id=${encodeURIComponent(id)}`);
        st.current = m;
        const fromName = m.from?.name || m.from?.email || 'Unknown';
        $('subj').textContent = m.subject || '(no subject)';
        $('from-name').textContent = fromName;
        $('from-email').textContent = m.from?.email ? `<${m.from.email}>` : '';
        $('avatar').textContent = fromName.charAt(0).toUpperCase();
        const to = (m.to || []).map((t) => t.name ? `${t.name} <${t.email}>` : t.email).join(', ');
        const cc = (m.cc || []).map((t) => t.email).join(', ');
        $('to').textContent = `to: ${to || 'me'}${cc ? ` · cc: ${cc}` : ''}`;
        $('date').textContent = m.date ? new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
        $('attach').innerHTML = (m.attachments || [])
          .map((a) => `<span>📎 ${esc(a.filename || a.name || 'attachment')}</span>`).join('');

        const body = m.html && m.html.trim()
          ? m.html
          : `<pre style="white-space:pre-wrap;word-break:break-word;font-family:inherit">${esc(m.plainText || '')}</pre>`;
        $('frame').srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank">
          <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;margin:16px;word-wrap:break-word}
          a{color:#c87941}img{max-width:100%;height:auto}blockquote{border-left:3px solid #e8c9a0;margin:0;padding-left:12px;color:#555}</style>
          </head><body>${body}</body></html>`;
      } catch (err) {
        $('frame').srcdoc = `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#8b1a1a;padding:16px">⚠ ${esc(err.message)}</p>`;
      }
    }

    // ── compose ──
    function openCompose({ to = '', cc = '', subject = '', body = '', title = 'New message' } = {}) {
      $('compose-title').textContent = title;
      $('c-to').value = to;
      $('c-cc').value = cc;
      $('c-subj').value = subject;
      $('c-body').value = body;
      $('c-err').hidden = true;
      $('modal').hidden = false;
      setTimeout(() => (to ? $('c-body') : $('c-to')).focus(), 30);
      if (to) { $('c-body').setSelectionRange(0, 0); }
    }
    function closeCompose() { $('modal').hidden = true; }

    function quote(m) {
      const when = m.date ? new Date(m.date).toLocaleString() : '';
      const who = m.from?.name ? `${m.from.name} <${m.from.email}>` : (m.from?.email || '');
      const text = (m.plainText || '').split('\n').map((l) => '> ' + l).join('\n');
      return `\n\nOn ${when}, ${who} wrote:\n${text}`;
    }

    async function send(e) {
      e.preventDefault();
      const btn = $('c-send');
      $('c-err').hidden = true;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const text = $('c-body').value;
        const html = `<div style="white-space:pre-wrap">${esc(text)}</div>`;
        await api('/api/send', {
          method: 'POST',
          body: JSON.stringify({ to: $('c-to').value, cc: $('c-cc').value, subject: $('c-subj').value, text, html }),
        });
        closeCompose();
        toast('✓ Message sent');
        loadFolders();
        if (st.folder === 'SENT') loadMessages();
      } catch (err) {
        $('c-err').textContent = '⚠ ' + err.message;
        $('c-err').hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send ↗';
      }
    }

    async function del() {
      if (!st.current) return;
      if (!confirm('Delete this message?')) return;
      const targetId = st.current.id;
      try {
        await api('/api/action', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', id: targetId }),
        });
        st.msgs = st.msgs.filter((m) => m.id !== targetId);
        st.readIds.delete(targetId);
        saveReadIds();
        showEmpty();
        renderList();
        loadFolders();
        toast('Message deleted');
      } catch (err) {
        toast('⚠ ' + err.message);
      }
    }

    async function toggleRead() {
      if (!st.current) return;
      const targetId = st.current.id;
      const cached = st.msgs.find((m) => m.id === targetId);
      const isCurrentlyUnread = cached ? cached.unread : false;
      const newUnread = !isCurrentlyUnread;

      if (cached) cached.unread = newUnread;
      if (newUnread) {
        st.readIds.delete(targetId);
      } else {
        st.readIds.add(targetId);
      }
      saveReadIds();

      const listItem = root.querySelector(`.cm-item[data-id="${window.CSS && CSS.escape ? CSS.escape(targetId) : targetId}"]`);
      if (listItem) {
        listItem.classList.toggle('unread', newUnread);
      }

      const btnToggleRead = $('btn-toggle-read');
      if (btnToggleRead) {
        btnToggleRead.textContent = newUnread ? '✓ Mark read' : '✉ Mark unread';
      }

      toast(newUnread ? 'Marked as unread' : 'Marked as read');
    }

    async function markAllAsRead() {
      if (!st.msgs.length) {
        toast('No messages in this folder');
        return;
      }
      const unreadCount = st.msgs.filter((m) => m.unread).length;
      if (unreadCount === 0) {
        toast('All messages are already read');
        return;
      }

      const unreadIds = [];
      st.msgs.forEach((m) => {
        if (m.unread) {
          unreadIds.push(m.id);
          m.unread = false;
        }
        st.readIds.add(m.id);
      });
      saveReadIds();

      root.querySelectorAll('.cm-item.unread').forEach((el) => el.classList.remove('unread'));
      const b = root.querySelector(`[data-badge="${st.folder}"]`);
      if (b) {
        b.textContent = '0';
        b.hidden = true;
      }

      const btnToggleRead = $('btn-toggle-read');
      if (btnToggleRead && st.current) btnToggleRead.textContent = '✉ Mark unread';

      try {
        const parentStat = window.parent?.document?.getElementById('stat-mail') || document.getElementById('stat-mail');
        if (parentStat && st.folder === 'INBOX') parentStat.textContent = '0';
      } catch {}

      toast(`✓ Marked ${unreadCount} message${unreadCount > 1 ? 's' : ''} as read`);

      try {
        await api('/api/action', {
          method: 'POST',
          body: JSON.stringify({ action: 'mark_all_read', folder: st.folder, ids: unreadIds }),
        });
      } catch (err) {
        console.warn('Backend mark_all_read note:', err.message);
      }
    }

    function switchFolder(id) {
      st.folder = id;
      st.pageToken = '';
      root.querySelectorAll('.cm-folder').forEach((el) => el.classList.toggle('active', el.dataset.folder === id));
      $('title').textContent = FOLDERS.find((f) => f[0] === id)?.[1] || id;
      cm.classList.remove('cm-show-folders');
      showEmpty();
      loadMessages();
    }

    // ── events ──
    root.addEventListener('click', (e) => {
      const folder = e.target.closest('.cm-folder');
      if (folder) return switchFolder(folder.dataset.folder);
      const item = e.target.closest('.cm-item');
      if (item) return openMessage(item.dataset.id);
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) {
        if (e.target === $('modal')) closeCompose();
        return;
      }
      const m = st.current;
      switch (act) {
        case 'compose': case 'compose-mini': openCompose(); break;
        case 'close': closeCompose(); break;
        case 'refresh': loadFolders(); loadMessages(); break;
        case 'mark-all-read': markAllAsRead(); break;
        case 'toggle-read': toggleRead(); break;
        case 'more': loadMessages(true); break;
        case 'menu': cm.classList.toggle('cm-show-folders'); break;
        case 'back': showEmpty(); break;
        case 'delete': del(); break;
        case 'reply':
          if (m) openCompose({
            title: 'Reply',
            to: m.from?.email || '',
            subject: /^re:/i.test(m.subject || '') ? m.subject : `Re: ${m.subject || ''}`,
            body: quote(m),
          });
          break;
        case 'forward':
          if (m) openCompose({
            title: 'Forward',
            subject: /^fwd?:/i.test(m.subject || '') ? m.subject : `Fwd: ${m.subject || ''}`,
            body: `\n\n---------- Forwarded message ----------\nFrom: ${m.from?.name || ''} <${m.from?.email || ''}>\nDate: ${m.date ? new Date(m.date).toLocaleString() : ''}\nSubject: ${m.subject || ''}\n\n${m.plainText || ''}`,
          });
          break;
      }
    });
    $('form').addEventListener('submit', send);
    const onKey = (e) => { if (e.key === 'Escape' && !$('modal').hidden) closeCompose(); };
    document.addEventListener('keydown', onKey);

    // ── boot ──
    (async () => {
      const ok = await loadFolders();
      if (ok) loadMessages();
    })();

    return {
      refresh() { loadFolders(); loadMessages(); },
      compose: openCompose,
      destroy() { document.removeEventListener('keydown', onKey); root.innerHTML = ''; },
    };
  }

  window.CaffnMail = { mount };
})();
