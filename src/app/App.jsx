import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import CategoryPage from '../pages/CategoryPage.jsx';
import DeckPage from '../pages/DeckPage.jsx';
import ThemeButton, { applySavedTheme } from '../features/theme/ThemeButton.jsx';
import NotifyBell from '../features/notify/NotifyBell.jsx';

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
