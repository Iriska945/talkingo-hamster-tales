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
    <nav className="fixed bottom-3 inset-x-0 z-40 px-3 safe-area-bottom pointer-events-none">
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-2xl border border-[#EAE6DE] rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgba(28,26,23,0.08)] flex items-center justify-between gap-1 pointer-events-auto">
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
                  bg-[#1C1A17] text-[#FAF8F5]
                  shadow-md hover:bg-black
                  active:scale-90 transition-all group
                  ${isActive ? 'ring-2 ring-[#3F634D] ring-offset-2' : ''}
                `}
                title="Начать голосовой диалог"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-2 text-[10px] leading-none animate-bounce">
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
                  ? 'text-[#1C1A17] font-bold bg-[#F6F3EC]'
                  : 'text-[#8C877D] hover:text-[#1C1A17] font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 mb-0.5" strokeWidth={isActive ? 2.3 : 1.8} />
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
