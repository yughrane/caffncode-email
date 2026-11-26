/*!
 * CaffnCode Mail UI - full-featured shared webmail widget
 * Used by email.caffncode.com and admin.caffncode.com
 */
(function () {
  const ADMIN_API_BASE = 'https://admin.caffncode.com';

  const STYLES = `
  .cm{--cm-cream:var(--cream,#fdf6f0);--cm-espresso:var(--espresso,#2c1a0e);--cm-caramel:var(--caramel,#c87941);
      --cm-latte:var(--latte,#e8c9a0);--cm-foam:var(--foam,#f5ede3);--cm-steam:var(--steam,#9c8272);--cm-mocha:var(--mocha,#6b3d1e);
      --cm-red:var(--red,#8b1a1a);--cm-red-lt:var(--red-lt,#fde8e8);--cm-green:#2e7d32;
      display:grid;grid-template-columns:200px minmax(290px,370px) 1fr;height:100%;min-height:0;
      font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;color:var(--cm-espresso);background:var(--cm-cream);
      border:2px solid var(--cm-espresso);box-shadow:4px 4px 0 var(--cm-latte);position:relative;overflow:hidden}
  .cm *{box-sizing:border-box}
  .cm button,.cm input,.cm select,.cm textarea{font-family:'Helvetica Neue', Helvetica, Arial, sans-serif}
  .cm::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;z-index:3;
      background:repeating-linear-gradient(90deg,var(--cm-caramel) 0,var(--cm-caramel) 5px,var(--cm-espresso) 5px,var(--cm-espresso) 8px)}

  /* ── Sidebar Folders ── */
  .cm-folders{background:var(--cm-foam);border-right:2px solid var(--cm-espresso);padding:1.1rem 0 0;display:flex;flex-direction:column;min-height:0}
  .cm-compose{margin:0 .9rem .9rem;background:var(--cm-espresso);color:var(--cm-cream);border:none;padding:10px 12px;
      font-weight:700;font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;box-shadow:4px 4px 0 var(--cm-caramel);
      cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:space-between}
  .cm-compose kbd{font-size:.55rem;opacity:.65;background:rgba(255,255,255,.12);padding:1px 5px;font-family:inherit}
  .cm-compose:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--cm-caramel)}
  .cm-compose:active{transform:translate(1px,1px);box-shadow:2px 2px 0 var(--cm-caramel)}
  .cm-section{font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--cm-steam);padding:0 1rem;margin:.3rem 0}
  .cm-folder-list{flex:1;overflow-y:auto}
  .cm-folder{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 1rem;font-size:.72rem;
      color:var(--cm-mocha);cursor:pointer;border-left:3px solid transparent;transition:all .12s;user-select:none}
  .cm-folder:hover{background:var(--cm-latte);color:var(--cm-espresso)}
  .cm-folder.active{background:var(--cm-cream);color:var(--cm-caramel);border-left-color:var(--cm-caramel);font-weight:700}
  .cm-badge{font-size:.55rem;font-weight:700;background:var(--cm-caramel);color:var(--cm-espresso);padding:1px 6px;box-shadow:2px 2px 0 var(--cm-espresso)}
  .cm-badge.subtle{background:var(--cm-latte);box-shadow:none}
  .cm-side-tools{display:flex;gap:6px;padding:.55rem .9rem;border-top:1.5px dashed rgba(44,26,14,.18)}
  .cm-side-btn{flex:1;background:var(--cm-cream);border:1.5px solid var(--cm-espresso);padding:5px 6px;font-size:.56rem;font-weight:700;
      text-transform:uppercase;letter-spacing:.06em;cursor:pointer;color:var(--cm-espresso);transition:all .12s;text-align:center}
  .cm-side-btn:hover{background:var(--cm-latte)}
  .cm-mailbox{padding:.65rem 1rem;border-top:2px solid var(--cm-espresso);font-size:.6rem;color:var(--cm-mocha);word-break:break-all;line-height:1.5}
  .cm-mailbox strong{display:block;color:var(--cm-caramel);font-size:.52rem;text-transform:uppercase;letter-spacing:.14em}

  /* ── Message List Pane ── */
  .cm-list{border-right:2px solid var(--cm-espresso);display:flex;flex-direction:column;min-height:0;background:var(--cm-cream)}
  .cm-list-head{display:flex;align-items:center;gap:7px;padding:.8rem .9rem .7rem;border-bottom:1.5px solid var(--cm-espresso);background:var(--cm-foam)}
  .cm-chk-all{width:14px;height:14px;accent-color:var(--cm-caramel);cursor:pointer;flex-shrink:0}
  .cm-list-title{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.05rem;letter-spacing:-.03em}
  .cm-count{font-size:.58rem;background:var(--cm-latte);padding:2px 7px;font-weight:700}
  .cm-btn.cm-mark-all{padding:3px 7px;font-size:.54rem;white-space:nowrap;margin-left:auto;display:inline-flex;align-items:center;gap:3px;box-shadow:1px 1px 0 var(--cm-latte)}
  .cm-icon-btn{background:transparent;border:2px solid var(--cm-espresso);width:28px;height:28px;cursor:pointer;font-size:.8rem;
      display:inline-flex;align-items:center;justify-content:center;box-shadow:2px 2px 0 var(--cm-latte);transition:all .12s;color:var(--cm-espresso);flex-shrink:0}
  .cm-icon-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--cm-caramel)}
  .cm-icon-btn.spin{animation:cmspin .8s linear infinite}
  @keyframes cmspin{to{transform:rotate(360deg)}}

  /* Search + Filter Bar */
  .cm-search-bar{padding:.55rem .8rem;border-bottom:1.5px solid var(--cm-espresso);background:var(--cm-cream);display:flex;flex-direction:column;gap:6px}
  .cm-search-wrap{display:flex;align-items:center;gap:6px;border:1.5px solid var(--cm-espresso);background:#fff;padding:4px 8px}
  .cm-search-wrap:focus-within{border-color:var(--cm-caramel);box-shadow:2px 2px 0 var(--cm-latte)}
  .cm-search-ic{font-size:.72rem;opacity:.6}
  .cm-search-in{flex:1;border:0;outline:0;background:transparent;font-size:.72rem;color:var(--cm-espresso);min-width:0}
  .cm-search-clear{border:0;background:none;cursor:pointer;font-size:.72rem;color:var(--cm-steam);padding:0 2px}
  .cm-filters{display:flex;gap:5px;flex-wrap:wrap}
  .cm-fchip{border:1.5px solid rgba(44,26,14,.28);background:transparent;color:var(--cm-mocha);padding:2px 8px;font-size:.56rem;
      font-weight:700;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;transition:all .1s}
  .cm-fchip:hover{border-color:var(--cm-espresso);color:var(--cm-espresso)}
  .cm-fchip.on{background:var(--cm-espresso);color:var(--cm-cream);border-color:var(--cm-espresso)}

  /* Bulk Action Bar */
  .cm-bulk{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:.5rem .8rem;background:var(--cm-espresso);color:var(--cm-cream);border-bottom:2px solid var(--cm-caramel)}
  .cm-bulk[hidden]{display:none}
  .cm-bulk-cnt{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--cm-caramel);margin-right:auto}
  .cm-bulk button{background:rgba(255,255,255,.1);color:var(--cm-cream);border:1px solid rgba(255,255,255,.25);padding:3px 7px;
      font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
  .cm-bulk button:hover{background:var(--cm-caramel);color:var(--cm-espresso);border-color:var(--cm-caramel)}
  .cm-bulk button.danger:hover{background:var(--cm-red);color:#fff;border-color:var(--cm-red)}

  /* Message Items */
  .cm-items{flex:1;overflow-y:auto}
  .cm-item{display:flex;align-items:flex-start;gap:8px;padding:.7rem .85rem;border-bottom:1.5px dashed rgba(44,26,14,.15);
      cursor:pointer;border-left:3px solid transparent;transition:background .1s;position:relative}
  .cm-item:hover{background:var(--cm-foam)}
  .cm-item.active{background:var(--cm-foam);border-left-color:var(--cm-caramel)}
  .cm-item.selected{background:rgba(200,121,65,.12)}
  .cm-item-left{display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:2px;flex-shrink:0}
  .cm-chk{width:13px;height:13px;accent-color:var(--cm-caramel);cursor:pointer;margin:0}
  .cm-star{border:0;background:none;padding:0;cursor:pointer;font-size:.88rem;line-height:1;color:rgba(44,26,14,.28);transition:transform .1s,color .1s}
  .cm-star:hover{transform:scale(1.2);color:var(--cm-caramel)}
  .cm-star.on{color:var(--cm-caramel)}
  .cm-item-body{flex:1;min-width:0}
  .cm-item-top{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:2px}
  .cm-from{font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--cm-mocha)}
  .cm-date{font-size:.58rem;color:var(--cm-steam);white-space:nowrap;flex-shrink:0}
  .cm-subj{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:.86rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
  .cm-snip{font-size:.63rem;color:var(--cm-steam);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
  .cm-draft-pill{display:inline-block;background:var(--cm-caramel);color:var(--cm-espresso);font-size:.5rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:1px 5px;margin-right:5px;vertical-align:middle}
  .cm-item.unread .cm-from{color:var(--cm-espresso);font-weight:700}
  .cm-item.unread .cm-subj{font-weight:900}
  .cm-item.unread .cm-from::before{content:'';display:inline-block;width:7px;height:7px;background:var(--cm-caramel);box-shadow:1px 1px 0 var(--cm-espresso);margin-right:6px;vertical-align:middle}
  .cm-state{padding:2.5rem 1.2rem;text-align:center;font-size:.7rem;color:var(--cm-steam);line-height:1.8}
  .cm-state.err{color:var(--cm-red)}
  .cm-more{display:block;width:calc(100% - 1.6rem);margin:.8rem;background:transparent;border:2px solid var(--cm-espresso);padding:7px;
      font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;box-shadow:2px 2px 0 var(--cm-latte)}
  .cm-more:hover{background:var(--cm-foam)}

  /* ── Reading Pane ── */
  .cm-view{display:flex;flex-direction:column;min-height:0;min-width:0;background:var(--cm-cream)}
  .cm-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--cm-steam);font-size:.7rem;padding:1.5rem;text-align:center}
  .cm-empty-mark{width:48px;height:48px;border:2px solid var(--cm-latte);display:flex;align-items:center;justify-content:center;font-size:1.35rem;box-shadow:4px 4px 0 var(--cm-latte)}
  .cm-empty-hint{font-size:.58rem;opacity:.75;margin-top:4px}
  .cm-empty-hint kbd{border:1px solid var(--cm-latte);background:var(--cm-foam);padding:1px 5px;font-size:.55rem;color:var(--cm-mocha)}
  .cm-msg{display:flex;flex-direction:column;flex:1;min-height:0}
  .cm-msg[hidden]{display:none}
  .cm-msg-head{padding:.9rem 1.2rem .8rem;border-bottom:2px solid var(--cm-espresso);background:var(--cm-foam);flex-shrink:0}
  .cm-msg-actions{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.7rem;align-items:center}
  .cm-btn{background:transparent;color:var(--cm-espresso);border:2px solid var(--cm-espresso);padding:5px 10px;font-weight:700;font-size:.58rem;
      text-transform:uppercase;letter-spacing:.08em;cursor:pointer;box-shadow:2px 2px 0 var(--cm-latte);transition:all .12s;display:inline-flex;align-items:center;gap:4px}
  .cm-btn:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--cm-caramel)}
  .cm-btn.accent{background:var(--cm-caramel);color:var(--cm-espresso)}
  .cm-btn.danger{background:var(--cm-red);border-color:var(--cm-red);color:#fff;box-shadow:2px 2px 0 rgba(139,26,26,.35)}
  .cm-btn.back{display:none}
  .cm-subj-row{display:flex;align-items:flex-start;gap:10px;justify-content:space-between}
  .cm-msg-subj{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:-.03em;line-height:1.2;word-break:break-word;flex:1}
  .cm-thread-pill{font-size:.56rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:var(--cm-latte);padding:3px 8px;border:1.5px solid var(--cm-espresso);white-space:nowrap;cursor:pointer}

  /* Thread Scroll Area */
  .cm-thread-scroll{flex:1;overflow-y:auto;padding:.9rem 1.1rem;display:flex;flex-direction:column;gap:.8rem;min-height:0}
  .cm-tcard{border:2px solid var(--cm-espresso);background:#fff;box-shadow:3px 3px 0 var(--cm-latte)}
  .cm-tcard-head{display:flex;align-items:center;gap:10px;padding:.65rem .9rem;background:var(--cm-foam);cursor:pointer;user-select:none;border-bottom:1.5px solid var(--cm-espresso)}
  .cm-tcard.collapsed .cm-tcard-head{border-bottom:0;background:var(--cm-cream)}
  .cm-tcard.collapsed .cm-tcard-body{display:none}
  .cm-avatar{width:34px;height:34px;flex-shrink:0;border:2px solid var(--cm-espresso);background:var(--cm-latte);display:flex;align-items:center;justify-content:center;
      font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;color:var(--cm-espresso);font-size:.9rem}
  .cm-meta-text{flex:1;min-width:0;font-size:.64rem;line-height:1.45}
  .cm-meta-text b{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:.84rem;font-weight:800}
  .cm-meta-text span{color:var(--cm-steam);word-break:break-all}
  .cm-tcard-snip{font-size:.64rem;color:var(--cm-steam);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:none}
  .cm-tcard.collapsed .cm-tcard-snip{display:block}
  .cm-tcard.collapsed .cm-tcard-recips{display:none}
  .cm-meta-date{font-size:.58rem;color:var(--cm-mocha);white-space:nowrap;flex-shrink:0}
  .cm-attach{display:flex;gap:6px;flex-wrap:wrap;padding:.55rem .9rem;background:var(--cm-cream);border-bottom:1.5px dashed rgba(44,26,14,.18)}
  .cm-attach[hidden]{display:none}
  .cm-att-chip{display:inline-flex;align-items:center;gap:6px;font-size:.62rem;font-weight:700;background:#fff;border:1.5px solid var(--cm-espresso);
      padding:4px 9px;box-shadow:2px 2px 0 var(--cm-latte);cursor:pointer;color:var(--cm-espresso);transition:all .1s}
  .cm-att-chip:hover{background:var(--cm-latte);transform:translate(-1px,-1px)}
  .cm-att-chip small{font-weight:400;color:var(--cm-steam)}
  .cm-frame{width:100%;min-height:240px;border:0;display:block;background:#fff}

  /* Inline Quick Reply */
  .cm-qreply{border-top:2px solid var(--cm-espresso);background:var(--cm-foam);padding:.65rem 1.1rem;flex-shrink:0}
  .cm-qreply-row{display:flex;gap:8px;align-items:flex-end}
  .cm-qreply textarea{flex:1;border:1.5px solid var(--cm-espresso);background:#fff;padding:7px 10px;font-size:.74rem;color:var(--cm-espresso);
      resize:none;height:36px;max-height:120px;outline:none;transition:height .15s,border-color .15s}
  .cm-qreply textarea:focus{height:68px;border-color:var(--cm-caramel)}

  /* ── Modals (Compose, Task, Signature, Shortcuts, Preview) ── */
  .cm-modal{position:fixed;inset:0;background:rgba(26,15,7,.58);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem}
  .cm-modal[hidden]{display:none}
  .cm-card{width:100%;max-width:680px;background:var(--cm-foam);border:2px solid var(--cm-espresso);box-shadow:8px 8px 0 var(--cm-caramel);
      position:relative;display:flex;flex-direction:column;max-height:92vh;color:var(--cm-espresso)}
  .cm-card.narrow{max-width:480px}
  .cm-card.wide{max-width:820px}
  .cm-card.dragover{outline:3px dashed var(--cm-caramel);outline-offset:-8px}
  .cm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:repeating-linear-gradient(90deg,var(--cm-caramel) 0,var(--cm-caramel) 6px,var(--cm-espresso) 6px,var(--cm-espresso) 9px)}
  .cm-card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem .6rem;gap:8px}
  .cm-card-title{font-family:'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-weight:900;font-size:1.15rem;letter-spacing:-.03em}
  .cm-card-body{padding:.4rem 1.25rem 1rem;overflow-y:auto;display:flex;flex-direction:column;gap:.65rem}
  .cm-field{display:flex;flex-direction:column;gap:4px;position:relative}
  .cm-field-top{display:flex;justify-content:space-between;align-items:center}
  .cm-field label{font-size:.56rem;text-transform:uppercase;letter-spacing:.12em;color:var(--cm-mocha);font-weight:700}
  .cm-cc-toggles{display:flex;gap:8px}
  .cm-link-btn{border:0;background:none;color:var(--cm-caramel);font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;padding:0}
  .cm-link-btn:hover{text-decoration:underline}
  .cm-field input,.cm-field select,.cm-field textarea{border:2px solid var(--cm-espresso);background:var(--cm-cream);padding:7px 10px;
      font-size:.76rem;color:var(--cm-espresso);outline:none;width:100%}
  .cm-field input:focus,.cm-field select:focus,.cm-field textarea:focus{border-color:var(--cm-caramel)}
  .cm-field input[readonly]{opacity:.7;background:var(--cm-foam)}

  /* Recipient Chip Input & Autocomplete */
  .cm-chips-box{display:flex;flex-wrap:wrap;align-items:center;gap:5px;border:2px solid var(--cm-espresso);background:var(--cm-cream);padding:5px 8px;min-height:36px;cursor:text}
  .cm-chips-box:focus-within{border-color:var(--cm-caramel)}
  .cm-rchip{display:inline-flex;align-items:center;gap:5px;background:var(--cm-latte);border:1.5px solid var(--cm-espresso);padding:2px 7px;font-size:.65rem;font-weight:700}
  .cm-rchip button{border:0;background:none;cursor:pointer;font-size:.72rem;line-height:1;color:var(--cm-espresso);padding:0}
  .cm-chip-in{flex:1;min-width:130px;border:0 !important;background:transparent !important;padding:2px 4px !important;font-size:.75rem;outline:none}
  .cm-ac{position:absolute;top:100%;left:0;right:0;z-index:30;background:#fff;border:2px solid var(--cm-espresso);box-shadow:4px 4px 0 var(--cm-caramel);max-height:190px;overflow-y:auto;margin-top:2px}
  .cm-ac[hidden]{display:none}
  .cm-ac-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;cursor:pointer;border-bottom:1px dashed rgba(44,26,14,.12);font-size:.7rem}
  .cm-ac-row:last-child{border-bottom:0}
  .cm-ac-row:hover,.cm-ac-row.hi{background:var(--cm-foam)}
  .cm-ac-row small{color:var(--cm-steam);font-size:.6rem}
  .cm-ac-tag{font-size:.52rem;font-weight:700;text-transform:uppercase;background:var(--cm-latte);padding:1px 5px}

  /* Rich Text Editor & Compose Attachments */
  .cm-editor-wrap{border:2px solid var(--cm-espresso);background:#fff;display:flex;flex-direction:column}
  .cm-editor-wrap:focus-within{border-color:var(--cm-caramel)}
  .cm-toolbar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:5px 7px;background:var(--cm-foam);border-bottom:1.5px solid var(--cm-espresso)}
  .cm-tbtn{border:1.5px solid transparent;background:transparent;color:var(--cm-espresso);padding:3px 7px;font-size:.68rem;font-weight:700;cursor:pointer;min-width:26px}
  .cm-tbtn:hover{border-color:var(--cm-espresso);background:var(--cm-cream)}
  .cm-editor{min-height:175px;max-height:310px;overflow-y:auto;padding:10px 12px;font-size:.8rem;line-height:1.6;outline:none;color:#1a1a1a}
  .cm-editor blockquote{border-left:3px solid var(--cm-latte);margin:.5rem 0;padding-left:10px;color:#555}
  .cm-editor pre,.cm-editor code{background:#f5ede3;padding:2px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem}
  .cm-c-atts{display:flex;flex-wrap:wrap;gap:6px}
  .cm-c-atts[hidden]{display:none}
  .cm-c-att{display:inline-flex;align-items:center;gap:6px;background:var(--cm-cream);border:1.5px solid var(--cm-espresso);padding:3px 8px;font-size:.62rem;font-weight:700}
  .cm-c-att button{border:0;background:none;cursor:pointer;color:var(--cm-red);font-weight:700}

  .cm-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:.7rem 1.25rem;border-top:2px solid var(--cm-espresso);background:var(--cm-cream);flex-wrap:wrap}
  .cm-foot-left{display:flex;align-items:center;gap:8px}
  .cm-foot-right{display:flex;align-items:center;gap:8px}
  .cm-draft-stat{font-size:.58rem;color:var(--cm-steam)}
  .cm-send{background:var(--cm-espresso);color:var(--cm-cream);border:none;padding:9px 18px;font-weight:700;font-size:.68rem;text-transform:uppercase;
      letter-spacing:.1em;box-shadow:4px 4px 0 var(--cm-caramel);cursor:pointer;transition:all .12s}
  .cm-send:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--cm-caramel)}
  .cm-send:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
  .cm-error{background:var(--cm-red-lt);border:2px solid var(--cm-red);padding:8px 11px;font-size:.66rem;color:var(--cm-red)}
  .cm-error[hidden]{display:none}

  /* Shortcuts Grid */
  .cm-kbd-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;font-size:.68rem}
  .cm-kbd-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px dashed rgba(44,26,14,.15)}
  .cm-kbd-row kbd{background:var(--cm-cream);border:1.5px solid var(--cm-espresso);padding:2px 6px;font-size:.6rem;font-weight:700;box-shadow:1px 1px 0 var(--cm-latte)}

  /* Toast + Undo Send */
  .cm-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(16px);background:var(--cm-espresso);color:var(--cm-cream);
      border:1.5px solid var(--cm-caramel);box-shadow:4px 4px 0 var(--cm-caramel);padding:9px 15px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
      opacity:0;pointer-events:none;transition:all .22s;z-index:10001;display:flex;align-items:center;gap:10px}
  .cm-toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
  .cm-toast button{background:var(--cm-caramel);color:var(--cm-espresso);border:0;padding:4px 9px;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;cursor:pointer}
  .cm-toast button.ghost{background:transparent;color:var(--cm-cream);border:1px solid rgba(255,255,255,.35)}

  /* Responsive */
  @media(max-width:960px){
    .cm{grid-template-columns:minmax(250px,330px) 1fr}
    .cm-folders{display:none}
    .cm.cm-show-folders .cm-folders{display:flex;position:absolute;inset:0 auto 0 0;width:210px;z-index:6;box-shadow:6px 0 0 rgba(44,26,14,.18)}
  }
  @media(max-width:660px){
    .cm{grid-template-columns:1fr}
    .cm-view{display:none}
    .cm.cm-reading .cm-list{display:none}
    .cm.cm-reading .cm-view{display:flex}
    .cm-btn.back{display:inline-flex}
    .cm-kbd-grid{grid-template-columns:1fr}
  }
  .cm-menu{display:none}
  @media(max-width:960px){.cm-menu{display:inline-flex}}
  `;

  const FOLDERS = [
    ['INBOX', 'Inbox', '📥'],
    ['STARRED', 'Starred', '★'],
    ['SENT', 'Sent', '📤'],
    ['DRAFT', 'Drafts', '📝'],
    ['ARCHIVED', 'Archived', '📦'],
    ['SPAM', 'Spam', '⚠'],
    ['TRASH', 'Trash', '🗑'],
  ];

  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const cssEsc = (s) => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');

  function fmtBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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

  function injectCss() {
    let s = document.getElementById('cm-style');
    if (!s) {
      s = document.createElement('style');
      s.id = 'cm-style';
      document.head.appendChild(s);
    }
    s.textContent = STYLES;
  }

  function mount(root, opts = {}) {
    injectCss();
    const apiBase = (opts.apiBase || '').replace(/\/$/, '');
    const getToken = opts.getToken;
    const onUnauthorized = opts.onUnauthorized;
    const onUnreadChange = opts.onUnreadChange;

    const st = {
      folder: 'INBOX',
      filter: 'all', // 'all' | 'unread' | 'files' | 'starred'
      search: '',
      msgs: [],
      selected: new Set(),
      pageToken: '',
      hasMore: false,
      current: null,
      threadMsgs: [],
      mailbox: '',
      displayName: '',
      readIds: new Set(),
      starredIds: new Set(),
      drafts: [],
      activeDraftId: null,
      contacts: [],
      composeChips: { to: [], cc: [], bcc: [] },
      composeFiles: [],
      composeReplyMeta: { inReplyTo: '', references: '' },
      undoTimer: null,
      undoCountdown: null,
      pendingSend: null,
      lastGKeyAt: 0,
    };

    // ── Local storage helpers (read cache, drafts, signature) ──
    const storageSuffix = () => st.mailbox || 'default';
    function loadLocalState() {
      try {
        st.readIds = new Set(JSON.parse(localStorage.getItem('cm_read_' + storageSuffix()) || '[]'));
      } catch { st.readIds = new Set(); }
      try {
        st.starredIds = new Set(JSON.parse(localStorage.getItem('cm_star_' + storageSuffix()) || '[]'));
      } catch { st.starredIds = new Set(); }
      try {
        st.drafts = JSON.parse(localStorage.getItem('cm_drafts_' + storageSuffix()) || '[]');
      } catch { st.drafts = []; }
      updateDraftBadge();
    }
    function saveReadIds() {
      try { localStorage.setItem('cm_read_' + storageSuffix(), JSON.stringify([...st.readIds].slice(-500))); } catch {}
    }
    function saveStarredIds() {
      try { localStorage.setItem('cm_star_' + storageSuffix(), JSON.stringify([...st.starredIds].slice(-500))); } catch {}
    }
    function saveDraftsStore() {
      try { localStorage.setItem('cm_drafts_' + storageSuffix(), JSON.stringify(st.drafts)); } catch {}
      updateDraftBadge();
    }
    function getSignatureConfig() {
      try {
        const raw = localStorage.getItem('cm_sig_' + storageSuffix());
        if (raw) return JSON.parse(raw);
      } catch {}
      const defName = st.displayName || (st.mailbox ? st.mailbox.split('@')[0] : '');
      return {
        enabled: true,
        text: defName ? `${defName}\nCaffnCode · ${st.mailbox}` : '',
      };
    }
    function setSignatureConfig(cfg) {
      try { localStorage.setItem('cm_sig_' + storageSuffix(), JSON.stringify(cfg)); } catch {}
    }

    root.innerHTML = `
      <div class="cm">
        <aside class="cm-folders">
          <button class="cm-compose" data-act="compose"><span>✎ Compose</span><kbd>C</kbd></button>
          <div class="cm-section">Folders</div>
          <div class="cm-folder-list">
            ${FOLDERS.map(([id, name, ic]) => `
              <div class="cm-folder${id === 'INBOX' ? ' active' : ''}" data-folder="${id}">
                <span>${ic}&nbsp; ${name}</span><span class="cm-badge${id === 'DRAFT' ? ' subtle' : ''}" data-badge="${id}" hidden></span>
              </div>`).join('')}
          </div>
          <div class="cm-side-tools">
            <button type="button" class="cm-side-btn" data-act="open-sig" title="Email signature">⚙ Signature</button>
            <button type="button" class="cm-side-btn" data-act="open-shortcuts" title="Keyboard shortcuts">⌨ Keys (?)</button>
          </div>
          <div class="cm-mailbox"><strong>Mailbox</strong><span data-el="mailbox">-</span></div>
        </aside>

        <section class="cm-list">
          <div class="cm-list-head">
            <button class="cm-icon-btn cm-menu" data-act="menu" title="Folders">☰</button>
            <input type="checkbox" class="cm-chk-all" data-el="chk-all" title="Select all visible"/>
            <span class="cm-list-title" data-el="title">Inbox</span>
            <span class="cm-count" data-el="count">0</span>
            <button class="cm-btn cm-mark-all" data-act="mark-all-read" title="Mark all messages in this folder as read">✓ Mark all read</button>
            <button class="cm-icon-btn" data-act="compose-mini" title="Compose (c)">✎</button>
            <button class="cm-icon-btn" data-act="refresh" title="Refresh">↻</button>
          </div>

          <div class="cm-search-bar">
            <div class="cm-search-wrap">
              <span class="cm-search-ic">🔍</span>
              <input class="cm-search-in" data-el="search" placeholder="Search sender, subject, text… (/)" autocomplete="off"/>
              <button type="button" class="cm-search-clear" data-el="search-clear" hidden title="Clear search">✕</button>
            </div>
            <div class="cm-filters">
              <button type="button" class="cm-fchip on" data-filter="all">All</button>
              <button type="button" class="cm-fchip" data-filter="unread">Unread</button>
              <button type="button" class="cm-fchip" data-filter="files">📎 Files</button>
              <button type="button" class="cm-fchip" data-filter="starred">★ Starred</button>
            </div>
          </div>

          <div class="cm-bulk" data-el="bulk" hidden>
            <span class="cm-bulk-cnt" data-el="bulk-cnt">0 selected</span>
            <button type="button" data-act="bulk-read">✓ Read</button>
            <button type="button" data-act="bulk-unread">✉ Unread</button>
            <button type="button" data-act="bulk-move" data-el="bulk-move">📦 Archive</button>
            <button type="button" class="danger" data-act="bulk-delete">🗑 Delete</button>
            <button type="button" data-act="bulk-clear" title="Clear selection">✕</button>
          </div>

          <div class="cm-items" data-el="items"><div class="cm-state">Brewing your inbox…</div></div>
        </section>

        <main class="cm-view">
          <div class="cm-empty" data-el="empty">
            <div class="cm-empty-mark">☕</div>
            <div>Select a message to read</div>
            <div class="cm-empty-hint">Press <kbd>C</kbd> to compose · <kbd>/</kbd> to search · <kbd>J</kbd>/<kbd>K</kbd> to navigate · <kbd>?</kbd> for shortcuts</div>
          </div>

          <div class="cm-msg" data-el="msg" hidden>
            <div class="cm-msg-head">
              <div class="cm-msg-actions">
                <button class="cm-btn back" data-act="back">← Back</button>
                <button class="cm-btn" data-act="reply" title="Reply (r)">↩ Reply</button>
                <button class="cm-btn" data-act="reply-all" title="Reply all (a)">↩↩ Reply all</button>
                <button class="cm-btn" data-act="forward" title="Forward (f)">↪ Forward</button>
                <button class="cm-btn" data-act="star-current" data-el="btn-star" title="Star (s)">☆ Star</button>
                <button class="cm-btn" data-act="move-current" data-el="btn-move" title="Archive (e)">📦 Archive</button>
                <button class="cm-btn" data-act="toggle-read" data-el="btn-toggle-read" title="Toggle read (u)">✉ Mark unread</button>
                <button class="cm-btn accent" data-act="create-task" title="Turn email into task (t)">+ Task</button>
                <button class="cm-btn danger" data-act="delete" title="Delete (#)">🗑 Delete</button>
              </div>
              <div class="cm-subj-row">
                <div class="cm-msg-subj" data-el="subj"></div>
                <button type="button" class="cm-thread-pill" data-el="thread-pill" data-act="expand-all" hidden></button>
              </div>
            </div>

            <div class="cm-thread-scroll" data-el="thread-scroll"></div>

            <div class="cm-qreply" data-el="qreply">
              <div class="cm-qreply-row">
                <textarea data-el="qr-body" placeholder="Write a quick reply… (Cmd+Enter to send)"></textarea>
                <button type="button" class="cm-btn" data-act="qr-popout" title="Open in full editor">⤢ Full</button>
                <button type="button" class="cm-send" data-act="qr-send" style="padding:8px 14px">Reply ↗</button>
              </div>
            </div>
          </div>
        </main>

        <!-- Compose Modal -->
        <div class="cm-modal" data-el="modal" hidden>
          <form class="cm-card" data-el="form">
            <div class="cm-card-head">
              <div class="cm-card-title" data-el="compose-title">New message</div>
              <button type="button" class="cm-icon-btn" data-act="close" title="Save draft & close (Esc)">✕</button>
            </div>
            <div class="cm-card-body">
              <div class="cm-field"><label>From</label><input data-el="c-from" readonly/></div>

              <div class="cm-field" data-chip-field="to">
                <div class="cm-field-top">
                  <label>To</label>
                  <div class="cm-cc-toggles">
                    <button type="button" class="cm-link-btn" data-act="show-cc">+ Cc</button>
                    <button type="button" class="cm-link-btn" data-act="show-bcc">+ Bcc</button>
                  </div>
                </div>
                <div class="cm-chips-box" data-el="chips-to">
                  <input class="cm-chip-in" data-el="in-to" placeholder="Teammate name or email…" autocomplete="off"/>
                </div>
                <div class="cm-ac" data-el="ac-to" hidden></div>
              </div>

              <div class="cm-field" data-el="wrap-cc" data-chip-field="cc" hidden>
                <label>Cc</label>
                <div class="cm-chips-box" data-el="chips-cc">
                  <input class="cm-chip-in" data-el="in-cc" placeholder="Add Cc recipients…" autocomplete="off"/>
                </div>
                <div class="cm-ac" data-el="ac-cc" hidden></div>
              </div>

              <div class="cm-field" data-el="wrap-bcc" data-chip-field="bcc" hidden>
                <label>Bcc</label>
                <div class="cm-chips-box" data-el="chips-bcc">
                  <input class="cm-chip-in" data-el="in-bcc" placeholder="Add Bcc recipients…" autocomplete="off"/>
                </div>
                <div class="cm-ac" data-el="ac-bcc" hidden></div>
              </div>

              <div class="cm-field"><label>Subject</label><input data-el="c-subj" placeholder="Subject"/></div>

              <div class="cm-field">
                <label>Message</label>
                <div class="cm-editor-wrap">
                  <div class="cm-toolbar" data-el="toolbar">
                    <button type="button" class="cm-tbtn" data-cmd="bold" title="Bold (Cmd+B)"><b>B</b></button>
                    <button type="button" class="cm-tbtn" data-cmd="italic" title="Italic (Cmd+I)"><i>I</i></button>
                    <button type="button" class="cm-tbtn" data-cmd="underline" title="Underline (Cmd+U)"><u>U</u></button>
                    <button type="button" class="cm-tbtn" data-cmd="insertUnorderedList" title="Bullet list">• List</button>
                    <button type="button" class="cm-tbtn" data-cmd="insertOrderedList" title="Numbered list">1. List</button>
                    <button type="button" class="cm-tbtn" data-cmd="code" title="Code snippet">&lt;/&gt;</button>
                    <button type="button" class="cm-tbtn" data-cmd="link" title="Insert link">🔗 Link</button>
                    <button type="button" class="cm-tbtn" data-cmd="removeFormat" title="Clear formatting">⌫</button>
                  </div>
                  <div class="cm-editor" data-el="c-editor" contenteditable="true"></div>
                </div>
              </div>

              <div class="cm-c-atts" data-el="c-atts" hidden></div>
              <input type="file" data-el="c-file" multiple hidden/>
              <div class="cm-error" data-el="c-err" hidden></div>
            </div>
            <div class="cm-card-foot">
              <div class="cm-foot-left">
                <button type="button" class="cm-btn" data-act="attach-file">📎 Attach</button>
                <button type="button" class="cm-btn" data-act="discard-draft">🗑 Discard</button>
                <span class="cm-draft-stat" data-el="draft-stat"></span>
              </div>
              <div class="cm-foot-right">
                <button type="submit" class="cm-send" data-el="c-send">Send ↗</button>
              </div>
            </div>
          </form>
        </div>

        <!-- Create Task from Email Modal -->
        <div class="cm-modal" data-el="task-modal" hidden>
          <form class="cm-card narrow" data-el="task-form">
            <div class="cm-card-head">
              <div class="cm-card-title">📋 Create Task from Email</div>
              <button type="button" class="cm-icon-btn" data-act="close-task">✕</button>
            </div>
            <div class="cm-card-body">
              <div class="cm-field"><label>Task Title</label><input data-el="t-title" required/></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div class="cm-field">
                  <label>Priority</label>
                  <select data-el="t-priority">
                    <option value="normal" selected>Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div class="cm-field"><label>Due Date (Optional)</label><input type="date" data-el="t-due"/></div>
              </div>
              <div class="cm-field"><label>Notes & Context</label><textarea data-el="t-desc" rows="5"></textarea></div>
              <div class="cm-error" data-el="t-err" hidden></div>
            </div>
            <div class="cm-card-foot">
              <button type="button" class="cm-btn" data-act="close-task">Cancel</button>
              <button type="submit" class="cm-send" data-el="t-submit">Add to Tasks ↗</button>
            </div>
          </form>
        </div>

        <!-- Signature Settings Modal -->
        <div class="cm-modal" data-el="sig-modal" hidden>
          <form class="cm-card narrow" data-el="sig-form">
            <div class="cm-card-head">
              <div class="cm-card-title">⚙ Email Signature</div>
              <button type="button" class="cm-icon-btn" data-act="close-sig">✕</button>
            </div>
            <div class="cm-card-body">
              <label style="display:flex;align-items:center;gap:8px;font-size:.72rem;font-weight:700;cursor:pointer">
                <input type="checkbox" data-el="sig-enabled" style="accent-color:var(--cm-caramel)"/>
                Automatically append signature to outgoing mail
              </label>
              <div class="cm-field">
                <label>Signature Text</label>
                <textarea data-el="sig-text" rows="4" placeholder="Your Name&#10;Role · CaffnCode"></textarea>
              </div>
            </div>
            <div class="cm-card-foot">
              <button type="button" class="cm-btn" data-act="close-sig">Cancel</button>
              <button type="submit" class="cm-send">Save Signature</button>
            </div>
          </form>
        </div>

        <!-- Keyboard Shortcuts Modal -->
        <div class="cm-modal" data-el="kbd-modal" hidden>
          <div class="cm-card narrow">
            <div class="cm-card-head">
              <div class="cm-card-title">⌨ Keyboard Shortcuts</div>
              <button type="button" class="cm-icon-btn" data-act="close-kbd">✕</button>
            </div>
            <div class="cm-card-body">
              <div class="cm-kbd-grid">
                <div class="cm-kbd-row"><span>Compose</span><kbd>C</kbd></div>
                <div class="cm-kbd-row"><span>Search mail</span><kbd>/</kbd></div>
                <div class="cm-kbd-row"><span>Next / Prev</span><span><kbd>J</kbd> <kbd>K</kbd></span></div>
                <div class="cm-kbd-row"><span>Reply / Reply all</span><span><kbd>R</kbd> <kbd>A</kbd></span></div>
                <div class="cm-kbd-row"><span>Forward</span><kbd>F</kbd></div>
                <div class="cm-kbd-row"><span>Archive</span><kbd>E</kbd></div>
                <div class="cm-kbd-row"><span>Star / Unstar</span><kbd>S</kbd></div>
                <div class="cm-kbd-row"><span>Toggle unread</span><kbd>U</kbd></div>
                <div class="cm-kbd-row"><span>Create task</span><kbd>T</kbd></div>
                <div class="cm-kbd-row"><span>Delete</span><kbd>#</kbd></div>
                <div class="cm-kbd-row"><span>Go Inbox / Sent</span><span><kbd>G</kbd> <kbd>I</kbd> / <kbd>S</kbd></span></div>
                <div class="cm-kbd-row"><span>Send message</span><kbd>⌘ + ↵</kbd></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attachment Lightbox Preview Modal -->
        <div class="cm-modal" data-el="prev-modal" hidden>
          <div class="cm-card wide">
            <div class="cm-card-head">
              <div class="cm-card-title" data-el="prev-title">Attachment</div>
              <div style="display:flex;gap:8px;align-items:center">
                <a class="cm-btn accent" data-el="prev-dl" target="_blank" rel="noopener">⬇ Download</a>
                <button type="button" class="cm-icon-btn" data-act="close-prev">✕</button>
              </div>
            </div>
            <div class="cm-card-body" data-el="prev-body" style="align-items:center;justify-content:center;min-height:320px;background:#1a0f07"></div>
          </div>
        </div>

        <div class="cm-toast" data-el="toast"></div>
      </div>`;

    const cm = root.querySelector('.cm');
    const $ = (name) => root.querySelector(`[data-el="${name}"]`);

    // ── Toast (supports plain text & interactive action buttons) ──
    let toastT;
    function toast(msg, actions = [], duration = 3000) {
      const t = $('toast');
      clearTimeout(toastT);
      t.innerHTML = `<span>${esc(msg)}</span>` + actions.map((a, idx) =>
        `<button type="button" class="${a.ghost ? 'ghost' : ''}" data-toast-idx="${idx}">${esc(a.label)}</button>`
      ).join('');
      t.querySelectorAll('[data-toast-idx]').forEach((btn) => {
        btn.onclick = () => {
          const act = actions[Number(btn.dataset.toastIdx)];
          if (act?.onClick) act.onClick();
        };
      });
      t.classList.add('show');
      if (duration > 0) {
        toastT = setTimeout(() => t.classList.remove('show'), duration);
      }
    }
    function hideToast() {
      clearTimeout(toastT);
      $('toast').classList.remove('show');
    }

    // ── Core API helper with automatic 401 token refresh retry ──
    async function api(path, options = {}, _retried = false) {
      const token = await getToken(_retried);
      if (!token) {
        if (onUnauthorized) onUnauthorized();
        const e = new Error('Session expired. Please sign in again.');
        e.status = 401;
        throw e;
      }
      const res = await fetch(apiBase + path, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
      });
      if (res.status === 401 && !_retried) {
        return api(path, options, true);
      }
      let data = {};
      try { data = await res.json(); } catch { /* ignore */ }
      if (!res.ok || data.success === false) {
        if (res.status === 401 && onUnauthorized) onUnauthorized();
        const e = new Error(data.error || `Request failed (${res.status})`);
        e.status = res.status;
        throw e;
      }
      return data;
    }

    function updateDraftBadge() {
      const b = root.querySelector('[data-badge="DRAFT"]');
      if (!b) return;
      const n = st.drafts.length;
      b.textContent = String(n);
      b.hidden = !(n > 0);
    }

    function syncUnreadCounter(inboxCount) {
      if (onUnreadChange) onUnreadChange(inboxCount);
      try {
        const parentStat = window.parent?.document?.getElementById('stat-mail') || document.getElementById('stat-mail');
        if (parentStat) parentStat.textContent = String(inboxCount);
      } catch {}
    }

    async function loadFolders() {
      try {
        const data = await api('/api/folders');
        const prevMailbox = st.mailbox;
        st.mailbox = data.email || '';
        st.displayName = data.displayName || '';
        if (st.mailbox !== prevMailbox) loadLocalState();
        $('mailbox').textContent = st.mailbox || '-';
        $('c-from').value = st.displayName ? `${st.displayName} <${st.mailbox}>` : st.mailbox;

        let inboxUnread = 0;
        (data.folders || []).forEach((f) => {
          if (f.id === 'INBOX') inboxUnread = f.unreadCount || 0;
          if (f.id === 'DRAFT') return;
          const b = root.querySelector(`[data-badge="${f.id}"]`);
          if (!b) return;
          b.textContent = f.unreadCount;
          b.hidden = !(f.unreadCount > 0);
        });
        updateDraftBadge();
        syncUnreadCounter(inboxUnread);
        return true;
      } catch (err) {
        if (err.status === 401) {
          $('items').innerHTML = `<div class="cm-state err">🔒 Session expired. Signing out…</div>`;
          return false;
        }
        if (err.status === 403) {
          $('items').innerHTML = `<div class="cm-state err">📭 ${esc(err.message)}</div>`;
          $('mailbox').textContent = 'not assigned';
          return false;
        }
        console.warn('folders:', err);
        return true;
      }
    }

    async function loadContacts() {
      try {
        const data = await api('/api/contacts');
        st.contacts = data.contacts || [];
      } catch {}
    }

    function harvestContactsFromMessages(list) {
      const map = new Map(st.contacts.map((c) => [c.email.toLowerCase(), c]));
      (list || []).forEach((m) => {
        const add = (p) => {
          const em = (p?.email || '').trim().toLowerCase();
          if (!em || !em.includes('@') || map.has(em)) return;
          const entry = { name: p.name || em.split('@')[0], email: em, role: '' };
          map.set(em, entry);
          st.contacts.push(entry);
        };
        if (m.from) add(m.from);
        (m.to || []).forEach(add);
        (m.cc || []).forEach(add);
      });
    }

    // ── Filtering & Rendering Message List ──
    function getVisibleMessages() {
      let list = st.msgs.slice();
      if (st.folder === 'DRAFT') {
        const localRows = st.drafts.map((d) => ({
          id: d.id,
          isLocalDraft: true,
          draftData: d,
          subject: d.subject || '(no subject)',
          from: { name: st.displayName || 'Me', email: st.mailbox },
          to: (d.to || []).map((e) => ({ name: '', email: e })),
          date: d.updatedAt || Date.now(),
          unread: false,
          starred: false,
          snippet: (d.plain || '').slice(0, 140) || 'Saved draft…',
          hasAttachments: false,
        }));
        list = [...localRows, ...list];
      }
      if (st.filter === 'unread') list = list.filter((m) => m.unread);
      else if (st.filter === 'files') list = list.filter((m) => m.hasAttachments);
      else if (st.filter === 'starred') list = list.filter((m) => m.starred);

      const q = st.search.trim().toLowerCase();
      if (q) {
        list = list.filter((m) => {
          const hay = [
            m.subject,
            m.snippet,
            m.from?.name,
            m.from?.email,
            ...(m.to || []).map((t) => `${t.name || ''} ${t.email || ''}`),
          ].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      return list;
    }

    function updateBulkBar() {
      const n = st.selected.size;
      const bulk = $('bulk');
      bulk.hidden = n === 0;
      $('bulk-cnt').textContent = `${n} selected`;
      const moveBtn = $('bulk-move');
      if (st.folder === 'SPAM') moveBtn.textContent = '📥 Not spam';
      else if (st.folder === 'TRASH' || st.folder === 'ARCHIVED') moveBtn.textContent = '📥 Move to Inbox';
      else moveBtn.textContent = '📦 Archive';

      const vis = getVisibleMessages().filter((m) => !m.isLocalDraft);
      const chkAll = $('chk-all');
      chkAll.checked = vis.length > 0 && vis.every((m) => st.selected.has(m.id));
      chkAll.indeterminate = n > 0 && !chkAll.checked;
    }

    function renderList() {
      const visible = getVisibleMessages();
      $('count').textContent = visible.length + (st.hasMore && !st.search && st.filter === 'all' ? '+' : '');
      updateBulkBar();

      if (!visible.length) {
        const emptyMsg = st.search || st.filter !== 'all'
          ? 'No messages match your filter.'
          : 'Nothing here. Enjoy your coffee ☕';
        $('items').innerHTML = `<div class="cm-state">${esc(emptyMsg)}</div>`;
        return;
      }

      $('items').innerHTML = visible.map((m) => {
        const who = st.folder === 'SENT' || st.folder === 'DRAFT' || m.isLocalDraft
          ? 'To: ' + ((m.to || []).map((t) => t.name || t.email).join(', ') || '(no recipient)')
          : (m.from?.name || m.from?.email || 'Unknown');
        const checked = st.selected.has(m.id) ? ' checked' : '';
        const starCls = m.starred ? ' on' : '';
        const starChar = m.starred ? '★' : '☆';
        return `
          <div class="cm-item${m.unread ? ' unread' : ''}${st.current?.id === m.id ? ' active' : ''}${st.selected.has(m.id) ? ' selected' : ''}"
               data-id="${esc(m.id)}" data-local-draft="${m.isLocalDraft ? '1' : ''}">
            <div class="cm-item-left">
              ${m.isLocalDraft ? '' : `<input type="checkbox" class="cm-chk" data-chk-id="${esc(m.id)}"${checked}/>`}
              ${m.isLocalDraft ? '' : `<button type="button" class="cm-star${starCls}" data-star-id="${esc(m.id)}" title="Star">${starChar}</button>`}
            </div>
            <div class="cm-item-body">
              <div class="cm-item-top"><span class="cm-from">${esc(who)}</span><span class="cm-date">${fmtDate(m.date)}</span></div>
              <div class="cm-subj">${m.isLocalDraft ? '<span class="cm-draft-pill">Draft</span>' : ''}${m.hasAttachments ? '📎 ' : ''}${esc(m.subject || '(no subject)')}</div>
              <div class="cm-snip">${esc(m.snippet || '')}</div>
            </div>
          </div>`;
      }).join('') + (st.hasMore && !st.search && st.filter === 'all' ? '<button class="cm-more" data-act="more">Load more</button>' : '');
    }

    async function loadMessages(append = false, silent = false) {
      const btn = root.querySelector('[data-act="refresh"]');
      if (!silent) btn.classList.add('spin');
      if (!append && !silent) $('items').innerHTML = '<div class="cm-state">Brewing your inbox…</div>';
      try {
        let q = `/api/inbox?folder=${encodeURIComponent(st.folder)}&page_size=20`;
        if (st.filter === 'unread') q += '&only_unread=1';
        if (append && st.pageToken) q += `&page_token=${encodeURIComponent(st.pageToken)}`;
        const data = await api(q);
        const incoming = (data.messages || []).map((m) => {
          if (st.readIds.has(m.id)) m.unread = false;
          if (st.starredIds.has(m.id)) m.starred = true;
          if (m.starred) st.starredIds.add(m.id);
          return m;
        });
        harvestContactsFromMessages(incoming);
        st.msgs = append ? st.msgs.concat(incoming) : incoming;
        st.hasMore = !!data.hasMore;
        st.pageToken = data.pageToken || '';
        renderList();
      } catch (err) {
        if (!silent) {
          $('items').innerHTML = `<div class="cm-state err">${err.status === 403 ? '📭 ' : '⚠ '}${esc(err.message)}</div>`;
        }
      } finally {
        btn.classList.remove('spin');
      }
    }

    function showEmpty() {
      st.current = null;
      st.threadMsgs = [];
      $('msg').hidden = true;
      $('empty').style.display = '';
      cm.classList.remove('cm-reading');
      root.querySelectorAll('.cm-item.active').forEach((el) => el.classList.remove('active'));
    }

    function syncReadingActionButtons() {
      if (!st.current) return;
      const cached = st.msgs.find((x) => x.id === st.current.id) || st.current;
      $('btn-star').textContent = cached.starred ? '★ Starred' : '☆ Star';
      $('btn-toggle-read').textContent = cached.unread ? '✓ Mark read' : '✉ Mark unread';
      const moveBtn = $('btn-move');
      if (st.folder === 'SPAM') moveBtn.textContent = '📥 Not spam';
      else if (st.folder === 'TRASH' || st.folder === 'ARCHIVED') moveBtn.textContent = '📥 Move to Inbox';
      else moveBtn.textContent = '📦 Archive';
    }

    function buildIframeSrcdoc(m) {
      const body = m.html && m.html.trim()
        ? m.html
        : `<pre style="white-space:pre-wrap;word-break:break-word;font-family:inherit">${esc(m.plainText || '')}</pre>`;
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank">
        <style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#1a1a1a;margin:14px 16px;word-wrap:break-word}
        a{color:#c87941}img{max-width:100%;height:auto}blockquote{border-left:3px solid #e8c9a0;margin:6px 0;padding-left:12px;color:#555}</style>
        </head><body>${body}</body></html>`;
    }

    function renderThreadCards(messages, expandAll = false) {
      const container = $('thread-scroll');
      const pill = $('thread-pill');
      if (messages.length > 1) {
        pill.hidden = false;
        pill.textContent = expandAll ? `${messages.length} in thread · Collapse` : `${messages.length} in thread · Expand all`;
        pill.dataset.expanded = expandAll ? '1' : '0';
      } else {
        pill.hidden = true;
      }

      container.innerHTML = messages.map((m, idx) => {
        const isLast = idx === messages.length - 1;
        const collapsed = !expandAll && !isLast && m.id !== st.current?.id;
        const fromName = m.from?.name || m.from?.email || 'Unknown';
        const toStr = (m.to || []).map((t) => t.name ? `${t.name} <${t.email}>` : t.email).join(', ');
        const ccStr = (m.cc || []).map((t) => t.email).join(', ');
        const dateStr = m.date ? new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
        const atts = m.attachments || [];
        return `
          <div class="cm-tcard${collapsed ? ' collapsed' : ''}" data-tcard-id="${esc(m.id)}">
            <div class="cm-tcard-head" data-act="toggle-tcard">
              <div class="cm-avatar">${esc(fromName.charAt(0).toUpperCase())}</div>
              <div class="cm-meta-text">
                <div><b>${esc(fromName)}</b> <span>${m.from?.email ? `&lt;${esc(m.from.email)}&gt;` : ''}</span></div>
                <div class="cm-tcard-recips"><span>to: ${esc(toStr || 'me')}${ccStr ? ` · cc: ${esc(ccStr)}` : ''}</span></div>
                <div class="cm-tcard-snip">${esc(m.snippet || '')}</div>
              </div>
              <div class="cm-meta-date">${esc(dateStr)}</div>
            </div>
            <div class="cm-tcard-body">
              <div class="cm-attach"${atts.length ? '' : ' hidden'}>
                ${atts.map((a) => {
                  const isPreviewable = /\.(png|jpe?g|gif|webp|svg|pdf)$/i.test(a.filename || '') || /^(image\/|application\/pdf)/i.test(a.contentType || '');
                  return `<button type="button" class="cm-att-chip" data-att-msg="${esc(m.id)}" data-att-id="${esc(a.id)}" data-att-name="${esc(a.filename)}" data-att-prev="${isPreviewable ? '1' : '0'}">
                    📎 ${esc(a.filename)}${a.size ? ` <small>(${fmtBytes(a.size)})</small>` : ''} <span>${isPreviewable ? '👁' : '⬇'}</span>
                  </button>`;
                }).join('')}
              </div>
              <iframe class="cm-frame" data-frame-idx="${idx}" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" title="Email content"></iframe>
            </div>
          </div>`;
      }).join('');

      messages.forEach((m, idx) => {
        const frame = container.querySelector(`[data-frame-idx="${idx}"]`);
        if (!frame) return;
        frame.onload = () => {
          try {
            const h = frame.contentDocument?.documentElement?.scrollHeight || 260;
            frame.style.height = Math.max(220, Math.min(h + 20, 1400)) + 'px';
          } catch {}
        };
        frame.srcdoc = buildIframeSrcdoc(m);
      });
    }

    async function openMessage(id) {
      // Check if local draft
      const localDraft = st.drafts.find((d) => d.id === id);
      if (localDraft) {
        openComposeFromDraft(localDraft);
        return;
      }

      root.querySelectorAll('.cm-item').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
      const listItem = root.querySelector(`.cm-item[data-id="${cssEsc(id)}"]`);
      const cached = st.msgs.find((m) => m.id === id);
      const wasUnread = cached?.unread;
      if (listItem) listItem.classList.remove('unread');
      if (cached) cached.unread = false;
      st.readIds.add(id);
      saveReadIds();

      if (wasUnread) {
        const b = root.querySelector(`[data-badge="${st.folder}"]`);
        if (b && !b.hidden) {
          const cur = parseInt(b.textContent || '1', 10);
          if (cur <= 1) b.hidden = true;
          else b.textContent = String(cur - 1);
          if (st.folder === 'INBOX') syncUnreadCounter(Math.max(0, cur - 1));
        }
      }

      $('empty').style.display = 'none';
      $('msg').hidden = false;
      cm.classList.add('cm-reading');
      $('subj').textContent = cached?.subject || 'Loading…';
      $('qr-body').value = '';
      $('qr-body').placeholder = `Reply to ${cached?.from?.name || cached?.from?.email || 'sender'}… (Cmd+Enter to send)`;
      $('thread-scroll').innerHTML = `<div class="cm-state">Loading message…</div>`;

      try {
        const threadQ = cached?.threadId ? `&thread_id=${encodeURIComponent(cached.threadId)}&include_thread=1` : '&include_thread=1';
        const data = await api(`/api/message?id=${encodeURIComponent(id)}${threadQ}`);
        const m = data.message;
        const list = (data.messages && data.messages.length) ? data.messages : [m];
        if (cached?.starred) m.starred = true;
        st.current = m;
        st.threadMsgs = list;
        harvestContactsFromMessages(list);
        $('subj').textContent = m.subject || '(no subject)';
        $('qr-body').placeholder = `Reply to ${m.from?.name || m.from?.email || 'sender'}… (Cmd+Enter to send)`;
        syncReadingActionButtons();
        renderThreadCards(list, false);
      } catch (err) {
        $('thread-scroll').innerHTML = `<div class="cm-state err">⚠ ${esc(err.message)}</div>`;
      }
    }

    // ── Attachment Download & Preview ──
    async function handleAttachmentClick(msgId, attId, filename, previewable) {
      if (!attId) {
        toast('⚠ Attachment ID unavailable');
        return;
      }
      toast('Fetching attachment…', [], 2000);
      try {
        const { downloadUrl } = await api(`/api/message?id=${encodeURIComponent(msgId)}&attachment_id=${encodeURIComponent(attId)}`);
        hideToast();
        if (previewable) {
          $('prev-title').textContent = '📎 ' + filename;
          $('prev-dl').href = downloadUrl;
          const isPdf = /\.pdf$/i.test(filename);
          $('prev-body').innerHTML = isPdf
            ? `<iframe src="${esc(downloadUrl)}" style="width:100%;height:70vh;border:0;background:#fff"></iframe>`
            : `<img src="${esc(downloadUrl)}" alt="${esc(filename)}" style="max-width:100%;max-height:70vh;object-fit:contain"/>`;
          $('prev-modal').hidden = false;
        } else {
          window.open(downloadUrl, '_blank', 'noopener');
        }
      } catch (err) {
        toast('⚠ ' + err.message);
      }
    }

    // ── Recipient Chips & Team Directory Autocomplete ──
    function renderChips(field) {
      const box = $(`chips-${field}`);
      const input = $(`in-${field}`);
      box.querySelectorAll('.cm-rchip').forEach((el) => el.remove());
      st.composeChips[field].forEach((email, idx) => {
        const contact = st.contacts.find((c) => c.email.toLowerCase() === email.toLowerCase());
        const label = contact?.name && contact.name !== email ? `${contact.name} <${email}>` : email;
        const chip = document.createElement('span');
        chip.className = 'cm-rchip';
        chip.innerHTML = `<span>${esc(label)}</span><button type="button" data-rm-field="${field}" data-rm-idx="${idx}">×</button>`;
        box.insertBefore(chip, input);
      });
    }

    function addChip(field, rawVal) {
      const parts = String(rawVal || '').split(/[,;]/);
      let added = false;
      parts.forEach((p) => {
        const str = p.trim();
        if (!str) return;
        const match = str.match(/^(?:(.*)<)?([^>]+)>?$/);
        const em = (match ? match[2] : str).trim().toLowerCase();
        if (em && em.includes('@') && !st.composeChips[field].includes(em)) {
          st.composeChips[field].push(em);
          added = true;
        }
      });
      if (added) {
        renderChips(field);
        scheduleDraftSave();
      }
      $(`in-${field}`).value = '';
      $(`ac-${field}`).hidden = true;
    }

    function showAutocomplete(field) {
      const input = $(`in-${field}`);
      const ac = $(`ac-${field}`);
      const q = input.value.trim().toLowerCase();
      if (!q) {
        ac.hidden = true;
        return;
      }
      const existing = new Set(st.composeChips[field]);
      const matches = st.contacts
        .filter((c) => !existing.has(c.email.toLowerCase()) && (
          c.email.toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
        ))
        .slice(0, 7);

      if (!matches.length) {
        ac.hidden = true;
        return;
      }
      ac.innerHTML = matches.map((c, i) => `
        <div class="cm-ac-row${i === 0 ? ' hi' : ''}" data-ac-field="${field}" data-ac-email="${esc(c.email)}">
          <div><b>${esc(c.name || c.email)}</b> <small>&lt;${esc(c.email)}&gt;</small></div>
          ${c.role ? `<span class="cm-ac-tag">${esc(c.role)}</span>` : ''}
        </div>`).join('');
      ac.hidden = false;
    }

    ['to', 'cc', 'bcc'].forEach((field) => {
      const box = $(`chips-${field}`);
      const input = $(`in-${field}`);
      const ac = $(`ac-${field}`);
      box.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-rm-field]');
        if (rm) {
          st.composeChips[field].splice(Number(rm.dataset.rmIdx), 1);
          renderChips(field);
          scheduleDraftSave();
          return;
        }
        input.focus();
      });
      input.addEventListener('input', () => showAutocomplete(field));
      input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === 'Tab' || e.key === ',' || e.key === ';') && input.value.trim()) {
          e.preventDefault();
          const hi = ac && !ac.hidden ? ac.querySelector('.cm-ac-row.hi') : null;
          if (hi && (e.key === 'Enter' || e.key === 'Tab') && !input.value.includes('@')) {
            addChip(field, hi.dataset.acEmail);
          } else {
            addChip(field, input.value);
          }
        } else if (e.key === 'Backspace' && !input.value && st.composeChips[field].length) {
          st.composeChips[field].pop();
          renderChips(field);
          scheduleDraftSave();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (ac.hidden) return;
          e.preventDefault();
          const rows = [...ac.querySelectorAll('.cm-ac-row')];
          const cur = rows.findIndex((r) => r.classList.contains('hi'));
          rows.forEach((r) => r.classList.remove('hi'));
          const next = e.key === 'ArrowDown' ? (cur + 1) % rows.length : (cur - 1 + rows.length) % rows.length;
          if (rows[next]) rows[next].classList.add('hi');
        }
      });
      input.addEventListener('blur', () => {
        setTimeout(() => {
          if (input.value.trim().includes('@')) addChip(field, input.value);
          ac.hidden = true;
        }, 160);
      });
    });

    // ── Rich-Text Toolbar & Compose Attachments ──
    $('toolbar').addEventListener('mousedown', (e) => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn) return;
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      $('c-editor').focus();
      if (cmd === 'link') {
        const url = prompt('Enter link URL (https://…):', 'https://');
        if (url && url !== 'https://') document.execCommand('createLink', false, url);
      } else if (cmd === 'code') {
        const sel = window.getSelection()?.toString() || 'code';
        document.execCommand('insertHTML', false, `<code>${esc(sel)}</code>`);
      } else {
        document.execCommand(cmd, false, null);
      }
      scheduleDraftSave();
    });

    function renderComposeFiles() {
      const wrap = $('c-atts');
      wrap.hidden = st.composeFiles.length === 0;
      wrap.innerHTML = st.composeFiles.map((f, idx) =>
        `<span class="cm-c-att">📎 ${esc(f.filename)} <small>(${fmtBytes(f.size)})</small> <button type="button" data-rm-file="${idx}">✕</button></span>`
      ).join('');
    }

    async function addComposeFiles(fileList) {
      const files = [...(fileList || [])];
      let totalSize = st.composeFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      for (const file of files) {
        if (totalSize + file.size > 8 * 1024 * 1024) {
          toast('⚠ Attachments capped at 8 MB per email');
          break;
        }
        totalSize += file.size;
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        st.composeFiles.push({
          filename: file.name,
          size: file.size,
          contentType: file.type || 'application/octet-stream',
          content: base64,
        });
      }
      renderComposeFiles();
    }

    $('c-file').addEventListener('change', (e) => {
      addComposeFiles(e.target.files);
      e.target.value = '';
    });

    const composeCard = $('form');
    composeCard.addEventListener('dragover', (e) => { e.preventDefault(); composeCard.classList.add('dragover'); });
    composeCard.addEventListener('dragleave', () => composeCard.classList.remove('dragover'));
    composeCard.addEventListener('drop', (e) => {
      e.preventDefault();
      composeCard.classList.remove('dragover');
      if (e.dataTransfer?.files?.length) addComposeFiles(e.dataTransfer.files);
    });

    // ── Auto-Saved Local Drafts ──
    let draftSaveT;
    function scheduleDraftSave() {
      clearTimeout(draftSaveT);
      draftSaveT = setTimeout(persistActiveDraft, 600);
    }

    function persistActiveDraft() {
      if ($('modal').hidden) return;
      const subj = $('c-subj').value.trim();
      const plain = $('c-editor').innerText.trim();
      const html = $('c-editor').innerHTML;
      const hasRecips = st.composeChips.to.length || st.composeChips.cc.length || st.composeChips.bcc.length;
      if (!subj && !plain && !hasRecips) return;

      if (!st.activeDraftId) st.activeDraftId = 'draft_' + Date.now();
      const entry = {
        id: st.activeDraftId,
        to: [...st.composeChips.to],
        cc: [...st.composeChips.cc],
        bcc: [...st.composeChips.bcc],
        subject: $('c-subj').value,
        html,
        plain,
        replyMeta: { ...st.composeReplyMeta },
        updatedAt: Date.now(),
      };
      const idx = st.drafts.findIndex((d) => d.id === st.activeDraftId);
      if (idx >= 0) st.drafts[idx] = entry;
      else st.drafts.unshift(entry);
      saveDraftsStore();
      $('draft-stat').textContent = 'Draft saved ✓';
      if (st.folder === 'DRAFT') renderList();
    }

    function removeDraftById(id) {
      if (!id) return;
      st.drafts = st.drafts.filter((d) => d.id !== id);
      saveDraftsStore();
      if (st.folder === 'DRAFT') renderList();
    }

    $('c-subj').addEventListener('input', scheduleDraftSave);
    $('c-editor').addEventListener('input', scheduleDraftSave);

    // ── Compose Open / Close / Send with 5-Second Undo Send ──
    function buildSignatureHtml() {
      const cfg = getSignatureConfig();
      if (!cfg.enabled || !cfg.text.trim()) return '';
      return `<br><br><div data-cm-sig="1" style="color:#6b3d1e;font-size:13px;border-top:1px dashed #e8c9a0;padding-top:8px;margin-top:12px;white-space:pre-wrap">${esc(cfg.text.trim())}</div>`;
    }

    function openCompose({ to = [], cc = [], bcc = [], subject = '', html = '', quoteHtml = '', title = 'New message', inReplyTo = '', references = '', draftId = null, files = [] } = {}) {
      st.activeDraftId = draftId;
      st.composeChips = {
        to: (Array.isArray(to) ? to : String(to).split(/[,;]/)).map((s) => s.trim().toLowerCase()).filter((s) => s.includes('@')),
        cc: (Array.isArray(cc) ? cc : String(cc).split(/[,;]/)).map((s) => s.trim().toLowerCase()).filter((s) => s.includes('@')),
        bcc: (Array.isArray(bcc) ? bcc : String(bcc).split(/[,;]/)).map((s) => s.trim().toLowerCase()).filter((s) => s.includes('@')),
      };
      st.composeFiles = [...files];
      st.composeReplyMeta = { inReplyTo, references };

      $('compose-title').textContent = title;
      renderChips('to');
      renderChips('cc');
      renderChips('bcc');
      $('in-to').value = '';
      $('in-cc').value = '';
      $('in-bcc').value = '';
      $('wrap-cc').hidden = st.composeChips.cc.length === 0;
      $('wrap-bcc').hidden = st.composeChips.bcc.length === 0;
      $('c-subj').value = subject;

      const sigHtml = draftId ? '' : buildSignatureHtml();
      $('c-editor').innerHTML = html || (`<div><br></div>${sigHtml}${quoteHtml}`);
      renderComposeFiles();
      $('c-err').hidden = true;
      $('draft-stat').textContent = draftId ? 'Restored draft' : '';
      $('modal').hidden = false;

      setTimeout(() => {
        if (st.composeChips.to.length) $('c-editor').focus();
        else $('in-to').focus();
      }, 30);
    }

    function openComposeFromDraft(d) {
      openCompose({
        title: 'Edit draft',
        to: d.to || [],
        cc: d.cc || [],
        bcc: d.bcc || [],
        subject: d.subject || '',
        html: d.html || '',
        inReplyTo: d.replyMeta?.inReplyTo || '',
        references: d.replyMeta?.references || '',
        draftId: d.id,
      });
    }

    function closeCompose(saveDraft = true) {
      if (saveDraft) persistActiveDraft();
      $('modal').hidden = true;
      st.activeDraftId = null;
    }

    function discardCompose() {
      const id = st.activeDraftId;
      $('modal').hidden = true;
      st.activeDraftId = null;
      if (id) {
        removeDraftById(id);
        toast('Draft discarded');
      }
    }

    function quoteHtmlBlock(m) {
      const when = m.date ? new Date(m.date).toLocaleString() : '';
      const who = m.from?.name ? `${m.from.name} &lt;${esc(m.from.email)}&gt;` : esc(m.from?.email || '');
      const body = m.html && m.html.trim() ? m.html : `<pre style="white-space:pre-wrap">${esc(m.plainText || '')}</pre>`;
      return `<br><blockquote style="border-left:3px solid #e8c9a0;margin:10px 0;padding-left:12px;color:#555"><div style="font-size:12px;color:#888;margin-bottom:6px">On ${esc(when)}, ${who} wrote:</div>${body}</blockquote>`;
    }

    function queueSend(payload, restoreSnapshot) {
      // Flush any previous pending send immediately first
      if (st.pendingSend) {
        const prev = st.pendingSend;
        clearInterval(st.undoCountdown);
        clearTimeout(st.undoTimer);
        st.pendingSend = null;
        executeSendNow(prev.payload);
      }

      let secsLeft = 5;
      const renderUndoToast = () => {
        toast(`📤 Sending in ${secsLeft}s…`, [
          {
            label: 'Undo',
            onClick: () => {
              clearInterval(st.undoCountdown);
              clearTimeout(st.undoTimer);
              const snap = st.pendingSend?.restoreSnapshot;
              st.pendingSend = null;
              hideToast();
              if (snap) snap();
              toast('Send cancelled');
            },
          },
          {
            label: 'Send now',
            ghost: true,
            onClick: () => {
              clearInterval(st.undoCountdown);
              clearTimeout(st.undoTimer);
              const cur = st.pendingSend;
              st.pendingSend = null;
              if (cur) executeSendNow(cur.payload);
            },
          },
        ], 0);
      };

      st.pendingSend = { payload, restoreSnapshot };
      renderUndoToast();
      st.undoCountdown = setInterval(() => {
        secsLeft -= 1;
        if (secsLeft > 0) renderUndoToast();
      }, 1000);
      st.undoTimer = setTimeout(() => {
        clearInterval(st.undoCountdown);
        const cur = st.pendingSend;
        st.pendingSend = null;
        if (cur) executeSendNow(cur.payload);
      }, 5000);
    }

    async function executeSendNow(payload) {
      toast('Sending…', [], 10000);
      try {
        await api('/api/send', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast('✓ Message sent');
        loadFolders();
        if (st.folder === 'SENT' || st.folder === 'INBOX') loadMessages(false, true);
      } catch (err) {
        toast('⚠ Send failed: ' + err.message, [], 5000);
      }
    }

    function submitCompose(e) {
      if (e) e.preventDefault();
      ['to', 'cc', 'bcc'].forEach((f) => {
        if ($(`in-${f}`).value.trim()) addChip(f, $(`in-${f}`).value);
      });
      if (!st.composeChips.to.length) {
        $('c-err').textContent = '⚠ Add at least one recipient in "To".';
        $('c-err').hidden = false;
        $('in-to').focus();
        return;
      }

      const toSnap = [...st.composeChips.to];
      const ccSnap = [...st.composeChips.cc];
      const bccSnap = [...st.composeChips.bcc];
      const subjSnap = $('c-subj').value;
      const htmlSnap = $('c-editor').innerHTML;
      const textSnap = $('c-editor').innerText;
      const filesSnap = [...st.composeFiles];
      const replySnap = { ...st.composeReplyMeta };
      const draftIdSnap = st.activeDraftId;

      if (draftIdSnap) removeDraftById(draftIdSnap);
      closeCompose(false);

      const payload = {
        to: toSnap,
        cc: ccSnap,
        bcc: bccSnap,
        subject: subjSnap,
        html: `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a">${htmlSnap}</div>`,
        text: textSnap,
        attachments: filesSnap,
        inReplyTo: replySnap.inReplyTo || undefined,
        references: replySnap.references || undefined,
      };

      queueSend(payload, () => {
        openCompose({
          title: 'Edit message',
          to: toSnap,
          cc: ccSnap,
          bcc: bccSnap,
          subject: subjSnap,
          html: htmlSnap,
          files: filesSnap,
          inReplyTo: replySnap.inReplyTo,
          references: replySnap.references,
        });
      });
    }

    function sendQuickReply() {
      const m = st.current;
      if (!m) return;
      const raw = $('qr-body').value.trim();
      if (!raw) {
        $('qr-body').focus();
        return;
      }
      const replyTarget = m.replyTo || m.from?.email || '';
      if (!replyTarget) {
        toast('⚠ No reply address on this message');
        return;
      }
      const subj = /^re:/i.test(m.subject || '') ? m.subject : `Re: ${m.subject || ''}`;
      const sigHtml = buildSignatureHtml();
      const htmlBody = `<div style="white-space:pre-wrap">${esc(raw)}</div>${sigHtml}`;
      $('qr-body').value = '';

      queueSend({
        to: [replyTarget],
        subject: subj,
        html: `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a">${htmlBody}</div>`,
        text: raw,
        inReplyTo: m.smtpMessageId || undefined,
        references: m.references || undefined,
      }, () => {
        $('qr-body').value = raw;
        $('qr-body').focus();
      });
    }

    // ── Single & Bulk Message Actions (Delete, Archive, Star, Read/Unread) ──
    async function performAction(action, ids, toastLabel, removeFromCurrentFolder = false) {
      if (!ids.length) return;
      const idSet = new Set(ids);

      // Optimistic local state updates
      if (action === 'mark_read' || action === 'mark_all_read') {
        st.msgs.forEach((m) => { if (idSet.has(m.id)) { m.unread = false; st.readIds.add(m.id); } });
        saveReadIds();
      } else if (action === 'mark_unread') {
        st.msgs.forEach((m) => { if (idSet.has(m.id)) { m.unread = true; st.readIds.delete(m.id); } });
        saveReadIds();
      } else if (action === 'star') {
        st.msgs.forEach((m) => { if (idSet.has(m.id)) { m.starred = true; st.starredIds.add(m.id); } });
        if (st.current && idSet.has(st.current.id)) st.current.starred = true;
        saveStarredIds();
      } else if (action === 'unstar') {
        st.msgs.forEach((m) => { if (idSet.has(m.id)) { m.starred = false; st.starredIds.delete(m.id); } });
        if (st.current && idSet.has(st.current.id)) st.current.starred = false;
        if (st.folder === 'STARRED') removeFromCurrentFolder = true;
        saveStarredIds();
      }

      if (removeFromCurrentFolder) {
        st.msgs = st.msgs.filter((m) => !idSet.has(m.id));
        ids.forEach((id) => st.selected.delete(id));
        if (st.current && idSet.has(st.current.id)) showEmpty();
      }

      renderList();
      syncReadingActionButtons();
      if (toastLabel) toast(toastLabel);

      try {
        await api('/api/action', {
          method: 'POST',
          body: JSON.stringify({ action, folder: st.folder, ids }),
        });
        loadFolders();
      } catch (err) {
        toast('⚠ ' + err.message);
      }
    }

    async function delCurrent() {
      if (!st.current) return;
      await performAction('delete', [st.current.id], 'Moved to Trash', true);
    }

    async function moveCurrent() {
      if (!st.current) return;
      const toInbox = st.folder === 'SPAM' || st.folder === 'TRASH' || st.folder === 'ARCHIVED';
      await performAction(toInbox ? 'move_inbox' : 'archive', [st.current.id], toInbox ? '✓ Moved to Inbox' : '📦 Archived', true);
    }

    async function toggleStarById(id) {
      const target = st.msgs.find((m) => m.id === id) || (st.current?.id === id ? st.current : null);
      if (!target) return;
      const nextStar = !target.starred;
      await performAction(nextStar ? 'star' : 'unstar', [id], nextStar ? '★ Starred' : 'Removed star', false);
    }

    async function toggleReadCurrent() {
      if (!st.current) return;
      const target = st.msgs.find((m) => m.id === st.current.id) || st.current;
      const nextUnread = !target.unread;
      target.unread = nextUnread;
      await performAction(nextUnread ? 'mark_unread' : 'mark_read', [st.current.id], nextUnread ? 'Marked as unread' : 'Marked as read', false);
    }

    async function markAllAsRead() {
      const unreadIds = st.msgs.filter((m) => m.unread).map((m) => m.id);
      if (!unreadIds.length) {
        toast('All messages are already read');
        return;
      }
      const b = root.querySelector(`[data-badge="${st.folder}"]`);
      if (b) { b.textContent = '0'; b.hidden = true; }
      if (st.folder === 'INBOX') syncUnreadCounter(0);
      await performAction('mark_all_read', unreadIds, `✓ Marked ${unreadIds.length} message${unreadIds.length > 1 ? 's' : ''} as read`, false);
    }

    // ── Create Task from Email ──
    function openTaskModal() {
      const m = st.current;
      if (!m) return;
      $('t-title').value = m.subject || 'Follow up on email';
      $('t-priority').value = 'normal';
      $('t-due').value = '';
      const fromLine = m.from?.name ? `${m.from.name} <${m.from.email}>` : (m.from?.email || '');
      const when = m.date ? new Date(m.date).toLocaleString() : '';
      $('t-desc').value = `From: ${fromLine}\nDate: ${when}\n\n${(m.plainText || m.snippet || '').slice(0, 600)}`;
      $('t-err').hidden = true;
      $('task-modal').hidden = false;
      setTimeout(() => $('t-title').focus(), 30);
    }

    $('task-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('t-submit');
      $('t-err').hidden = true;
      btn.disabled = true;
      btn.textContent = 'Creating…';
      try {
        const token = await getToken();
        const res = await fetch(`${ADMIN_API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: $('t-title').value.trim(),
            priority: $('t-priority').value,
            dueDate: $('t-due').value || null,
            description: $('t-desc').value.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.error || `Failed (${res.status})`);
        $('task-modal').hidden = true;
        toast('✓ Added to CaffnCode Tasks');
      } catch (err) {
        $('t-err').textContent = '⚠ ' + err.message;
        $('t-err').hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Add to Tasks ↗';
      }
    });

    // ── Signature Modal ──
    function openSigModal() {
      const cfg = getSignatureConfig();
      $('sig-enabled').checked = cfg.enabled !== false;
      $('sig-text').value = cfg.text || '';
      $('sig-modal').hidden = false;
    }

    $('sig-form').addEventListener('submit', (e) => {
      e.preventDefault();
      setSignatureConfig({
        enabled: $('sig-enabled').checked,
        text: $('sig-text').value,
      });
      $('sig-modal').hidden = true;
      toast('✓ Signature saved');
    });

    // ── Folder Switching, Search & Filters ──
    function switchFolder(id) {
      st.folder = id;
      st.pageToken = '';
      st.selected.clear();
      root.querySelectorAll('.cm-folder').forEach((el) => el.classList.toggle('active', el.dataset.folder === id));
      $('title').textContent = FOLDERS.find((f) => f[0] === id)?.[1] || id;
      cm.classList.remove('cm-show-folders');
      showEmpty();
      loadMessages();
    }

    $('search').addEventListener('input', () => {
      st.search = $('search').value;
      $('search-clear').hidden = !st.search;
      renderList();
    });
    $('search-clear').addEventListener('click', () => {
      st.search = '';
      $('search').value = '';
      $('search-clear').hidden = true;
      renderList();
    });

    $('chk-all').addEventListener('change', () => {
      const vis = getVisibleMessages().filter((m) => !m.isLocalDraft);
      if ($('chk-all').checked) vis.forEach((m) => st.selected.add(m.id));
      else vis.forEach((m) => st.selected.delete(m.id));
      renderList();
    });

    $('qr-body').addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        sendQuickReply();
      }
    });

    // ── Reply / Reply All / Forward Builders ──
    function triggerReply(replyAll = false) {
      const m = st.current;
      if (!m) return;
      const myMail = (st.mailbox || '').toLowerCase();
      const primaryTo = m.replyTo || m.from?.email || '';
      const toArr = primaryTo ? [primaryTo] : [];
      let ccArr = [];
      if (replyAll) {
        const extras = [...(m.to || []), ...(m.cc || [])]
          .map((x) => (x.email || '').toLowerCase())
          .filter((em) => em && em !== myMail && !toArr.map((t) => t.toLowerCase()).includes(em));
        ccArr = [...new Set(extras)];
      }
      openCompose({
        title: replyAll ? 'Reply all' : 'Reply',
        to: toArr,
        cc: ccArr,
        subject: /^re:/i.test(m.subject || '') ? m.subject : `Re: ${m.subject || ''}`,
        quoteHtml: quoteHtmlBlock(m),
        inReplyTo: m.smtpMessageId || '',
        references: m.references || '',
      });
    }

    function triggerForward() {
      const m = st.current;
      if (!m) return;
      const fwdHeader = `<br><div style="border-top:1px dashed #c87941;padding-top:10px;margin-top:10px;font-size:12px;color:#555"><b>---------- Forwarded message ----------</b><br>From: ${esc(m.from?.name || '')} &lt;${esc(m.from?.email || '')}&gt;<br>Date: ${esc(m.date ? new Date(m.date).toLocaleString() : '')}<br>Subject: ${esc(m.subject || '')}</div><br>${m.html || `<pre style="white-space:pre-wrap">${esc(m.plainText || '')}</pre>`}`;
      openCompose({
        title: 'Forward',
        subject: /^fwd?:/i.test(m.subject || '') ? m.subject : `Fwd: ${m.subject || ''}`,
        quoteHtml: fwdHeader,
      });
    }

    // ── Click Event Delegation ──
    root.addEventListener('click', (e) => {
      // Autocomplete click
      const acRow = e.target.closest('[data-ac-field]');
      if (acRow) {
        addChip(acRow.dataset.acField, acRow.dataset.acEmail);
        return;
      }

      // Remove compose attachment
      const rmFile = e.target.closest('[data-rm-file]');
      if (rmFile) {
        st.composeFiles.splice(Number(rmFile.dataset.rmFile), 1);
        renderComposeFiles();
        return;
      }

      // Star button in list
      const starBtn = e.target.closest('[data-star-id]');
      if (starBtn) {
        e.stopPropagation();
        toggleStarById(starBtn.dataset.starId);
        return;
      }

      // Checkbox in list
      const chk = e.target.closest('[data-chk-id]');
      if (chk) {
        e.stopPropagation();
        const id = chk.dataset.chkId;
        if (chk.checked) st.selected.add(id);
        else st.selected.delete(id);
        renderList();
        return;
      }

      // Filter chip
      const fchip = e.target.closest('[data-filter]');
      if (fchip) {
        const nextF = fchip.dataset.filter;
        const wasUnreadServer = st.filter === 'unread' || nextF === 'unread';
        st.filter = nextF;
        root.querySelectorAll('.cm-fchip').forEach((el) => el.classList.toggle('on', el.dataset.filter === nextF));
        if (wasUnreadServer) loadMessages();
        else renderList();
        return;
      }

      // Attachment chip in reading pane
      const attChip = e.target.closest('[data-att-id]');
      if (attChip) {
        handleAttachmentClick(
          attChip.dataset.attMsg,
          attChip.dataset.attId,
          attChip.dataset.attName,
          attChip.dataset.attPrev === '1'
        );
        return;
      }

      // Sidebar folder
      const folder = e.target.closest('.cm-folder');
      if (folder) return switchFolder(folder.dataset.folder);

      // Message row
      const item = e.target.closest('.cm-item');
      if (item) return openMessage(item.dataset.id);

      // Actions
      const actEl = e.target.closest('[data-act]');
      if (!actEl) {
        if (e.target === $('modal')) closeCompose(true);
        if (e.target === $('task-modal')) $('task-modal').hidden = true;
        if (e.target === $('sig-modal')) $('sig-modal').hidden = true;
        if (e.target === $('kbd-modal')) $('kbd-modal').hidden = true;
        if (e.target === $('prev-modal')) { $('prev-modal').hidden = true; $('prev-body').innerHTML = ''; }
        return;
      }

      switch (actEl.dataset.act) {
        case 'compose': case 'compose-mini': openCompose(); break;
        case 'close': closeCompose(true); break;
        case 'discard-draft': discardCompose(); break;
        case 'show-cc': $('wrap-cc').hidden = false; $('in-cc').focus(); break;
        case 'show-bcc': $('wrap-bcc').hidden = false; $('in-bcc').focus(); break;
        case 'attach-file': $('c-file').click(); break;
        case 'refresh': loadFolders(); loadMessages(); break;
        case 'mark-all-read': markAllAsRead(); break;
        case 'toggle-read': toggleReadCurrent(); break;
        case 'star-current': if (st.current) toggleStarById(st.current.id); break;
        case 'move-current': moveCurrent(); break;
        case 'create-task': openTaskModal(); break;
        case 'close-task': $('task-modal').hidden = true; break;
        case 'open-sig': openSigModal(); break;
        case 'close-sig': $('sig-modal').hidden = true; break;
        case 'open-shortcuts': $('kbd-modal').hidden = false; break;
        case 'close-kbd': $('kbd-modal').hidden = true; break;
        case 'close-prev': $('prev-modal').hidden = true; $('prev-body').innerHTML = ''; break;
        case 'more': loadMessages(true); break;
        case 'menu': cm.classList.toggle('cm-show-folders'); break;
        case 'back': showEmpty(); break;
        case 'delete': delCurrent(); break;
        case 'reply': triggerReply(false); break;
        case 'reply-all': triggerReply(true); break;
        case 'forward': triggerForward(); break;
        case 'qr-send': sendQuickReply(); break;
        case 'qr-popout': {
          const draftTxt = $('qr-body').value;
          $('qr-body').value = '';
          triggerReply(false);
          if (draftTxt) {
            $('c-editor').innerHTML = `<div style="white-space:pre-wrap">${esc(draftTxt)}</div>` + $('c-editor').innerHTML;
          }
          break;
        }
        case 'toggle-tcard': {
          const card = actEl.closest('.cm-tcard');
          if (card && st.threadMsgs.length > 1) card.classList.toggle('collapsed');
          break;
        }
        case 'expand-all': {
          const exp = $('thread-pill').dataset.expanded !== '1';
          renderThreadCards(st.threadMsgs, exp);
          break;
        }
        case 'bulk-read': performAction('mark_read', [...st.selected], '✓ Marked read', false); st.selected.clear(); renderList(); break;
        case 'bulk-unread': performAction('mark_unread', [...st.selected], '✉ Marked unread', false); st.selected.clear(); renderList(); break;
        case 'bulk-move': {
          const toInbox = st.folder === 'SPAM' || st.folder === 'TRASH' || st.folder === 'ARCHIVED';
          performAction(toInbox ? 'move_inbox' : 'archive', [...st.selected], toInbox ? '✓ Moved to Inbox' : '📦 Archived', true);
          break;
        }
        case 'bulk-delete': performAction('delete', [...st.selected], '🗑 Moved to Trash', true); break;
        case 'bulk-clear': st.selected.clear(); renderList(); break;
      }
    });

    $('form').addEventListener('submit', submitCompose);

    // ── Superhuman-Style Keyboard Shortcuts ──
    function navigateDelta(delta) {
      const vis = getVisibleMessages();
      if (!vis.length) return;
      const curIdx = st.current ? vis.findIndex((m) => m.id === st.current.id) : -1;
      const nextIdx = Math.max(0, Math.min(vis.length - 1, curIdx + delta));
      if (vis[nextIdx]) openMessage(vis[nextIdx].id);
    }

    const onKey = (e) => {
      if (!root.isConnected || root.offsetParent === null) return;

      // Cmd/Ctrl + Enter inside Compose submits immediately
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !$('modal').hidden) {
        e.preventDefault();
        submitCompose();
        return;
      }

      if (e.key === 'Escape') {
        if (!$('prev-modal').hidden) { $('prev-modal').hidden = true; $('prev-body').innerHTML = ''; return; }
        if (!$('kbd-modal').hidden) { $('kbd-modal').hidden = true; return; }
        if (!$('sig-modal').hidden) { $('sig-modal').hidden = true; return; }
        if (!$('task-modal').hidden) { $('task-modal').hidden = true; return; }
        if (!$('modal').hidden) { closeCompose(true); return; }
      }

      const tag = (e.target?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!$('modal').hidden || !$('task-modal').hidden || !$('sig-modal').hidden) return;

      // Two-key "g then i/s/d/a" navigation
      if (Date.now() - st.lastGKeyAt < 900) {
        st.lastGKeyAt = 0;
        if (e.key === 'i') { e.preventDefault(); switchFolder('INBOX'); return; }
        if (e.key === 's') { e.preventDefault(); switchFolder('STARRED'); return; }
        if (e.key === 't') { e.preventDefault(); switchFolder('SENT'); return; }
        if (e.key === 'd') { e.preventDefault(); switchFolder('DRAFT'); return; }
        if (e.key === 'a') { e.preventDefault(); switchFolder('ARCHIVED'); return; }
      }

      switch (e.key) {
        case 'g': st.lastGKeyAt = Date.now(); break;
        case 'c': e.preventDefault(); openCompose(); break;
        case '/': e.preventDefault(); $('search').focus(); break;
        case '?': e.preventDefault(); $('kbd-modal').hidden = !$('kbd-modal').hidden; break;
        case 'j': case 'ArrowDown': e.preventDefault(); navigateDelta(1); break;
        case 'k': case 'ArrowUp': e.preventDefault(); navigateDelta(-1); break;
        case 'r': if (st.current) { e.preventDefault(); triggerReply(false); } break;
        case 'a': if (st.current) { e.preventDefault(); triggerReply(true); } break;
        case 'f': if (st.current) { e.preventDefault(); triggerForward(); } break;
        case 'e': if (st.current) { e.preventDefault(); moveCurrent(); } break;
        case '#': if (st.current) { e.preventDefault(); delCurrent(); } break;
        case 's': if (st.current) { e.preventDefault(); toggleStarById(st.current.id); } break;
        case 'u': if (st.current) { e.preventDefault(); toggleReadCurrent(); } break;
        case 't': if (st.current) { e.preventDefault(); openTaskModal(); } break;
      }
    };
    document.addEventListener('keydown', onKey);

    // ── Live 30s Background Poll ──
    const pollId = setInterval(async () => {
      if (document.visibilityState !== 'visible' || root.offsetParent === null) return;
      const prevTopId = st.msgs[0]?.id;
      await loadFolders();
      if (!st.selected.size && !st.pageToken && (st.folder === 'INBOX' || st.folder === 'SPAM')) {
        await loadMessages(false, true);
        if (prevTopId && st.msgs[0]?.id && st.msgs[0].id !== prevTopId && st.msgs[0].unread) {
          toast('📬 New mail arrived');
        }
      }
    }, 30000);

    // ── Boot ──
    (async () => {
      const ok = await loadFolders();
      if (ok) {
        loadMessages();
        loadContacts();
      }
    })();

    return {
      refresh() { loadFolders(); loadMessages(); },
      compose: openCompose,
      destroy() {
        clearInterval(pollId);
        clearInterval(st.undoCountdown);
        clearTimeout(st.undoTimer);
        document.removeEventListener('keydown', onKey);
        root.innerHTML = '';
      },
    };
  }

  window.CaffnMail = { mount };
})();
