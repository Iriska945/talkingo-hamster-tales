import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { HomeLanding } from './pages/HomeLanding';
import { LearnPage } from './pages/LearnPage';
import { TalkPage } from './pages/TalkPage';
import { ShopPage } from './pages/ShopPage';
import { DictionaryPage } from './pages/DictionaryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { GalleryPage } from './pages/GalleryPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // In the /talk voice assistant room or /gallery, hide navbar and bottom dock to provide pure immersion
  const isImmersive = location.pathname === '/talk' || location.pathname === '/gallery';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--app-text)] selection:bg-orange-500/20 transition-colors duration-300">
      {!isImmersive && <Navbar />}
      <main className="flex-1 pb-24 md:pb-12">
        {children}
      </main>
      {!isImmersive && <BottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomeLanding />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/talk" element={<TalkPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
};
