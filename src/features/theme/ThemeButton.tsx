import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';

// localStorage 'dbxPalette' — 기존 theme.js 와 같은 계약 (legacy 페이지와 테마 공유)
// [팔레트 키, 라벨, accent, bg]
const THEMES = [
  ['interstellar', 'Interstellar', '#f0b45a', '#050506'],
  ['midnight', 'Midnight', '#8a9bff', '#0e1018'],
  ['emerald', 'Emerald', '#34d399', '#06100c'],
  ['sunset', 'Sunset', '#ff7a59', '#120a08'],
  ['neon', 'Neon', '#e94ffb', '#08060f'],
  ['rose', 'Rose', '#fb7185', '#120a0e'],
  ['ocean', 'Ocean', '#38bdf8', '#05101a'],
  ['crimson', 'Crimson', '#f43f5e', '#100608'],
  ['nord', 'Nord', '#88c0d0', '#12161e'],
  ['graphite', 'Graphite', '#c9ccd6', '#0a0a0b'],
] as const satisfies readonly (readonly [string, string, string, string])[];

function setPalette(pal: string): void {
  const r = document.documentElement;
  r.setAttribute('data-palette', pal);
  r.setAttribute('data-theme', 'dark');
}

export function applySavedTheme(): void {
  let saved: string | null = null;
  try { saved = localStorage.getItem('dbxPalette'); } catch { /* 접근 불가 시 기본 테마 */ }
  if (saved && saved !== 'random') setPalette(saved);
}

export default function ThemeButton() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState<string>(() => {
    try { return localStorage.getItem('dbxPalette') || 'interstellar'; } catch { return 'interstellar'; }
  });
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (popRef.current && t && !popRef.current.contains(t) && !t.closest('.theme-btn')) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const choose = (pal: string): void => {
    setCur(pal);
    try { localStorage.setItem('dbxPalette', pal); } catch { /* 저장 실패는 무시 */ }
    const r = document.documentElement;
    r.classList.add('theming');
    setTimeout(() => r.classList.remove('theming'), 600);
    setPalette(pal);
  };

  const toggle = (e: ReactMouseEvent<HTMLButtonElement>): void => { e.stopPropagation(); setOpen(!open); };

  return (
    <>
      <button className="theme-btn" aria-label="테마 변경" title="테마 변경" onClick={toggle}>
        <svg className="brush" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17.6 3.1a2.3 2.3 0 0 1 3.3 3.3l-8.1 8.1-3.3-3.3 8.1-8.1Z" />
          <path d="M9.4 11.2c-2.2.3-3.9 1.4-4.6 3.6-.3 1-.5 2-1.3 2.7 1.2 1.3 3.1 1.6 4.7 1 2.2-.8 3.3-2.6 3.5-4.9" />
        </svg>
      </button>
      {open && (
        <div className="theme-pop" ref={popRef}>
          <div className="tp-head">테마 선택</div>
          <div className="tp-grid">
            {THEMES.map(([pal, label, a, b]) => (
              <button key={pal} className={'sw' + (cur === pal ? ' on' : '')}
                style={{ '--a': a, '--b': b } as CSSProperties} onClick={() => choose(pal)}>
                <i />{label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
