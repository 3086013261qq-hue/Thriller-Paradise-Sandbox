/* Thriller Paradise · Poker Floating Profile v1.0.0
 * Standalone optional Tavern Helper CHARACTER script. No MVU and no data writes.
 * Interaction approach audited against BS1 v0.5.2 / 旅途线索.js.
 */
(function () {
  'use strict';
  var REV = 'tp-poker-1.0.0';
  var INSTANCE = '__ThrillerPokerFloat';
  var PREFKEY = 'TP.poker.layout.v1';
  var host = window, doc = window.document;
  for (var step = 0; step < 9; step++) {
    try {
      if (doc.querySelector('#send_textarea')) break;
      if (host.parent === host) break;
      void host.parent.document;
      host = host.parent;
      doc = host.document;
    } catch (_ignored) { break; }
  }
  if (!doc || !doc.documentElement) return;
  var api = {
    messages: typeof getChatMessages === 'function' ? getChatMessages : null,
    lastId: typeof getLastMessageId === 'function' ? getLastMessageId : null,
    eventOn: typeof eventOn === 'function' ? eventOn : null,
    button: typeof getButtonEvent === 'function' ? getButtonEvent : null,
    events: typeof tavern_events !== 'undefined' ? tavern_events : null
  };
  var existing = host[INSTANCE];
  if (existing && existing.rev === REV && existing.root && existing.root.isConnected) {
    existing.setAPI(api);
    existing.refresh();
    return;
  }
  if (existing && typeof existing.destroy === 'function') existing.destroy();
  var orphan = doc.getElementById('tp-poker-shell');
  if (orphan) orphan.remove();
  function element(tag, text, cls) {
    var e = doc.createElement(tag);
    if (text !== undefined && text !== null) e.textContent = String(text);
    if (cls) e.className = cls;
    return e;
  }
  function readPrefs() {
    try {
      var data = JSON.parse(host.localStorage.getItem(PREFKEY) || '{}');
      return data && typeof data === 'object' ? data : {};
    } catch (_ignored) { return {}; }
  }
  var prefs = readPrefs();
  function savePrefs() {
    try { host.localStorage.setItem(PREFKEY, JSON.stringify(prefs)); }
    catch (_ignored) {}
  }
  var root = element('div', null, 'tp-poker-shell');
  root.id = 'tp-poker-shell';
  root.setAttribute('data-revision', REV);
  var style = element('style');
  style.textContent = [
    '#tp-poker-shell{position:fixed!important;inset:0!important;width:0!important;height:0!important;pointer-events:none!important;z-index:2147483600!important;font:13px/1.55 system-ui,-apple-system,"Microsoft YaHei",sans-serif;color:#f1e4e4;}',
    '#tp-poker-shell *,#tp-poker-shell *:before,#tp-poker-shell *:after{box-sizing:border-box!important;}',
    '#tp-poker-shell button{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
    '#tp-poker-shell button:focus-visible{outline:2px solid #ffbac3;outline-offset:2px;}',
    '#tp-poker-shell .tp-orb{position:fixed!important;pointer-events:auto!important;touch-action:none!important;width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;border:1px solid #c94d64!important;border-radius:50%!important;padding:0!important;display:grid!important;place-items:center!important;cursor:grab!important;background:radial-gradient(circle at 28% 19%,#46404a 0%,#19181d 42%,#07080d 80%)!important;box-shadow:0 0 0 2px #120e13,0 4px 17px #000b,0 0 16px #c02d474b!important;color:#ed7189!important;font:32px/1 Georgia,serif!important;user-select:none!important;}',
    '#tp-poker-shell .tp-orb span{transform:translateY(-1px);pointer-events:none;}',
    '#tp-poker-shell .tp-panel{position:fixed!important;pointer-events:auto!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;overscroll-behavior:contain!important;background:linear-gradient(155deg,#2a151f 0%,#16151c 42%,#0d1017 100%)!important;border:1px solid #a9445b!important;border-radius:14px!important;box-shadow:0 0 0 3px #07070a9c,0 16px 42px #000c,0 0 26px #a7283933!important;}',
    '#tp-poker-shell .tp-panel[hidden]{display:none!important;}',
    '#tp-poker-shell .tp-head{cursor:grab;touch-action:none;display:flex;align-items:center;gap:8px;padding:12px 12px 9px;border-bottom:1px solid #8f3a5155;background:linear-gradient(90deg,#3a1c28bb,#11121960);user-select:none;}',
    '#tp-poker-shell .tp-suit{font:31px/1 Georgia,serif;color:#ff859a;filter:drop-shadow(0 0 7px #d7445b88);pointer-events:none;}',
    '#tp-poker-shell .tp-headtext{flex:1;min-width:0;pointer-events:none;}',
    '#tp-poker-shell .tp-headtext strong{display:block;font:600 14px/1.35 Georgia,"Microsoft YaHei",serif;color:#f4ced4;letter-spacing:1px;}',
    '#tp-poker-shell .tp-headtext small{display:block;font-size:10px;color:#bc929b;}',
    '#tp-poker-shell .tp-control{min-width:35px;min-height:35px;padding:4px 8px;border-radius:8px;border:1px solid #845060;color:#edbec8;background:#251b25;}',
    '#tp-poker-shell .tp-close{font-size:21px;line-height:1;}',
    '#tp-poker-shell .tp-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;padding:8px 10px 6px;}',
    '#tp-poker-shell .tp-tab{min-width:0;min-height:36px;padding:6px 2px;font-size:11px;color:#d3a5ac;border:1px solid #52333f;background:#19151c;border-radius:6px;}',
    '#tp-poker-shell .tp-tab[aria-selected=true]{background:#5c2638;color:#ffe4e9;border-color:#c25069;}',
    '#tp-poker-shell .tp-scroll{padding:7px 13px 12px;overflow-y:auto;min-height:0;flex:1;overscroll-behavior:contain;}',
    '#tp-poker-shell .tp-note{color:#b895a0;font-size:11px;padding:5px 0 8px;border-bottom:1px solid #4d303b;}',
    '#tp-poker-shell .tp-row{display:grid;grid-template-columns:minmax(84px,32%) minmax(0,1fr);gap:10px;align-items:start;padding:8px 0;border-bottom:1px solid #51334055;}',
    '#tp-poker-shell .tp-name{color:#bd909e;font-size:11px;}',
    '#tp-poker-shell .tp-value{min-width:0;color:#f5e9ea;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;}',
    '#tp-poker-shell .tp-empty{padding:12px 3px;color:#c1a2a9;}',
    '#tp-poker-shell .tp-foot{display:flex;justify-content:space-between;gap:8px;padding:7px 11px;border-top:1px solid #61384670;color:#987c86;font-size:10px;}',
    '@media(max-width:350px){#tp-poker-shell .tp-row{grid-template-columns:minmax(72px,29%) 1fr;gap:6px}#tp-poker-shell .tp-tabs{gap:2px}}',
    '@media(prefers-reduced-motion:reduce){#tp-poker-shell *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}'
  ].join('');
  root.appendChild(style);
  var orb = element('button', null, 'tp-orb');
  orb.type = 'button';
  orb.setAttribute('aria-label', '打开封不觉的扑克档案');
  orb.setAttribute('aria-expanded', 'false');
  orb.title = '疯不觉 · 扑克档案（拖动可移动）';
  orb.appendChild(element('span', '♠'));
  root.appendChild(orb);
  var panel = element('section', null, 'tp-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '封不觉人物档案');
  var head = element('header', null, 'tp-head');
  head.appendChild(element('span', '♠', 'tp-suit'));
  var htext = element('div', null, 'tp-headtext');
  htext.appendChild(element('strong', '疯不觉 · 扑克档案'));
  htext.appendChild(element('small', 'PLAYER PROFILE / NO MVU'));
  head.appendChild(htext);
  var reset = element('button', '归位', 'tp-control');
  reset.type = 'button';
  reset.title = '恢复按钮和窗口默认位置';
  var close = element('button', '×', 'tp-control tp-close');
  close.type = 'button';
  close.setAttribute('aria-label', '关闭档案');
  head.appendChild(reset);
  head.appendChild(close);
  panel.appendChild(head);
  var tabRow = element('div', null, 'tp-tabs');
  tabRow.setAttribute('role', 'tablist');
  var tabDefs = [
    ['profile', '状态'],
    ['equipment', '装备'],
    ['skills', '技能'],
    ['specialties', '专精']
  ];
  var tabs = {};
  tabDefs.forEach(function (pair) {
    var b = element('button', pair[1], 'tp-tab');
    b.type = 'button';
    b.dataset.tab = pair[0];
    b.setAttribute('role', 'tab');
    tabRow.appendChild(b);
    tabs[pair[0]] = b;
  });
  panel.appendChild(tabRow);
  var content = element('div', null, 'tp-scroll');
  content.setAttribute('role', 'tabpanel');
  panel.appendChild(content);
  var footer = element('div', null, 'tp-foot');
  var sourceInfo = element('span', '尚未读取本聊天状态');
  footer.appendChild(sourceInfo);
  footer.appendChild(element('span', '♠ READ ONLY'));
  panel.appendChild(footer);
  root.appendChild(panel);
  (doc.documentElement || doc.body).appendChild(root);
  var tab = ['profile', 'equipment', 'skills', 'specialties'].indexOf(prefs.tab) > -1 ? prefs.tab : 'profile';
  var latest = null, lastSource = '', destroyed = false, off = [];
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function viewport() {
    var v = host.visualViewport;
    return {
      x: (v && v.offsetLeft) || 0,
      y: (v && v.offsetTop) || 0,
      w: Math.max(260, (v && v.width) || host.innerWidth || 360),
      h: Math.max(240, (v && v.height) || host.innerHeight || 640)
    };
  }
  function dimensions(target, v) {
    if (target === panel) {
      panel.style.width = Math.max(240, Math.min(365, v.w - 24)) + 'px';
      panel.style.maxHeight = Math.max(154, Math.min(540, v.h * 0.7)) + 'px';
      panel.style.height = Math.max(154, Math.min(485, v.h * 0.7)) + 'px';
    }
    var rect = target.getBoundingClientRect();
    return {
      w: rect.width || (target === orb ? 54 : Math.min(365, v.w - 24)),
      h: rect.height || (target === orb ? 54 : Math.max(154, Math.min(485, v.h * 0.7)))
    };
  }
  function placeOne(target, key) {
    var v = viewport(), d = dimensions(target, v);
    var mx = Math.max(8, v.w - d.w - 8);
    var my = Math.max(8, v.h - d.h - 8);
    var p = prefs[key];
    var defX = key === 'orb' ? mx : Math.max(8, v.w - d.w - 12);
    var defY = key === 'orb' ? Math.max(8, v.h - d.h - 82) : 14;
    var x = p && Number.isFinite(p.x) ? 8 + clamp(p.x, 0, 1) * Math.max(0, mx - 8) : defX;
    var y = p && Number.isFinite(p.y) ? 8 + clamp(p.y, 0, 1) * Math.max(0, my - 8) : defY;
    target.style.left = (v.x + clamp(x, 8, mx)) + 'px';
    target.style.top = (v.y + clamp(y, 8, my)) + 'px';
  }
  function place() { placeOne(orb, 'orb'); placeOne(panel, 'panel'); }
  function drag(handle, target, key) {
    var dragData = null, skip = false;
    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      if (key === 'panel' && event.target.closest('button')) return;
      var rect = target.getBoundingClientRect();
      dragData = { id: event.pointerId, x: event.clientX, y: event.clientY,
        left: rect.left, top: rect.top, moved: false };
      skip = false;
      try { handle.setPointerCapture(event.pointerId); } catch (_ignored) {}
    });
    handle.addEventListener('pointermove', function (event) {
      if (!dragData || dragData.id !== event.pointerId) return;
      var dx = event.clientX - dragData.x, dy = event.clientY - dragData.y;
      if (!dragData.moved && Math.hypot(dx, dy) < 6) return;
      dragData.moved = true;
      var v = viewport(), d = dimensions(target, v);
      var mx = Math.max(8, v.w - d.w - 8);
      var my = Math.max(8, v.h - d.h - 8);
      var x = clamp(dragData.left - v.x + dx, 8, mx);
      var y = clamp(dragData.top - v.y + dy, 8, my);
      target.style.left = (v.x + x) + 'px';
      target.style.top = (v.y + y) + 'px';
      prefs[key] = {
        x: (x - 8) / Math.max(1, mx - 8),
        y: (y - 8) / Math.max(1, my - 8)
      };
      event.preventDefault();
    });
    function finish(event) {
      if (!dragData || dragData.id !== event.pointerId) return;
      skip = dragData.moved;
      if (skip) savePrefs();
      dragData = null;
    }
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('click', function (event) {
      if (skip) {
        skip = false;
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, true);
  }
  function parseStatus(message) {
    if (typeof message !== 'string') return null;
    var rx = /<status\b[^>]*>([\s\S]*?)<\/status\s*>/gi, match, block = null;
    while ((match = rx.exec(message)) !== null) block = match[1];
    if (!block) return null;
    var fields = Object.create(null), lines = block.slice(0, 16000).split(/\r?\n/);
    lines.forEach(function (line) {
      var m = line.match(/^\s*([^:：<>\n]{1,25})\s*[:：]\s*(.*?)\s*$/);
      if (!m) return;
      var key = m[1].trim(), value = m[2].trim();
      if (value) fields[key] = value.slice(0, 800);
    });
    return Object.keys(fields).length ? fields : null;
  }
  function readField(names) {
    if (!latest) return '未确认';
    for (var i = 0; i < names.length; i++) {
      var value = latest[names[i]];
      if (value && String(value).trim()) return String(value);
    }
    return '未确认';
  }
  var groups = {
    profile: [
      ['人物', ['人物', '玩家', '角色']], ['等级', ['封不觉等级', '等级', 'Lv']],
      ['经验', ['经验', '经验值']], ['生存值', ['生存值', 'HP']],
      ['体能值', ['体能值', 'SP']], ['惊吓值', ['惊吓值']],
      ['游戏币', ['游戏币']], ['技巧值', ['技巧值']],
      ['称号', ['称号', '当前称号']], ['魂意', ['魂意']],
      ['现实时间', ['现实时间']], ['剧本', ['当前剧本', '剧本']],
      ['当前位置', ['当前位置', '地点']]
    ],
    equipment: [
      ['当前装备', ['装备', '已装备']], ['行囊与关键道具', ['行囊', '背包']],
      ['武器', ['武器']], ['服装／护具', ['护具', '防具', '服装']]
    ],
    skills: [
      ['当前技能', ['技能', '已学技能']], ['称号能力', ['称号能力']],
      ['魂意', ['魂意']], ['使用限制', ['限制', '技能限制']]
    ],
    specialties: [
      ['八系专精', ['专精', '各系专精']], ['通用', ['通用']],
      ['格斗', ['格斗']], ['射击', ['射击']], ['器械', ['器械']],
      ['侦查', ['侦查']], ['医疗', ['医疗']], ['灵术', ['灵术']],
      ['召唤', ['召唤']]
    ]
  };
  function draw() {
    tabDefs.forEach(function (pair) {
      tabs[pair[0]].setAttribute('aria-selected', pair[0] === tab ? 'true' : 'false');
    });
    content.replaceChildren();
    var note = element('div', latest
      ? '数据来自本聊天中最近一条已确认的 <status>；不会预测下一阶段。'
      : '尚未找到可解析的 <status>。可以继续剧情，等待下一条状态输出。', 'tp-note');
    content.appendChild(note);
    if (!latest) {
      content.appendChild(element('div', '未确认 · 不读取其他聊天、也不猜测等级或装备。', 'tp-empty'));
      return;
    }
    groups[tab].forEach(function (pair) {
      var value = readField(pair[1]);
      if (tab === 'specialties' && pair[0] !== '八系专精' &&
          value === '未确认' && readField(['专精']) !== '未确认') return;
      if (tab !== 'profile' && value === '未确认' &&
          !['当前装备', '行囊与关键道具', '当前技能', '八系专精'].includes(pair[0])) return;
      var row = element('div', null, 'tp-row');
      row.appendChild(element('div', pair[0], 'tp-name'));
      row.appendChild(element('div', value, 'tp-value'));
      content.appendChild(row);
    });
  }
  function detectMessages() {
    if (typeof api.messages !== 'function') {
      latest = null; lastSource = '酒馆助手缺少 getChatMessages 接口';
      draw(); sourceInfo.textContent = lastSource; return;
    }
    var range = '0-{{lastMessageId}}';
    if (typeof api.lastId === 'function') {
      try {
        var last = Number(api.lastId());
        if (Number.isFinite(last) && last >= 0)
          range = Math.max(0, last - 20) + '-' + last;
      } catch (_ignored) {}
    }
    return Promise.resolve(api.messages(range, {
      role: 'assistant', hide_state: 'unhidden', include_swipes: false
    })).then(function (rows) {
      if (destroyed) return;
      var found = null, messageId = '';
      if (!Array.isArray(rows)) rows = [];
      for (var i = rows.length - 1; i >= 0; i--) {
        var fields = parseStatus(rows[i].message || rows[i].mes || '');
        if (!fields) continue;
        found = fields; messageId = String(rows[i].message_id);
        break;
      }
      latest = found; lastSource = found ? '当前聊天 · 第' + messageId + '楼' : '当前聊天 · 尚无状态';
      sourceInfo.textContent = lastSource;
      draw();
    }).catch(function (error) {
      if (destroyed) return;
      latest = null;
      sourceInfo.textContent = '读取失败';
      content.replaceChildren(element('div', '状态读取失败：' + String(error && error.message || error).slice(0, 160), 'tp-empty'));
    });
  }
  function setTab(next) {
    if (!tabs[next]) return;
    tab = next; prefs.tab = next; savePrefs(); draw();
  }
  tabDefs.forEach(function (pair) {
    tabs[pair[0]].addEventListener('click', function () { setTab(pair[0]); });
  });
  function open() {
    panel.hidden = false;
    orb.setAttribute('aria-expanded', 'true');
    place(); detectMessages();
  }
  function closePanel() {
    panel.hidden = true;
    orb.setAttribute('aria-expanded', 'false');
  }
  orb.addEventListener('click', function () { panel.hidden ? open() : closePanel(); });
  close.addEventListener('click', closePanel);
  reset.addEventListener('click', function () {
    delete prefs.orb; delete prefs.panel; savePrefs(); place();
  });
  function escapeKey(event) { if (event.key === 'Escape') closePanel(); }
  doc.addEventListener('keydown', escapeKey);
  drag(orb, orb, 'orb');
  drag(head, panel, 'panel');
  var resize = function () { if (!destroyed) place(); };
  host.addEventListener('resize', resize);
  if (host.visualViewport) {
    host.visualViewport.addEventListener('resize', resize);
    host.visualViewport.addEventListener('scroll', resize);
  }
  function register(eventName, fn) {
    if (!api.eventOn || !eventName) return;
    try {
      var subscription = api.eventOn(eventName, fn);
      if (subscription && typeof subscription.stop === 'function') off.push(subscription.stop.bind(subscription));
    } catch (_ignored) {}
  }
  var instance = {
    rev: REV, root: root, open: open, close: closePanel, refresh: detectMessages,
    setAPI: function (updated) { api = updated || api; },
    destroy: function () {
      if (destroyed) return;
      destroyed = true;
      host.clearInterval(timer);
      doc.removeEventListener('keydown', escapeKey);
      host.removeEventListener('resize', resize);
      if (host.visualViewport) {
        host.visualViewport.removeEventListener('resize', resize);
        host.visualViewport.removeEventListener('scroll', resize);
      }
      off.forEach(function (stop) { try { stop(); } catch (_ignored) {} });
      root.remove();
      if (host[INSTANCE] === instance) delete host[INSTANCE];
    }
  };
  host[INSTANCE] = instance;
  if (api.events) {
    ['MESSAGE_RECEIVED', 'MESSAGE_UPDATED', 'MESSAGE_SWIPED', 'CHAT_CHANGED']
      .forEach(function (key) {
        register(api.events[key], function () {
          latest = null; lastSource = ''; sourceInfo.textContent = '正在读取当前聊天';
          if (!panel.hidden) detectMessages();
          else draw();
        });
      });
  }
  if (api.button) {
    try { register(api.button('扑克档案'), function () {
      var me = host[INSTANCE];
      if (me && me.rev === REV) me.open();
    }); } catch (_ignored) {}
  }
  var timer = host.setInterval(function () {
    if (destroyed) return;
    if (!root.isConnected) { instance.destroy(); return; }
    if (!panel.hidden) detectMessages();
  }, 2700);
  place();
  draw();
  window.addEventListener('pagehide', function () {
    if (host[INSTANCE] === instance) instance.destroy();
  }, { once: true });
})();
