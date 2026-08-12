// 읽음(unread) 추적: 홈 타일 점 / 리스트 카드 점 / 탭 점
// 문서를 열면(카드 클릭) localStorage 'dbxRead' 에 키 기록. 홈은 해당 DB 문서를 전부 읽어야 점이 사라짐.
(function () {
  // DB 폴더 → 소속 문서 전체 목록 (홈 타일 판정용). docs.js 레지스트리에서 자동 구성.
  var DOCS = {};
  (window.DBX_DOCS || []).forEach(function (d) {
    var f = d.u.split('/')[0];
    (DOCS[f] = DOCS[f] || []).push(d.u);
  });

  function getRead() { try { return JSON.parse(localStorage.getItem('dbxRead') || '[]'); } catch (e) { return []; } }
  function has(list, k) { return list.indexOf(k) >= 0; }
  function markRead(k) {
    var l = getRead();
    if (l.indexOf(k) < 0) { l.push(k); try { localStorage.setItem('dbxRead', JSON.stringify(l)); } catch (e) {} }
  }

  var read = getRead();

  // --- HOME: DB 타일 (소속 문서 전부 읽으면 read-all → 점 숨김) ---
  var tiles = document.querySelectorAll('.hub-grid .cat-btn');
  for (var i = 0; i < tiles.length; i++) {
    var a = tiles[i];
    var db = (a.getAttribute('href') || '').split('/')[0];
    var docs = DOCS[db];
    if (!docs || !docs.length) continue;
    var all = true;
    for (var j = 0; j < docs.length; j++) { if (!has(read, docs[j])) { all = false; break; } }
    if (all) a.classList.add('read-all'); else a.classList.remove('read-all');
  }

  // 다 읽은 타일(read-all)은 준비중(soon) 앞으로 밀어 '읽을거리 그룹'의 맨 뒤로 보냄
  var grid = document.querySelector('.hub-grid');
  if (grid) {
    var firstSoon = grid.querySelector('.cat-btn.soon');
    var readAllTiles = grid.querySelectorAll('.cat-btn.read-all');
    for (var r = 0; r < readAllTiles.length; r++) {
      grid.insertBefore(readAllTiles[r], firstSoon);   // firstSoon 이 null 이면 맨 끝으로
    }
  }

  // --- DB 리스트 페이지: 카드별 점 + 클릭 시 읽음 + 탭 점 ---
  var cards = document.querySelectorAll('.toc .toc-item');
  if (cards.length) {
    var parts = location.pathname.replace(/\\/g, '/').split('/');
    parts.pop();                                   // index.html 제거
    var dir = parts[parts.length - 1] || '';       // 예: db2
    var unread = { all: 0 };

    for (var c = 0; c < cards.length; c++) {
      var card = cards[c];
      var key = dir ? (dir + '/' + (card.getAttribute('href') || '')) : (card.getAttribute('href') || '');
      if (has(read, key)) {
        card.classList.add('read');                // 점 숨김
      } else {
        unread.all++;
        var s = card.getAttribute('data-session') || '';
        unread[s] = (unread[s] || 0) + 1;
      }
      (function (k) { card.addEventListener('click', function () { markRead(k); }); })(key);
    }

    // 탭(옵션) 점: 해당 세션에 안 읽은 문서가 있으면 표시
    var tabs = document.querySelectorAll('.tabs .tab');
    for (var t = 0; t < tabs.length; t++) {
      var f = tabs[t].getAttribute('data-filter');
      var hasUnread = (f === 'all') ? (unread.all > 0) : (unread[f] > 0);
      if (hasUnread) tabs[t].classList.add('has-unread'); else tabs[t].classList.remove('has-unread');
    }
  }
})();
