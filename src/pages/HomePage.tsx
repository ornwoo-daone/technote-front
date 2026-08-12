import { Link } from 'react-router-dom';
import { GROUPS, catsOfGroup, docsOf, docKey } from '../entities/docs/registry';
import type { Cat, GroupKey } from '../entities/docs/registry';
import { useReadList } from '../features/read-tracking/useRead';
import SearchBox from '../features/search/SearchBox';

interface Tile extends Cat {
  count: number;
  unread: number;
}

export default function HomePage() {
  const read = useReadList();

  // 읽을거리 있는 타일 → 다 읽은 타일 → 준비중 순서 (기존 unread.js 정렬 규칙). 정렬은 섹션 안에서만.
  const tilesOf = (g: GroupKey): Tile[] =>
    catsOfGroup(g)
      .map((c) => {
        const docs = docsOf(c.f);
        const unread = docs.filter((d) => !read.includes(docKey(d))).length;
        return { ...c, count: docs.length, unread };
      })
      .sort((a, b) => {
        const rank = (t: Tile) => (t.count === 0 ? 2 : t.unread === 0 ? 1 : 0);
        return rank(a) - rank(b);
      });

  const sections = GROUPS.map((g) => ({ ...g, tiles: tilesOf(g.key) })).filter((s) => s.tiles.length);

  return (
    <div className="home">
      <div className="home-head">
        <div className="eyebrow">DATABASE · LANGUAGE</div>
        <h1>TECH NOTE</h1>
      </div>
      <SearchBox />
      {sections.map((s) => (
        <section className="hub-section" key={s.key}>
          <div className="hub-label">{s.label}</div>
          <div className="hub-grid">
            {s.tiles.map((c) => (
              <Link key={c.f}
                className={'cat-btn' + (c.count === 0 ? ' soon' : c.unread > 0 ? ' new' : ' read-all')}
                to={`/${c.f}`}>
                {c.unread > 0 && <span className="newbadge">{c.unread}</span>}
                <span className="ic">
                  {c.icon ? (
                    <>
                      <img className="ic-bloom" src={c.icon} alt="" aria-hidden="true" />
                      <img className={'ci ci-img' + (c.iconCls ? ' ' + c.iconCls : '')} src={c.icon} alt="" />
                    </>
                  ) : (
                    <span className="ci ci-mono" aria-hidden="true">{c.mono}</span>
                  )}
                </span>
                {c.name}
                {c.count > 0 ? <small className="rdy">문서 {c.count}개</small> : <small>준비 중</small>}
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="copyright">
        © 2026 <b>kimdongwoo</b> · All rights reserved.<br />
        본 지침서의 모든 내용에 대한 저작권은 작성자(김동우)에게 있으며, 무단 전재·복제·배포를 금합니다.
      </div>
    </div>
  );
}
