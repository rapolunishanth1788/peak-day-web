import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  GraduationCap,
  Dumbbell,
  Sparkles,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { SectionId } from '../../types';
import { NAVIGATION_ITEMS } from '../../lib/designSystem';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  streakCount?: number;
  onLogoutSuccess?: () => void;
}

const SECTION_ICONS: Record<SectionId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  tasks: CheckSquare,
  schedule: Calendar,
  academics: GraduationCap,
  fitness: Dumbbell,
  'ai-assistant': Sparkles,
  notifications: Bell,
  profile: User,
  settings: Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  streakCount = 12,
  onLogoutSuccess,
}) => {
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      console.error('Logout error from sidebar:', err);
    }
  };

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Athlete');
  const userSubtitle = user?.email || 'Student Athlete • Level 7';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <motion.aside
      id="peak-day-sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative h-screen flex flex-col border-r border-white/[0.08] bg-[#0A0D16]/95 backdrop-blur-2xl z-30 select-none overflow-hidden"
    >
      {/* Top App Brand / Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <div
          onClick={() => onSelectSection('dashboard')}
          className="flex items-center gap-3 overflow-hidden cursor-pointer group"
        >
          {/* Animated Glow Logo Badge */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-xl bg-[#090C15] flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400 fill-blue-400/30 group-hover:text-blue-300 transition-colors" />
            </div>
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col whitespace-nowrap overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-base">Peak Day</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    OS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 tracking-tight">Student Athlete Engine</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Daily Streak Highlight Pill */}
      <div className="shrink-0 px-2.5 pt-3 pb-1">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-streak"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Flame className="w-4 h-4 fill-amber-400/40" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{streakCount} Day Streak</p>
                  <p className="text-[10px] text-slate-400 truncate">Consistent discipline</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 shrink-0">🔥</span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-streak"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center"
            >
              <div
                title={`${streakCount} Day Streak active`}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 cursor-pointer transition-colors"
              >
                <Flame className="w-4 h-4 fill-amber-400/30" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-none" aria-label="Main Navigation">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = SECTION_ICONS[item.id];
          const isActive = currentSection === item.id;

          return (
            <div key={item.id} className="relative">
              <button
                type="button"
                onClick={() => onSelectSection(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Apple-style smooth sliding background pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-white/[0.09] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                )}

                {/* Left accent bar on active item */}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeAccentBar"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-400 shadow-sm shadow-blue-400/50"
                  />
                )}

                {/* Icon with hover & active transitions */}
                <div
                  className={`relative z-10 shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'text-blue-400 scale-105'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label and Badge */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 flex-1 flex items-center justify-between overflow-hidden"
                    >
                      <span className="truncate text-left text-[13px]">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold shrink-0 ml-1.5 ${
                            item.badgeColor === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.badgeColor === 'purple'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : item.badgeColor === 'amber'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Floating Tooltip when Collapsed */}
              {isCollapsed && hoveredItem === item.id && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-lg bg-[#141A29] text-xs font-medium text-white border border-white/10 shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-blue-400 font-mono">({item.badge})</span>}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: User Profile & Dedicated Logout */}
      <div className="p-2.5 border-t border-white/[0.06] shrink-0 space-y-1.5 bg-[#090C15]/50">
        {/* User Profile Pill */}
        <div
          onClick={() => onSelectSection('profile')}
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-all cursor-pointer group ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}
          title={isCollapsed ? `${displayName} • Profile` : undefined}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/20 shadow-sm">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0A0D16]" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-hidden text-left"
              >
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {displayName}
                  </p>
                  {user && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{userSubtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dedicated Logout Action */}
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer group ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};
