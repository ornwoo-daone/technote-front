import { Link } from 'react-router-dom';
import { useBookmarks } from './useBookmark';
import BookmarkIcon from './BookmarkIcon';

/** 홈 우상단, 알림 벨 왼쪽. 북마크 목록 페이지로 넘어간다. */
export default function BookmarkNav() {
  const n = useBookmarks().length;
  return (
    <Link className="bm-nav" to="/bookmarks" aria-label="북마크 목록" title="북마크">
      <BookmarkIcon on={n > 0} />
      {n > 0 && <span className="bm-count">{n > 99 ? '99+' : n}</span>}
    </Link>
  );
}
