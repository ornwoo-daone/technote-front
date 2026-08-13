import { Link } from 'react-router-dom';
import { CATS, docKey, docWhen, docUpdated } from '../entities/docs/registry';
import type { Doc } from '../entities/docs/registry';
import { useReadList } from '../features/read-tracking/useRead';
import BookmarkButton from '../features/bookmark/BookmarkButton';

const catName: Record<string, string> = Object.fromEntries(CATS.map((c) => [c.f, c.name]));

/** 문서 리스트. 카테고리 페이지와 북마크 페이지가 같이 쓴다. */
export default function DocList({ docs, empty, showCat = false }: {
  docs: readonly Doc[];
  empty: string;
  /** 여러 카테고리가 섞이는 목록에서만 카테고리 이름을 붙인다 */
  showCat?: boolean;
}) {
  const read = useReadList();

  if (docs.length === 0) return <div className="toc"><div className="session-empty">{empty}</div></div>;

  return (
    <div className="toc">
      {docs.map((d) => {
        const key = docKey(d);
        const isRead = read.includes(key);
        const inner = (
          <>
            {!isRead && <span className="newbadge">NEW</span>}
            <b>{d.t}</b><span>{d.d}</span>
            <div className="toc-meta">
              {showCat && <span className="toc-cat">{catName[d.cat]}</span>}
              {d.deploy === 'pending' && <span className="deploy-tag pending">⏳ 미배포</span>}
              {d.deploy && d.deploy !== 'pending' && <span className="deploy-tag live">✅ 배포 {d.deploy}</span>}
              <span className="toc-date created">생성 {docWhen(d)}</span>
              {docUpdated(d) && <span className="toc-date">수정 {docUpdated(d)}</span>}
            </div>
          </>
        );
        const cls = 'toc-item' + (isRead ? ' read' : ' new');
        return (
          <div className="toc-row" key={key}>
            {d.legacy
              ? <a className={cls} href={d.legacy}>{inner}</a>
              : <Link className={cls} to={`/${d.cat}/${d.slug}`}>{inner}</Link>}
            <BookmarkButton docKey={key} title={d.t} />
          </div>
        );
      })}
    </div>
  );
}
