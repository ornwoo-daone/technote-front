// DB 카테고리 페이지 공통: 탭 필터 + 카드 애니메이션 + 스코프 검색
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.toc-item'));

  // ---- 탭 필터 (ALL / DBX / DB / TEST / Support) ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs .tab'));
  var emptyEl = document.getElementById('emptyState');

  function applyFilter(f) {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (f === 'all' || c.getAttribute('data-session') === f);
      c.classList.remove('filt-show');
      if (ok) {
        c.classList.remove('filt-hide');
        void c.offsetWidth; // reflow → 애니메이션 재시작
        c.style.animationDelay = (shown * 45) + 'ms';
        c.classList.add('filt-show');
        shown++;
      } else {
        c.classList.add('filt-hide');
      }
    });
    if (emptyEl) emptyEl.style.display = shown ? 'none' : 'block';
  }

  // 슬라이딩 pill (선택 표시가 스르륵 이동)
  var tabsEl = document.querySelector('.tabs');
  var slider = null;
  if (tabsEl && tabs.length) {
    slider = document.createElement('span');
    slider.className = 'tab-slider';
    tabsEl.appendChild(slider);
  }
  function moveSlider(tab, instant) {
    if (!slider || !tab) return;
    if (instant) slider.style.transition = 'none';
    slider.style.width = tab.offsetWidth + 'px';
    slider.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
    if (instant) { void slider.offsetWidth; slider.style.transition = ''; }
  }
  function activeTab() { return document.querySelector('.tabs .tab.active') || tabs[0]; }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      moveSlider(t);
      applyFilter(t.getAttribute('data-filter'));
    });
  });
  if (tabs.length) {
    applyFilter('all');
    moveSlider(activeTab(), true);
    window.addEventListener('load', function () { moveSlider(activeTab(), true); });
    window.addEventListener('resize', function () { moveSlider(activeTab(), true); });
  }

  // ---- 스코프 검색 (홈과 동일 UI, 이 DB 카드만 대상) ----
  var q = document.getElementById('q'), R = document.getElementById('results');
  if (q && R) {
    var IDX = cards.map(function (c) {
      var b = c.querySelector('b'), d = c.querySelector('span:not(.newbadge)');
      return { t: b ? b.innerText : '', d: d ? d.innerText : '', u: c.getAttribute('href') };
    });
    var cur = [], sel = -1;
    function esc(s) { return s.replace(/[&<>]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]; }); }
    function render() {
      if (!cur.length) { R.innerHTML = '<div class="no-res">결과 없음</div>'; return; }
      R.innerHTML = cur.map(function (x, i) {
        return '<a class="result-item' + (i === sel ? ' sel' : '') + '" href="' + x.u + '"><b>' + esc(x.t) + '</b></a>';
      }).join('');
    }
    q.addEventListener('input', function () {
      var s = q.value.trim().toLowerCase(); sel = -1;
      if (!s) { R.hidden = true; R.innerHTML = ''; return; }
      cur = IDX.filter(function (x) { return (x.t + ' ' + x.d).toLowerCase().indexOf(s) >= 0; }).slice(0, 12);
      R.hidden = false; render();
    });
    q.addEventListener('keydown', function (e) {
      if (R.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, cur.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter') { var t = cur[sel < 0 ? 0 : sel]; if (t) location.href = t.u; }
      else if (e.key === 'Escape') { R.hidden = true; }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.searchwrap')) R.hidden = true; });

    // 플레이스홀더 타이핑 애니메이션 (이 DB 카드 제목을 예시로)
    var EX = IDX.map(function (x) { return x.t; }).slice(0, 6);
    if (!EX.length) EX = ['이 DB 안에서 검색'];
    var _e = 0, _c = 0, _del = false;
    function tw() {
      if (document.activeElement === q || q.value) { q.placeholder = '이 DB 안에서 검색'; setTimeout(tw, 1000); return; }
      var wd = EX[_e];
      if (!_del) { _c++; q.placeholder = wd.slice(0, _c) + '┃'; if (_c >= wd.length) { _del = true; setTimeout(tw, 1200); return; } setTimeout(tw, 95); }
      else { _c--; q.placeholder = wd.slice(0, _c) + '┃'; if (_c <= 0) { _del = false; _e = (_e + 1) % EX.length; setTimeout(tw, 420); return; } setTimeout(tw, 45); }
    }
    tw();
  }
})();
