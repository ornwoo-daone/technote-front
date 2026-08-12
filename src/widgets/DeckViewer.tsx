import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  backTo: string;
  backLabel?: string;
  children: ReactNode;
}

// 기존 deck.js 의 슬라이드 넘김을 React 로 — guide.css 의 .deck 스타일 그대로 사용
export default function DeckViewer({ backTo, backLabel, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const count = () => setN(el.querySelectorAll('.slide').length);
    count();
    setI(0);
    // lazy MDX 로딩 완료 후 슬라이드 수 재계수
    const mo = new MutationObserver(count);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [children]);

  useEffect(() => {
    const slides = ref.current?.querySelectorAll('.slide');
    slides?.forEach((s, k) => s.classList.toggle('active', k === i));
  }, [i, n]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input,textarea')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setI((v) => Math.min(v + 1, n - 1)); }
      if (e.key === 'ArrowLeft') setI((v) => Math.max(v - 1, 0));
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [n]);

  // 슬라이드 본문 클릭으로는 넘기지 않는다. 이동 수단은 키보드(←/→/스페이스)와
  // 하단 deck-nav 버튼뿐. 예전엔 화면 좌우 절반을 클릭해 넘겼는데, 좌상단 뒤로가기
  // 버튼(46px)을 조금만 빗나가도 이전 슬라이드로 넘어가 버렸다.

  return (
    <>
      <Link className="deck-back" to={backTo} aria-label={backLabel} />
      <div className="deck" ref={ref}>{children}</div>
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
