import { useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCS, CATS, docsOf } from '../../entities/docs/registry';
import type { Doc } from '../../entities/docs/registry';

const catName: Record<string, string> = Object.fromEntries(CATS.map((c) => [c.f, c.name]));

export default function SearchBox({ cat }: { cat?: string }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(-1);
  const nav = useNavigate();

  const pool = useMemo(() => (cat ? docsOf(cat) : DOCS), [cat]);
  const cur = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return pool.filter((d) => (d.t + ' ' + catName[d.cat] + ' ' + d.k).toLowerCase().includes(s)).slice(0, 12);
  }, [q, pool]);

  const go = (d: Doc): void => {
    if (d.legacy) window.location.href = d.legacy;
    else nav(`/${d.cat}/${d.slug}`);
  };

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (!cur.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(sel + 1, cur.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
    else if (e.key === 'Enter') { const t = cur[sel < 0 ? 0 : sel]; if (t) go(t); }
    else if (e.key === 'Escape') setQ('');
  };

  return (
    <div className="searchwrap">
      <svg className="search-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
      <input className="bigsearch" type="text" autoComplete="off" spellCheck="false"
        placeholder={cat ? '이 카테고리 안에서 검색' : '개념·이슈 검색'}
        value={q} onChange={(e) => { setQ(e.target.value); setSel(-1); }} onKeyDown={onKey} />
      {q.trim() && (
        <div className="results">
          {cur.length === 0 && <div className="no-res">결과 없음</div>}
          {cur.map((d, i) => (
            <a key={d.cat + d.slug} className={'result-item' + (i === sel ? ' sel' : '')}
              onClick={(e) => { e.preventDefault(); go(d); }} href={`#/${d.cat}/${d.slug}`}>
              <b>{d.t}</b><span className="rc">{catName[d.cat]}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
