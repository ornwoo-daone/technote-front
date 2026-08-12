import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CategoryPage from '../pages/CategoryPage';
import DeckPage from '../pages/DeckPage';
import ThemeButton, { applySavedTheme } from '../features/theme/ThemeButton';
import NotifyBell from '../features/notify/NotifyBell';

export default function App() {
  useEffect(() => { applySavedTheme(); }, []);

  return (
    <HashRouter>
      <ThemeButton />
      <NotifyBell />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:cat" element={<CategoryPage />} />
        <Route path="/:cat/:slug" element={<DeckPage />} />
      </Routes>
    </HashRouter>
  );
}
