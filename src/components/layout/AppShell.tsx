import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { SectionId } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Search, Bell, Sparkles, CheckCircle2, Clock, Dumbbell, BookOpen } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../lib/designSystem';
import { useTasks } from '../../contexts/TaskContext';

interface AppShellProps {
  currentSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onLogoutSuccess?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentSection,
  onSelectSection,
  onLogoutSuccess,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentStreakDays: streakCount } = useTasks();

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNavItems = NAVIGATION_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex overflow-hidden font-sans relative">
      {/* Ambient background soft gradients (Apple dark atmosphere, subtle depth) */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-950/10 blur-[160px] pointer-events-none" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-indigo-950/10 blur-[150px] pointer-events-none" />

      {/* Desktop Persistent Animated Left Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={onSelectSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          streakCount={streakCount}
          onLogoutSuccess={onLogoutSuccess}
        />
      </div>

      {/* Mobile Navigation System: Floating Bottom Nav & Full Drawer */}
      <MobileNav
        currentSection={currentSection}
        onSelectSection={onSelectSection}
        isOpen={isMobileMenuOpen}
        onOpen={() => setIsMobileMenuOpen(true)}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogoutSuccess={onLogoutSuccess}
      />

      {/* Main Responsive Content Area Beside Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          currentSection={currentSection}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onQuickAction={() => setIsQuickActionOpen(true)}
          onOpenProfile={() => onSelectSection('profile')}
          onLogoutSuccess={onLogoutSuccess}
        />

        {/* Scrollable Viewport with Smooth Page Transitions */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8">
          <div className="max-w-7xl mx-auto w-full pb-24 md:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Quick Search (Command Palette ⌘K) Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Universal Quick Search"
        description="Search across sections, courses, workouts, or launch an action."
        size="md"
      >
        <div className="space-y-4">
          <Input
            isSearch
            placeholder="Type a section name, course, or action (e.g. fitness, calculus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          <div className="space-y-1 mt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Quick Jump
            </p>
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setIsSearchOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.08] text-left transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-sm">{item.description}</p>
                </div>
                {item.badge && <Badge size="sm">{item.badge}</Badge>}
              </button>
            ))}
            {filteredNavItems.length === 0 && (
              <p className="text-xs text-slate-400 p-4 text-center">
                No matching section found for "{searchQuery}".
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Notifications Drawer Modal */}
      <Modal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications & Briefings"
        description="Today's priority updates, schedule nudges, and fitness summaries."
        size="md"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">Upcoming Academic Lecture</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Advanced Algorithms in 45 minutes (Hall B2 or Zoom link).
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">10:00 AM Today</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">Upper Body Hypertrophy</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Scheduled for 5:30 PM. Hydration status is currently at 65% of target.
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">5:30 PM Today</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-white/10 text-slate-300 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">Daily Task Streak</p>
              <p className="text-xs text-slate-400 mt-0.5">
                You're on a 12-day consecutive task completion streak! Keep going.
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Yesterday</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Action Modal */}
      <Modal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        title="Quick Entry"
        description="Quickly capture a task, workout log, or study milestone."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsQuickActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsQuickActionOpen(false)}>
              Save Entry
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Physics Problem Set 4 or 5km recovery run" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Category</label>
              <select className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500">
                <option value="academic">Academic Task</option>
                <option value="fitness">Fitness / Workout</option>
                <option value="habit">Daily Habit</option>
                <option value="schedule">Schedule Event</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Priority</label>
              <select className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500">
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
