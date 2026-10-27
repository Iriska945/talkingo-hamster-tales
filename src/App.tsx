import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeLanding } from './pages/HomeLanding';
import { LearnPage } from './pages/LearnPage';
import { TalkPage } from './pages/TalkPage';
import { ShopPage } from './pages/ShopPage';
import { DictionaryPage } from './pages/DictionaryPage';
import { SettingsPage } from './pages/SettingsPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // In the /talk voice assistant room, hide the navbar and bottom nav to give maximum immersion
  const isTalkPage = location.pathname === '/talk';

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7]">
      {!isTalkPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isTalkPage && <BottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomeLanding />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/talk" element={<TalkPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
};
