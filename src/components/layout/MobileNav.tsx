import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Dumbbell,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Bell,
  User,
  Settings,
  Flame,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SectionId } from '../../types';
import { NAVIGATION_ITEMS } from '../../lib/designSystem';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  currentSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
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

// 4 primary quick-access tabs on the bottom bar + 1 More menu trigger
const QUICK_BOTTOM_TABS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onClose,
  onOpen,
  onLogoutSuccess,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Athlete');
  const userEmail = user?.email || 'authenticated-user@peakday.app';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();
  const photoURL = user?.photoURL;

  const isCurrentSectionInMore = !QUICK_BOTTOM_TABS.some((tab) => tab.id === currentSection);

  return (
    <>
      {/* Floating Apple-Style Frosted Glass Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 left-3 right-3 z-40 md:hidden select-none"
      >
        <div className="bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 px-2 py-1.5 flex items-center justify-around">
          {QUICK_BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSection === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectSection(tab.id);
                  onClose();
                }}
                className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[54px] rounded-xl transition-all active:scale-95 cursor-pointer ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.1]"
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight">{tab.label}</span>
                </div>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            type="button"
            onClick={isOpen ? onClose : onOpen}
            className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[54px] rounded-xl transition-all active:scale-95 cursor-pointer ${
              isOpen || isCurrentSectionInMore
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {(isOpen || isCurrentSectionInMore) && (
              <motion.div
                layoutId="mobileActiveTabPill"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.1]"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <div className="relative">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {isCurrentSectionInMore && !isOpen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#0B0F19]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">
                {isCurrentSectionInMore ? 'More •' : 'More'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* Full Mobile Navigation Drawer (when opened) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] bg-[#0A0E18] rounded-t-3xl border-t border-white/[0.15] shadow-2xl flex flex-col overflow-hidden pb-8"
            >
              {/* Top Drag Handle */}
              <div className="pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1px]">
                    <div className="w-full h-full rounded-xl bg-[#090C15] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Peak Day Navigation</h3>
                    <p className="text-[11px] text-slate-400">Student Athlete Operating System</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] active:scale-95 transition-all"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card & Streak */}
              <div className="p-4 mx-4 mt-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <div
                  onClick={() => {
                    onSelectSection('profile');
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 border border-white/20">
                    {photoURL ? (
                      <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0E18]" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      {user && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 shrink-0">
                  <Flame className="w-3.5 h-3.5 fill-amber-300/40" />
                  <span className="text-xs font-mono font-bold">12d</span>
                </div>
              </div>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 max-h-[45vh]">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-0.5">
                  All Application Sections
                </p>

                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = SECTION_ICONS[item.id];
                  const isActive = currentSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectSection(item.id);
                        onClose();
                      }}
                      className={`w-full min-h-[48px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 border border-blue-500/30 text-white font-medium shadow-sm'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-blue-500/30 text-blue-300'
                              : 'bg-white/[0.05] text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm">{item.label}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-white/10 text-slate-200 border border-white/10">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Sign Out Button */}
              <div className="px-4 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium text-sm transition-all active:scale-98 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Peak Day</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
