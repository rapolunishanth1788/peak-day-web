import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Menu, Plus } from 'lucide-react';
import { SectionId } from '../../types';
import { NAVIGATION_ITEMS } from '../../lib/designSystem';
import { UserMenu } from './UserMenu';

interface TopBarProps {
  currentSection: SectionId;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onQuickAction?: () => void;
  onOpenProfile?: () => void;
  onLogoutSuccess?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentSection,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNotifications,
  onQuickAction,
  onOpenProfile,
  onLogoutSuccess,
}) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeItem = NAVIGATION_ITEMS.find((item) => item.id === currentSection);

  return (
    <header
      id="peak-day-topbar"
      className="h-16 px-4 md:px-8 border-b border-white/[0.08] bg-[#07090E]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 select-none"
    >
      {/* Left side: Mobile menu & Section context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight">
              {activeItem?.label || 'Peak Day'}
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {dateString}
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400 truncate max-w-md">
            {activeItem?.description}
          </p>
        </div>
      </div>

      {/* Right side: Search, Live clock, Quick action, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Apple Spotlight-style Quick Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Find...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/10 rounded border border-white/10 text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Live system clock indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{timeString}</span>
        </div>

        {/* AI Quick Sparkle indicator */}
        <div
          title="PeakIQ Assistant ready"
          className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer hidden sm:block"
        >
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#07090E]" />
        </button>

        {/* Quick Action Button */}
        <button
          type="button"
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 border border-blue-400/30 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Entry</span>
        </button>

        {/* User Account / Sign Out Menu */}
        <UserMenu onOpenProfile={onOpenProfile} onLogoutSuccess={onLogoutSuccess} />
      </div>
    </header>
  );
};
