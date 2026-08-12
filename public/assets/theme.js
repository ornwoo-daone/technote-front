// 테마 선택기 (홈). 초기 적용은 head 인라인 스크립트가 담당(깜빡임 방지).
(function () {
  var root = document.documentElement;
  var THEMES = [
    ['interstellar', 'Interstellar', '#f0b45a', '#050506'],
    ['midnight', 'Midnight', '#8a9bff', '#0e1018'],
    ['emerald', 'Emerald', '#34d399', '#06100c'],
    ['sunset', 'Sunset', '#ff7a59', '#120a08'],
    ['neon', 'Neon', '#e94ffb', '#08060f'],
    ['rose', 'Rose', '#fb7185', '#120a0e'],
    ['ocean', 'Ocean', '#38bdf8', '#05101a'],
    ['crimson', 'Crimson', '#f43f5e', '#100608'],
    ['nord', 'Nord', '#88c0d0', '#12161e'],
    ['graphite', 'Graphite', '#c9ccd6', '#0a0a0b']
  ];
  var CYCLE_MS = 7000;                  // .theming-loop 전환시간(7s)과 동일 → 텀 없이 연속 모핑

  var btn = document.getElementById('themeBtn'),      // 홈에만 존재 (하위 페이지엔 null)
      pop = document.getElementById('themePop'),
      grid = document.getElementById('tpGrid');

  var mode = 'interstellar';           // 사용자가 고른 값 (팔레트명 또는 'random')
  var cycleTimer = null, cycleIdx = 0;

  function setPalette(pal) {
    root.setAttribute('data-palette', pal);
    root.setAttribute('data-theme', 'dark');
  }
  // 일반 선택: 빠른 전환(.theming 0.5s)
  function quickSwitch(pal) {
    root.classList.add('theming');
    setTimeout(function () { root.classList.remove('theming'); }, 600);
    setPalette(pal);
  }

  function stopCycle() {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    if (btn) btn.classList.remove('rainbow');
    root.classList.remove('theming-loop');
    root.classList.remove('rnd-mode');
  }
  // Random: 텀 없이 계속 천천히 흐르는 연속 모핑
  function startCycle() {
    stopCycle();
    if (btn) btn.classList.add('rainbow');
    root.classList.add('theming-loop');   // 7s linear 연속 전환 유지
    root.classList.add('rnd-mode');       // 랜덤 표시(호버 테두리=고정 무지개)
    cycleIdx = 0;
    setPalette(THEMES[0][0]);
    cycleTimer = setInterval(function () {
      cycleIdx = (cycleIdx + 1) % THEMES.length;
      setPalette(THEMES[cycleIdx][0]);     // 전환시간==주기 → 멈춤 없이 이어짐
    }, CYCLE_MS);
  }

  // 저장된 선택 복원 (모든 페이지 공통 — 하위 페이지에서도 테마·랜덤 순환 유지)
  var saved = null;
  try { saved = localStorage.getItem('dbxPalette'); } catch (e) {}
  if (saved === 'random') { mode = 'interstellar'; setPalette('interstellar'); try { localStorage.setItem('dbxPalette', 'interstellar'); } catch (e) {} }
  else if (saved) { mode = saved; }

  // 아래는 선택기(홈)에서만 배선
  if (!btn || !pop || !grid) return;

  function choose(p) {
    mode = p;
    try { localStorage.setItem('dbxPalette', p); } catch (e) {}
    quickSwitch(p);
    markActive();
  }
  function markActive() {
    var sws = pop.querySelectorAll('.sw');
    for (var i = 0; i < sws.length; i++) sws[i].classList.toggle('on', sws[i].getAttribute('data-pal') === mode);
  }

  grid.innerHTML = THEMES.map(function (t) {
    return '<button class="sw" data-pal="' + t[0] + '" style="--a:' + t[2] + ';--b:' + t[3] + '"><i></i>' + t[1] + '</button>';
  }).join('');
  markActive();

  btn.addEventListener('click', function (e) { e.stopPropagation(); pop.hidden = !pop.hidden; });
  pop.addEventListener('click', function (e) {
    var s = e.target.closest('.sw');
    if (!s) return;
    choose(s.getAttribute('data-pal'));
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#themePop') && e.target !== btn && !btn.contains(e.target)) pop.hidden = true;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.hidden = true; });
})();
