import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GalleryPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--app-bg)]">
      <header className="flex items-center justify-between px-4 py-2.5 bg-[var(--app-glass-elevated)] backdrop-blur-2xl border-b border-[var(--app-glass-border)] z-10">
        <Link
          to="/learn"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-pill-glass text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в приложение</span>
        </Link>
        <span className="text-xs font-medium tracking-[0.25em] uppercase text-neutral-400">
          Scenarios Gallery
        </span>
        <a
          href="/gallery.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
          title="Открыть в новой вкладке"
        >
          <span>В полный экран</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>
      <div className="flex-1 w-full h-full relative">
        <iframe
          src="/gallery.html"
          title="Talkingo Scenarios Gallery"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
