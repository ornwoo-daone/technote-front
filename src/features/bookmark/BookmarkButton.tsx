import type { MouseEvent as ReactMouseEvent } from 'react';
import { toggleBookmark, useBookmarks } from './useBookmark';
import BookmarkIcon from './BookmarkIcon';

/** 리스트 항목 오른쪽 끝의 북마크 토글. 항목 전체가 링크라 클릭이 새어나가지 않게 막는다. */
export default function BookmarkButton({ docKey, title }: { docKey: string; title: string }) {
  const on = useBookmarks().includes(docKey);

  const click = (e: ReactMouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(docKey);
  };

  return (
    <button className={'bm-btn' + (on ? ' on' : '')} onClick={click}
      aria-pressed={on} aria-label={`${title} 북마크 ${on ? '해제' : '추가'}`}
      title={on ? '북마크 해제' : '북마크'}>
      <BookmarkIcon on={on} />
    </button>
  );
}
