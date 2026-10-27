import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Competitor } from '../types';
import { Trophy, ArrowUp, ArrowDown, Sparkles, Clock } from 'lucide-react';
import { soundEffects } from '../services/voice';

const LEAGUES = [
  { id: 'bronze', label: 'Бронза', icon: '🥉', badge: 'bg-amber-600/15 border-amber-600/30 text-amber-400' },
  { id: 'silver', label: 'Серебро', icon: '🥈', badge: 'bg-slate-400/15 border-slate-400/30 text-slate-300' },
  { id: 'gold', label: 'Золото', icon: '🥇', badge: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' },
  { id: 'sapphire', label: 'Сапфир', icon: '💎', badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' },
  { id: 'ruby', label: 'Рубин', icon: '👑', badge: 'bg-rose-500/15 border-rose-500/30 text-rose-300' },
];

export const LeaderboardPage: React.FC = () => {
  const { profile, resources } = useApp();
  const [selectedLeague, setSelectedLeague] = useState('bronze');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLeagueObj = LEAGUES.find(l => l.id === selectedLeague) || LEAGUES[0];

  useEffect(() => {
    fetchLeaderboard(selectedLeague);
  }, [selectedLeague, resources.xp]);

  const fetchLeaderboard = async (league: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?league=${league}`);
      if (res.ok) {
        const data = await res.json();
        let list: Competitor[] = data.competitors || [];

        // Insert current user into list
        const currentUserEntry: Competitor = {
          id: 'current_user',
          name: profile.name || 'Ты',
          avatar: '🐹',
          xp: resources.xp,
          league: league,
          rank: 1,
          isCurrentUser: true,
        };

        const existingIdx = list.findIndex(c => c.isCurrentUser || c.name === profile.name);
        if (existingIdx !== -1) {
          list[existingIdx] = currentUserEntry;
        } else {
          list.push(currentUserEntry);
        }

        // Sort descending by XP
        list.sort((a, b) => b.xp - a.xp);

        // Assign ranks
        list = list.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

        setCompetitors(list);
      } else {
        fallbackCompetitors();
      }
    } catch {
      fallbackCompetitors();
    } finally {
      setLoading(false);
    }
  };

  const fallbackCompetitors = () => {
    const list: Competitor[] = [
      { id: '1', name: 'Алихан', avatar: '🦊', xp: 580, league: selectedLeague, rank: 1 },
      { id: '2', name: 'София', avatar: '🐱', xp: 460, league: selectedLeague, rank: 2 },
      { id: '3', name: 'Данияр', avatar: '🐼', xp: 390, league: selectedLeague, rank: 3 },
      { id: 'me', name: profile.name || 'Ты', avatar: '🐹', xp: resources.xp, league: selectedLeague, rank: 4, isCurrentUser: true },
      { id: '4', name: 'Елена', avatar: '🐨', xp: 220, league: selectedLeague, rank: 5 },
      { id: '5', name: 'Тимур', avatar: '🦁', xp: 180, league: selectedLeague, rank: 6 },
      { id: '6', name: 'Айзере', avatar: '🐰', xp: 110, league: selectedLeague, rank: 7 },
    ];
    list.sort((a, b) => b.xp - a.xp);
    setCompetitors(list.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const top3 = competitors.slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white pb-28 pt-4 px-4 max-w-lg mx-auto space-y-4 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-purple-600/15 top-[-40px] left-[-80px] pointer-events-none" />
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-yellow-500/10 top-[200px] right-[-60px] pointer-events-none" />

      {/* 1. Header & Season Info (Liquid Glass) */}
      <div className="liquid-glass p-5 border border-white/15 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-2xl shadow-sm">
              {currentLeagueObj.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium text-white">
                  {currentLeagueObj.label} лига
                </h1>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentLeagueObj.badge}`}>
                  Турнир
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1 font-light">
                <Clock className="w-3.5 h-3.5" />
                <span>Итоги недели через 3 дня</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block font-light">Твой опыт</span>
            <span className="text-base font-semibold text-white font-mono">{resources.xp} XP</span>
          </div>
        </div>

        {/* League Selector Horizontal Tabs */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => {
                soundEffects.click();
                setSelectedLeague(league.id);
              }}
              className={`flex-1 py-1.5 px-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                selectedLeague === league.id
                  ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>{league.icon}</span>
              <span className="hidden sm:inline text-[11px]">{league.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Podium (Top 3 in Liquid Glass Pedestals) */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 items-end pt-2 relative z-10">
          
          {/* 2nd Place */}
          <div className="liquid-glass p-3 text-center order-1 border border-white/10">
            <div className="text-lg mb-1">🥈</div>
            <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg shadow-sm">
              {top3[1]?.avatar}
            </div>
            <span className="text-xs font-medium text-white block truncate mt-1.5">
              {top3[1]?.name}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {top3[1]?.xp} XP
            </span>
          </div>

          {/* 1st Place (Centerpiece with Amber Light Glow) */}
          <div className="liquid-glass-elevated p-4 text-center order-2 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] relative -top-2">
            <div className="text-2xl mb-1">🥇</div>
            <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-2xl shadow-sm">
              {top3[0]?.avatar}
            </div>
            <span className="text-xs font-semibold text-white block truncate mt-1.5">
              {top3[0]?.name}
            </span>
            <span className="text-[11px] font-bold text-yellow-300 font-mono">
              {top3[0]?.xp} XP
            </span>
          </div>

          {/* 3rd Place */}
          <div className="liquid-glass p-3 text-center order-3 border border-white/10">
            <div className="text-lg mb-1">🥉</div>
            <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg shadow-sm">
              {top3[2]?.avatar}
            </div>
            <span className="text-xs font-medium text-white block truncate mt-1.5">
              {top3[2]?.name}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {top3[2]?.xp} XP
            </span>
          </div>
        </div>
      )}

      {/* 3. Leaderboard List with Promotion & Demotion Indicators */}
      <div className="liquid-glass overflow-hidden border border-white/15 relative z-10">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <span>Участник</span>
          <span>Опыт (XP)</span>
        </div>

        <div className="divide-y divide-white/5">
          {competitors.map((item, index) => {
            const isTop3 = index < 3;
            const isBottom3 = index >= competitors.length - 2;

            return (
              <div
                key={item.id}
                className={`p-3.5 flex items-center justify-between transition-colors ${
                  item.isCurrentUser
                    ? 'bg-emerald-500/15 border-l-2 border-emerald-400'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-center text-xs font-mono font-bold ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                        ? 'text-neutral-300'
                        : index === 2
                        ? 'text-amber-500'
                        : 'text-neutral-500'
                    }`}
                  >
                    {item.rank}
                  </span>

                  <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-base shrink-0 shadow-sm">
                    {item.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">
                        {item.name}
                      </span>
                      {item.isCurrentUser && (
                        <span className="text-[9px] bg-emerald-500 text-white font-semibold px-1.5 py-0.2 rounded-full">
                          Ты
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 block font-light">
                      {isTop3 ? (
                        <span className="text-emerald-400 font-normal flex items-center gap-0.5">
                          <ArrowUp className="w-3 h-3" /> Переход наверх
                        </span>
                      ) : isBottom3 ? (
                        <span className="text-rose-400 font-normal flex items-center gap-0.5">
                          <ArrowDown className="w-3 h-3" /> Зона вылета
                        </span>
                      ) : (
                        <span>Безопасная зона</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-white font-mono">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{item.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
