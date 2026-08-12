import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATS, sessionsOf, docsOf, docKey } from '../entities/docs/registry';
import { useReadList } from '../features/read-tracking/useRead';
import SearchBox from '../features/search/SearchBox';

const fmt = (d: string): string => `생성 ${d}`;

export default function CategoryPage() {
  const { cat } = useParams<{ cat: string }>();
  const [filter, setFilter] = useState('all');
  const read = useReadList();

  const meta = CATS.find((c) => c.f === cat);
  const sessions = sessionsOf(meta);
  // 카테고리마다 세션 키가 달라서, 다른 카테고리에서 넘어오면 유효하지 않은 필터가 남는다 → all 로 되돌림
  const active = sessions.some((s) => s.key === filter) ? filter : 'all';

  const docs = docsOf(cat ?? '');
  const shown = docs.filter((d) => active === 'all' || d.session === active);

  // 활성 탭을 따라다니는 슬라이딩 pill(.tab-slider). guide.css 에 스타일은 있는데
  // 레거시에서는 dbpage.js 가 DOM 을 직접 만들어 붙였다 — React 이식 때 누락됐던 부분.
  // useLayoutEffect 라 첫 페인트 전에 위치가 정해진다 → 0 에서 미끄러져 오는 깜빡임이 없다.
  const tabsRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabsRef.current?.querySelector<HTMLElement>('.tab.active');
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    // 폰트가 늦게 로드되면 탭 폭이 바뀐다 → load 시점에 한 번 더
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, [active, cat, docs.length]);

  const countOf = (key: string): number =>
    key === 'all' ? docs.length : docs.filter((d) => d.session === key).length;
  const unreadOf = (key: string): number =>
    docs.filter((d) => (key === 'all' || d.session === key) && !read.includes(docKey(d))).length;

  if (!meta) return <div className="wrap"><h1>없는 카테고리</h1></div>;

  return (
    <div className="wrap">
      <Link className="back" to="/" aria-label="홈으로" />
      <h1>{meta.name}</h1>
      <p className="lead">{meta.lead || `${meta.name} 에이전트 기능·개념·검증된 이슈.`}</p>

      {docs.length === 0 && (
        <p className="lead muted">준비 중 — 필요한 주제가 생기면 “여기 추가해줘”라고 하면 이 카테고리에 추가합니다.</p>
      )}

      {docs.length > 0 && (
        <>
          <SearchBox cat={cat} />
          <div className="tabs" ref={tabsRef}>
            {pill && (
              <span className="tab-slider"
                style={{ width: pill.width, transform: `translateX(${pill.left}px)` }} />
            )}
            {sessions.map((s) => (
              <button key={s.key}
                className={'tab' + (active === s.key ? ' active' : '') + (unreadOf(s.key) > 0 ? ' has-unread' : '')}
                onClick={() => setFilter(s.key)}>
                {s.label}<span className="tc">{countOf(s.key)}</span>
              </button>
            ))}
          </div>
          <div className="toc">
            {shown.map((d) => {
              const isRead = read.includes(docKey(d));
              const inner = (
                <>
                  {!isRead && <span className="newbadge">NEW</span>}
                  <b>{d.t}</b><span>{d.d}</span>
                  <div className="toc-meta">
                    {d.deploy === 'pending' && <span className="deploy-tag pending">⏳ 미배포</span>}
                    {d.deploy && d.deploy !== 'pending' && <span className="deploy-tag live">✅ 배포 {d.deploy}</span>}
                    <span className="toc-date created">{fmt(d.at)}</span>
                  </div>
                </>
              );
              const cls = 'toc-item' + (isRead ? ' read' : ' new');
              return d.legacy
                ? <a key={d.slug} className={cls} href={d.legacy}>{inner}</a>
                : <Link key={d.slug} className={cls} to={`/${d.cat}/${d.slug}`}>{inner}</Link>;
            })}
            {shown.length === 0 && <div className="session-empty">이 세션엔 아직 문서가 없습니다.</div>}
          </div>
        </>
      )}
    </div>
  );
}
