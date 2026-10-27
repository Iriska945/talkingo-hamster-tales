import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Mic, Bookmark, ShoppingBag, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { t, activeCharacter } = useApp();
  const location = useLocation();

  // If we are in the full-screen talk view, we can keep the navigation clean or minimize it
  const isTalkPage = location.pathname === '/talk';

  const navItems = [
    {
      to: '/learn',
      icon: BookOpen,
      label: t('learn'),
      color: 'text-duo-green',
      activeBg: 'bg-emerald-50 text-duo-green-dark border-duo-green',
    },
    {
      to: '/talk',
      icon: Mic,
      label: t('talk'),
      isSpecial: true,
    },
    {
      to: '/dictionary',
      icon: Bookmark,
      label: t('dictionary'),
      color: 'text-duo-purple',
      activeBg: 'bg-purple-50 text-duo-purple-dark border-duo-purple',
    },
    {
      to: '/shop',
      icon: ShoppingBag,
      label: t('shop'),
      color: 'text-duo-blue',
      activeBg: 'bg-sky-50 text-duo-blue-dark border-duo-blue',
    },
    {
      to: '/settings',
      icon: Settings,
      label: t('settings'),
      color: 'text-slate-600',
      activeBg: 'bg-slate-100 text-slate-800 border-slate-400',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-3 py-2 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative -top-3 flex flex-col items-center justify-center
                  w-14 h-14 rounded-2xl bg-gradient-to-tr from-duo-green via-emerald-400 to-lime-300
                  border-b-4 border-duo-green-dark shadow-lg shadow-duo-green/30
                  active:translate-y-1 active:border-b-0 transition-all group
                  ${isActive ? 'ring-4 ring-duo-green/30 scale-105' : 'hover:scale-105'}
                `}
              >
                <div className="relative">
                  <Icon className="w-6 h-6 text-white drop-shadow" />
                  <span className="absolute -top-1 -right-2 text-xs animate-bounce">
                    {activeCharacter.emoji}
                  </span>
                </div>
                <span className="text-[10px] font-black text-white leading-none mt-0.5">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all
                ${isActive
                  ? 'bg-slate-100 text-duo-green-dark font-black scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-bold'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight truncate">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
