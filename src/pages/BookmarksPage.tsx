import { Link } from 'react-router-dom';
import { DOCS, docKey, docStamp } from '../entities/docs/registry';
import { useBookmarks } from '../features/bookmark/useBookmark';
import BookmarkIcon from '../features/bookmark/BookmarkIcon';
import DocList from '../widgets/DocList';

export default function BookmarksPage() {
  const marks = useBookmarks();
  // 북마크한 순서가 아니라 문서 작성 순으로 — 목록이 늘어도 위치가 흔들리지 않는다
  const docs = DOCS.filter((d) => marks.includes(docKey(d)))
    .slice()
    .sort((a, b) => (docStamp(a) < docStamp(b) ? 1 : docStamp(a) > docStamp(b) ? -1 : 0));

  return (
    <div className="wrap">
      <Link className="back" to="/" aria-label="홈으로" />
      <div className="cat-hero">
        <BookmarkIcon on className="bm-hero" />
        <h1>북마크</h1>
      </div>
      <p className="lead">{docs.length}개 저장됨. 각 문서 오른쪽 북마크 버튼으로 해제합니다.</p>

      <DocList docs={docs} showCat
        empty="아직 북마크가 없습니다. 카테고리 목록에서 오른쪽 북마크 버튼을 눌러 담아보세요." />
    </div>
  );
}
