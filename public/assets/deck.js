// 공용 슬라이드 덱 네비게이션 — .deck > .slide 구조에 자동 적용
(function () {
  var deck = document.querySelector('.deck');
  if (!deck) return;
  var slides = [].slice.call(deck.querySelectorAll('.slide'));
  if (!slides.length) return;
  var i = 0;

  var nav = document.createElement('div');
  nav.className = 'deck-nav';
  nav.innerHTML = '<button class="dprev" aria-label="이전">‹</button>' +
                  '<div class="ddots"></div>' +
                  '<button class="dnext" aria-label="다음">›</button>' +
                  '<div class="dcount"><span class="dc">1</span>/' + slides.length + '</div>';
  document.body.appendChild(nav);

  var dotsWrap = nav.querySelector('.ddots');
  var dots = slides.map(function (_, n) {
    var b = document.createElement('button');
    b.className = 'ddot';
    b.setAttribute('aria-label', (n + 1) + '번 슬라이드');
    b.onclick = function () { go(n); };
    dotsWrap.appendChild(b);
    return b;
  });
  var dc = nav.querySelector('.dc');

  function go(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    dc.textContent = i + 1;
    window.scrollTo(0, 0);
  }

  nav.querySelector('.dnext').onclick = function () { go(i + 1); };
  nav.querySelector('.dprev').onclick = function () { go(i - 1); };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft') { go(i - 1); }
  });

  deck.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.deck-nav')) return;
    var x = e.clientX / window.innerWidth;
    if (x > 0.5) go(i + 1); else go(i - 1);
  });

  if (location.hash) { var m = parseInt(location.hash.slice(1), 10); if (!isNaN(m)) i = m - 1; }
  go(i);
})();
