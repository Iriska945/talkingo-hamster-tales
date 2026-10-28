import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Mic, Bookmark, ShoppingBag, User, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeCharacter } = useApp();
  const location = useLocation();

  const isTalkPage = location.pathname === '/talk';
  if (isTalkPage) return null;

  const navItems = [
    {
      to: '/learn',
      icon: BookOpen,
      label: 'Уроки',
    },
    {
      to: '/leaderboard',
      icon: Trophy,
      label: 'Лига',
    },
    {
      to: '/talk',
      icon: Mic,
      label: 'Диалог',
      isCenter: true,
    },
    {
      to: '/dictionary',
      icon: Bookmark,
      label: 'Словарь',
    },
    {
      to: '/shop',
      icon: ShoppingBag,
      label: 'Магазин',
    },
    {
      to: '/settings',
      icon: User,
      label: 'Профиль',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[var(--app-nav-bg)] backdrop-blur-2xl border-t border-[var(--app-glass-border)] px-3 py-1.5 safe-area-bottom shadow-2xl transition-colors duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative flex items-center justify-center
                  w-12 h-12 rounded-full
                  bg-[var(--app-cta-bg)] text-[var(--app-cta-text)]
                  shadow-lg hover:scale-105
                  active:scale-90 transition-all group
                  ${isActive ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[var(--app-bg)]' : ''}
                `}
                title="Начать голосовой диалог"
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--app-cta-text)]" />
                  <span className="absolute -top-1.5 -right-2 text-[10px] leading-none animate-bounce">
                    {activeCharacter.emoji}
                  </span>
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all
                ${isActive
                  ? 'text-[var(--app-text)] font-medium bg-[var(--app-pill-glass-bg)] shadow-[inset_0_1px_1px_var(--app-glass-specular)]'
                  : 'opacity-60 hover:opacity-100 font-normal hover:bg-[var(--app-pill-glass-bg)]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 mb-0.5" strokeWidth={isActive ? 2.2 : 1.6} />
                  <span className="text-[10px] tracking-tight leading-tight truncate">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
