import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// 기존 deck.js 의 슬라이드 넘김을 React 로 — guide.css 의 .deck 스타일 그대로 사용
export default function DeckViewer({ backTo, backLabel, children }) {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    const slides = ref.current.querySelectorAll('.slide');
    setN(slides.length);
    setI(0);
  }, [children]);

  useEffect(() => {
    const slides = ref.current.querySelectorAll('.slide');
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
  }, [i, n]);

  useEffect(() => {
    const key = (e) => {
      if (e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setI((v) => Math.min(v + 1, n - 1)); }
      if (e.key === 'ArrowLeft') setI((v) => Math.max(v - 1, 0));
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [n]);

  const click = (e) => {
    if (e.target.closest('a,button,.deck-nav,pre,table')) return;
    const x = e.clientX / window.innerWidth;
    if (x > 0.5) setI((v) => Math.min(v + 1, n - 1));
    else setI((v) => Math.max(v - 1, 0));
  };

  return (
    <>
      <Link className="deck-back" to={backTo} aria-label={backLabel} />
      <div className="deck" ref={ref} onClick={click}>{children}</div>
      <div className="deck-nav">
        <button onClick={() => setI((v) => Math.max(v - 1, 0))} aria-label="이전">‹</button>
        <div className="ddots">
          {Array.from({ length: n }, (_, k) => (
            <button key={k} className={'ddot' + (k === i ? ' on' : '')} onClick={() => setI(k)} aria-label={`${k + 1}번 슬라이드`} />
          ))}
        </div>
        <button onClick={() => setI((v) => Math.min(v + 1, n - 1))} aria-label="다음">›</button>
        <span className="dcount">{i + 1} / {n}</span>
      </div>
    </>
  );
}
