import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import DeckPage from '../pages/DeckPage';
import BookmarksPage from '../pages/BookmarksPage';
import ThemeButton, { applySavedTheme } from '../features/theme/ThemeButton';
import NotifyBell from '../features/notify/NotifyBell';
import BookmarkNav from '../features/bookmark/BookmarkNav';

// 테마·북마크·알림 버튼은 홈에서만. 카테고리·덱 화면에서는 콘텐츠에 집중시킨다.
// (테마 자체는 applySavedTheme 이 전역에 적용하므로 버튼이 없어도 유지된다)
function HomeOnlyControls() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return (
    <>
      <ThemeButton />
      <BookmarkNav />
      <NotifyBell />
    </>
  );
}

export default function App() {
  useEffect(() => { applySavedTheme(); }, []);

  return (
    <HashRouter>
      <HomeOnlyControls />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* /:cat 보다 먼저 — 'bookmarks' 라는 카테고리는 없지만 순서를 명시해 둔다 */}
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/:cat" element={<CategoryPage />} />
        <Route path="/:cat/:slug" element={<DeckPage />} />
      </Routes>
    </HashRouter>
  );
}
