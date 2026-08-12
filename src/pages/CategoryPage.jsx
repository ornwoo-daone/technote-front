import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATS, SESSIONS, docsOf, docKey } from '../entities/docs/registry.js';
import { useReadList } from '../features/read-tracking/useRead.js';
import SearchBox from '../features/search/SearchBox.jsx';

const fmt = (d) => `생성 ${d}`;

export default function CategoryPage() {
  const { cat } = useParams();
  const [filter, setFilter] = useState('all');
  const read = useReadList();

  const meta = CATS.find((c) => c.f === cat);
  const docs = docsOf(cat);
  const shown = docs.filter((d) => filter === 'all' || d.session === filter);

  const countOf = (key) => (key === 'all' ? docs.length : docs.filter((d) => d.session === key).length);
  const unreadOf = (key) =>
    docs.filter((d) => (key === 'all' || d.session === key) && !read.includes(docKey(d))).length;

  if (!meta) return <div className="wrap"><h1>없는 카테고리</h1></div>;

  return (
    <div className="wrap">
      <Link className="back" to="/" aria-label="홈으로" />
      <h1>{meta.name}</h1>
      <p className="lead">{meta.name} 에이전트 기능·개념·검증된 이슈.</p>

      {docs.length === 0 && (
        <p className="lead muted">준비 중 — 필요한 주제가 생기면 “여기 추가해줘”라고 하면 이 카테고리에 추가합니다.</p>
      )}

      {docs.length > 0 && (
        <>
          <SearchBox cat={cat} />
          <div className="tabs">
            {SESSIONS.map((s) => (
              <button key={s.key}
                className={'tab' + (filter === s.key ? ' active' : '') + (unreadOf(s.key) > 0 ? ' has-unread' : '')}
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
                : <Link key={d.slug} className={cls} to={`/${cat}/${d.slug}`}>{inner}</Link>;
            })}
            {shown.length === 0 && <div className="session-empty">이 세션엔 아직 문서가 없습니다.</div>}
          </div>
        </>
      )}
    </div>
  );
}
