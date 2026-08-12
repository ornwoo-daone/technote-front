// 알림: 우상단 벨 + 빨간 배지 + 우측 알림 리스트 + 화면 중앙 리퀴드 글래스 토스트
// 읽음 상태는 unread.js 와 같은 localStorage 'dbxRead' 를 공유한다.
(function () {
  var DOCS = window.DBX_DOCS || [];
  if (!DOCS.length) return;

  var READ_KEY = 'dbxRead';        // 읽은 문서 url 목록 (unread.js 공용)
  var SEEN_KEY = 'dbxSeenAt';      // 마지막 방문 시각 (토스트 판정용)
  var TOAST_KEY = 'dbxToasted';    // 이미 토스트로 알린 문서

  // 하위 폴더 페이지면 ../ 를 붙여야 루트 기준 url 이 맞는다
  var atRoot = /\/dbx-guide\/[^\/]*$/.test(location.pathname.replace(/\\/g, '/'));
  var PRE = atRoot ? '' : '../';

  function ls(k, dflt) { try { return JSON.parse(localStorage.getItem(k) || dflt); } catch (e) { return JSON.parse(dflt); } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function getRead() { return ls(READ_KEY, '[]'); }
  function markRead(u) { var l = getRead(); if (l.indexOf(u) < 0) { l.push(u); save(READ_KEY, l); } }

  // 최신순 (같은 날짜면 등록 순서 유지)
  var items = DOCS.slice().sort(function (a, b) { return (a.at < b.at) ? 1 : (a.at > b.at ? -1 : 0); });

  // 지금 보고 있는 문서는 읽음 처리 (알림 목록을 안 거치고 바로 열어도 배지가 줄어들도록)
  var here = location.pathname.replace(/\\/g, '/').split('/dbx-guide/')[1] || '';
  for (var h = 0; h < items.length; h++) if (items[h].u === here) markRead(here);

  // ---------- 스타일 ----------
  var css = ''
  + '.nt-btn{position:fixed;top:16px;right:16px;z-index:60;width:44px;height:44px;border-radius:50%;'
  + 'border:1px solid var(--line);background:var(--panel);color:var(--accent);cursor:pointer;'
  + 'display:inline-flex;align-items:center;justify-content:center;transition:.15s}'
  + '.nt-btn:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(0,0,0,.3);transform:translateY(-1px)}'
  + '.nt-btn svg{width:22px;height:22px;display:block;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
  + '.nt-btn.ring svg{transform-origin:50% 12%;animation:ntring 1s ease}'
  + '@keyframes ntring{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-11deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}}'
  + '.nt-badge{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;padding:0 5px;border-radius:99px;'
  + 'background:#e5484d;color:#fff;font:700 11px/19px var(--sans);text-align:center;'
  + 'box-shadow:0 2px 8px rgba(229,72,77,.55);pointer-events:none}'
  + '.nt-badge[hidden]{display:none}'

  // 패널
  + '.nt-panel{position:fixed;top:70px;right:16px;z-index:59;width:min(390px,calc(100vw - 32px));'
  + 'max-height:min(70vh,620px);display:flex;flex-direction:column;border-radius:18px;overflow:hidden;'
  + 'background:rgba(255,255,255,.10);-webkit-backdrop-filter:blur(22px) saturate(1.7);backdrop-filter:blur(22px) saturate(1.7);'
  + 'border:1px solid rgba(255,255,255,.18);box-shadow:0 22px 60px rgba(0,0,0,.45);'
  + 'opacity:0;transform:translateY(-8px) scale(.98);pointer-events:none;transition:opacity .22s ease,transform .22s ease}'
  + '.nt-panel.on{opacity:1;transform:none;pointer-events:auto}'
  + '.nt-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px 10px;'
  + 'border-bottom:1px solid rgba(255,255,255,.12)}'
  + '.nt-head b{font-size:14px;color:var(--ink)}'
  + '.nt-allread{background:none;border:1px solid var(--line);color:var(--muted);font-size:11px;'
  + 'padding:4px 10px;border-radius:99px;cursor:pointer;transition:.15s;white-space:nowrap}'
  + '.nt-allread:hover{border-color:var(--accent);color:var(--accent)}'
  + '.nt-list{overflow-y:auto;padding:8px}'
  + '.nt-item{position:relative;display:block;text-decoration:none;color:var(--ink);border-radius:13px;'
  + 'padding:11px 12px 11px 26px;transition:.15s;cursor:pointer}'
  + '.nt-item:hover{background:rgba(255,255,255,.10)}'
  + '.nt-item .nt-dot{position:absolute;left:11px;top:16px;width:7px;height:7px;border-radius:50%;background:#e5484d;'
  + 'box-shadow:0 0 0 3px rgba(229,72,77,.18)}'
  + '.nt-item.read{opacity:.5}'
  + '.nt-item.read .nt-dot{display:none}'
  + '.nt-t{display:block;font-size:13.5px;font-weight:650;line-height:1.35;margin-bottom:3px}'
  + '.nt-d{display:block;font-size:12px;color:var(--muted);line-height:1.5}'
  + '.nt-m{display:flex;align-items:center;gap:7px;margin-top:6px;font-family:var(--mono);font-size:10.5px;color:var(--muted)}'
  + '.nt-c{color:var(--accent);background:var(--accent-soft);border-radius:99px;padding:2px 8px}'
  + '.nt-mark{margin-left:auto;border:1px solid var(--line);background:none;color:var(--muted);'
  + 'font-size:10.5px;padding:2px 8px;border-radius:99px;cursor:pointer;font-family:var(--sans)}'
  + '.nt-mark:hover{border-color:var(--accent);color:var(--accent)}'
  + '.nt-empty{padding:26px 16px;text-align:center;color:var(--muted);font-size:13px}'

  // 중앙 토스트 (리퀴드 글래스)
  + '.nt-toast{position:fixed;left:50%;top:50%;z-index:80;width:min(460px,calc(100vw - 40px));'
  + 'padding:30px 32px;border-radius:26px;text-align:left;cursor:pointer;'
  + 'background:rgba(255,255,255,.13);-webkit-backdrop-filter:blur(30px) saturate(1.9);backdrop-filter:blur(30px) saturate(1.9);'
  + 'border:1px solid rgba(255,255,255,.22);'
  + 'box-shadow:0 30px 90px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.34);'
  + 'opacity:0;transform:translate(-50%,-50%) scale(.94);'
  + 'transition:opacity .45s ease,transform .45s cubic-bezier(.2,.9,.3,1)}'
  + '.nt-toast.on{opacity:1;transform:translate(-50%,-50%) scale(1)}'
  + '.nt-toast .tk{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;'
  + 'letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:14px}'
  + '.nt-toast .tk i{width:7px;height:7px;border-radius:50%;background:#e5484d;font-style:normal;'
  + 'box-shadow:0 0 0 4px rgba(229,72,77,.2)}'
  + '.nt-toast h3{margin:0 0 10px;font-size:22px;line-height:1.3;color:var(--ink);font-weight:750}'
  + '.nt-toast p{margin:0;font-size:14px;line-height:1.6;color:var(--muted)}'
  + '.nt-toast .tf{margin-top:18px;font-size:11.5px;color:var(--muted);opacity:.75}'
  + '@media (prefers-reduced-motion:reduce){.nt-panel,.nt-toast{transition:opacity .01s}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- 벨 + 배지 ----------
  var btn = document.createElement('button');
  btn.className = 'nt-btn';
  btn.setAttribute('aria-label', '알림');
  btn.title = '알림';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z"/>'
    + '<path d="M13.7 20a2 2 0 0 1-3.4 0"/></svg>'
    + '<span class="nt-badge" hidden>0</span>';
  document.body.appendChild(btn);
  var badge = btn.querySelector('.nt-badge');

  // ---------- 패널 ----------
  var panel = document.createElement('div');
  panel.className = 'nt-panel';
  panel.innerHTML = '<div class="nt-head"><b>알림</b><span style="display:flex;gap:6px">'
    + '<button class="nt-allread nt-oswin" type="button" title="새 덱을 Windows 알림 센터로도 받기">Windows 알림</button>'
    + '<button class="nt-allread" type="button">모두 읽음</button></span></div>'
    + '<div class="nt-list"></div>';
  document.body.appendChild(panel);
  var list = panel.querySelector('.nt-list');

  // ---------- Windows 네이티브 알림 (Notification API → 알림 센터) ----------
  // file:// 에선 API 자체가 막혀 있으므로 localhost 서버로 열었을 때만 동작.
  var osBtn = panel.querySelector('.nt-oswin');
  function osState() { return (window.Notification && Notification.permission) || 'unsupported'; }
  function osBtnSync() {
    if (osState() === 'granted') { osBtn.textContent = 'Windows 알림 ✓'; osBtn.disabled = true; osBtn.style.opacity = .55; }
    else if (osState() === 'denied') { osBtn.textContent = 'Windows 알림 차단됨'; osBtn.disabled = true; osBtn.style.opacity = .55; }
    else if (osState() === 'unsupported') { osBtn.style.display = 'none'; }
  }
  osBtnSync();
  osBtn.addEventListener('click', function () {
    if (!window.Notification) return;
    Notification.requestPermission().then(function () { osBtnSync(); });
  });
  function osNotify(it) {
    if (!window.Notification || Notification.permission !== 'granted') return;
    try {
      var n = new Notification('새로운 덱 · ' + it.c, {
        body: it.t + '\n' + it.d,
        icon: PRE + 'assets/favicon.png',
        tag: it.u
      });
      n.onclick = function () { markRead(it.u); window.focus(); location.href = PRE + it.u; n.close(); };
    } catch (e) {}
  }

  function fmt(d) { return d.replace(/^\d{4}-/, '').replace('-', '/'); }

  function render() {
    var read = getRead(), unread = 0;
    list.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i], isRead = read.indexOf(it.u) >= 0;
      if (!isRead) unread++;
      var a = document.createElement('a');
      a.className = 'nt-item' + (isRead ? ' read' : '');
      a.href = PRE + it.u;
      a.innerHTML = '<span class="nt-dot"></span>'
        + '<span class="nt-t"></span><span class="nt-d"></span>'
        + '<span class="nt-m"><span class="nt-c"></span><span class="nt-dt"></span>'
        + (isRead ? '' : '<button class="nt-mark" type="button">읽음</button>') + '</span>';
      a.querySelector('.nt-t').textContent = it.t;
      a.querySelector('.nt-d').textContent = it.d;
      a.querySelector('.nt-c').textContent = it.c;
      a.querySelector('.nt-dt').textContent = fmt(it.at);
      (function (u, el) {
        el.addEventListener('click', function () { markRead(u); });      // 클릭 = 이동 + 읽음
        var mk = el.querySelector('.nt-mark');
        if (mk) mk.addEventListener('click', function (e) {              // 읽음 버튼만 = 이동 안 함
          e.preventDefault(); e.stopPropagation();
          markRead(u); render();
        });
      })(it.u, a);
      list.appendChild(a);
    }
    if (!items.length) list.innerHTML = '<div class="nt-empty">알림이 없습니다.</div>';
    badge.textContent = unread > 99 ? '99+' : unread;
    badge.hidden = unread === 0;
  }
  render();

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('on');
  });
  panel.querySelector('.nt-allread').addEventListener('click', function () {
    var l = getRead();
    for (var i = 0; i < items.length; i++) if (l.indexOf(items[i].u) < 0) l.push(items[i].u);
    save(READ_KEY, l); render();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nt-panel') && !e.target.closest('.nt-btn')) panel.classList.remove('on');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') panel.classList.remove('on'); });

  // ---------- 중앙 토스트 ----------
  function toast(it, after) {
    var box = document.createElement('div');
    box.className = 'nt-toast';
    box.innerHTML = '<div class="tk"><i></i>새로운 덱</div><h3></h3><p></p>'
      + '<div class="tf">클릭하면 바로 이동합니다</div>';
    box.querySelector('h3').textContent = it.t;
    box.querySelector('p').textContent = it.d;
    box.addEventListener('click', function () { markRead(it.u); location.href = PRE + it.u; });
    document.body.appendChild(box);

    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('on'); }); });
    btn.classList.add('ring');
    setTimeout(function () { btn.classList.remove('ring'); }, 1000);

    setTimeout(function () {
      box.classList.remove('on');                       // fade out
      setTimeout(function () {
        if (box.parentNode) box.parentNode.removeChild(box);
        if (after) after();
      }, 500);
    }, 3000);
  }

  function queue(list2) {
    if (!list2.length) return;
    var i = 0;
    (function next() {
      if (i >= list2.length) return;
      toast(list2[i++], function () { setTimeout(next, 260); });
    })();
  }

  // 데모: URL 에 ?notify-demo 또는 #notify-demo 를 붙이면 강제로 토스트를 띄운다
  if (/notify-demo/.test(location.search + location.hash)) {
    queue(items.slice(0, 2));
    osNotify(items[0]);                     // Windows 알림도 데모
    return;
  }

  // 지난 방문 이후 생긴 문서만 토스트. 첫 방문이면 조용히 기준선만 저장.
  var seen = null;
  try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
  var toasted = ls(TOAST_KEY, '[]');
  var today = new Date().toISOString().slice(0, 10);

  if (!seen) {
    save(TOAST_KEY, items.map(function (x) { return x.u; }));
    try { localStorage.setItem(SEEN_KEY, today); } catch (e) {}
  } else {
    var fresh = items.filter(function (x) {
      return x.at > seen && toasted.indexOf(x.u) < 0;
    });
    if (fresh.length) {
      for (var k = 0; k < fresh.length; k++) toasted.push(fresh[k].u);
      save(TOAST_KEY, toasted);
      queue(fresh.slice(0, 3));
      for (var m = 0; m < Math.min(fresh.length, 3); m++) osNotify(fresh[m]);   // Windows 알림 센터에도
    }
    try { localStorage.setItem(SEEN_KEY, today); } catch (e) {}
  }
})();
