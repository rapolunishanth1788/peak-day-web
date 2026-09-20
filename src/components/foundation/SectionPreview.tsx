import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SectionId } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Toggle } from '../ui/Toggle';
import { StatWidget } from '../ui/StatWidget';
import { DashboardView } from '../dashboard/DashboardView';
import { TaskManagerView } from '../tasks/TaskManagerView';
import { ScheduleManagerView } from '../schedule/ScheduleManagerView';
import { AcademicManagerView } from '../academics/AcademicManagerView';
import { FitnessManagerView } from '../fitness/FitnessManagerView';
import {
  CheckSquare,
  Calendar,
  GraduationCap,
  Dumbbell,
  Sparkles,
  Bell,
  User,
  Settings,
  LayoutDashboard,
  Clock,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  Send,
  Plus,
  Compass,
  BookOpen,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SectionPreviewProps {
  sectionId: SectionId;
  onNavigateToDesignSystem?: () => void;
  onNavigateSection?: (sectionId: SectionId) => void;
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({
  sectionId,
  onNavigateToDesignSystem,
  onNavigateSection,
}) => {
  const { user, logout } = useAuth();
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Alex Morgan');
  const userEmail = user?.email || 'alex@stanford.edu';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();
  const photoURL = user?.photoURL;

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: "Hello Alex! I'm PeakIQ. Your schedule today has a 2-hour optimal study window between your 1:00 PM lecture and your 5:30 PM training session. Would you like me to reserve it for Differential Equations?" },
  ]);

  const handleSendAi = () => {
    if (!aiPrompt.trim()) return;
    setAiChat((prev) => [
      ...prev,
      { role: 'user', text: aiPrompt },
      { role: 'assistant', text: `Noted! In upcoming stages, I will connect directly with Gemini API to optimize your schedule, generate study plans, and monitor your training load in real-time.` },
    ]);
    setAiPrompt('');
  };

  // Section Content Switcher
  switch (sectionId) {
    case 'dashboard':
      return (
        <DashboardView onNavigateSection={onNavigateSection} />
      );

    case 'tasks':
      return <TaskManagerView />;

    case 'schedule':
      return <ScheduleManagerView />;

    case 'academics':
      return <AcademicManagerView />;

    case 'fitness':
      return <FitnessManagerView />;

    case 'ai-assistant':
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">PeakIQ Assistant</h2>
            <p className="text-sm text-slate-400">
              Your personal AI coach bridging academic scheduling, study summaries, and athletic recovery.
            </p>
          </div>

          <GlassCard className="p-6 flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {aiChat.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/[0.06] text-slate-200 border border-white/[0.08]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex gap-2">
              <input
                type="text"
                placeholder="Ask PeakIQ to schedule study blocks, balance workouts, or review coursework..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                className="flex-1 bg-[#101422] text-sm text-slate-200 px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500"
              />
              <Button variant="primary" onClick={handleSendAi} leftIcon={<Send className="w-4 h-4" />}>
                Send
              </Button>
            </div>
          </GlassCard>
        </div>
      );

    case 'notifications':
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Notifications & Insights</h2>
            <p className="text-sm text-slate-400">
              Proactive system signals for upcoming lectures, workout windows, and task deadlines.
            </p>
          </div>

          <GlassCard className="p-6 space-y-3">
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Algorithms Lecture in 45m</p>
                <p className="text-xs text-slate-400">Hall B2 • Remember to bring problem set rough draft.</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">10:00 AM Today</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <Dumbbell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Hydration & Training Alert</p>
                <p className="text-xs text-slate-400">You are 800ml short of pre-workout hydration target.</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">5:30 PM Today</span>
              </div>
            </div>
          </GlassCard>
        </div>
      );

    case 'profile':
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Athlete & Student Profile</h2>
              <p className="text-sm text-slate-400">
                Biometric credentials, verified identity, streak records, and achievements.
              </p>
            </div>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
                className="border border-rose-500/20 hover:bg-rose-500/10 text-rose-300 self-start sm:self-auto"
              >
                Sign Out
              </Button>
            )}
          </div>

          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20 shadow-xl shrink-0">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-xl font-bold text-white">{displayName}</h3>
                  <Badge variant="blue">Level 7</Badge>
                  {user && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      Firebase Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{userEmail}</p>
                <p className="text-xs text-slate-400">Computer Science Major & Competitive Athlete</p>
                <p className="text-xs text-slate-500 font-mono">
                  User UID: {user ? user.uid : 'peak-guest-dev'} • Auth: {user?.providerData[0]?.providerId || 'password'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-xs text-slate-400">Total XP</span>
                <p className="text-lg font-bold text-white mt-0.5">14,280 XP</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-xs text-slate-400">Active Streak</span>
                <p className="text-lg font-bold text-amber-400 mt-0.5">12 Days 🔥</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-xs text-slate-400">Tasks Completed</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">184 Tasks</p>
              </div>
            </div>
          </GlassCard>
        </div>
      );

    case 'settings':
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Settings & Preferences</h2>
            <p className="text-sm text-slate-400">
              Customize appearance, animation physics, sound feedback, and backend synchronization.
            </p>
          </div>

          <GlassCard className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Visual & Motion Preferences</h3>
            <Toggle label="Smooth Motion Springs" description="Use Apple spring physics for interactive elements" checked={true} onChange={() => {}} />
            <div className="h-[1px] bg-white/[0.06]" />
            <Toggle label="Frosted Glassmorphism" description="20px - 28px blur depth with ambient highlights" checked={true} onChange={() => {}} />
            <div className="h-[1px] bg-white/[0.06]" />
            <Toggle label="Student Focus Mode" description="Automatically mute distractions during academic lectures" checked={true} onChange={() => {}} />
          </GlassCard>

          <GlassCard className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Architecture & Cloud Sync Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Peak Day is pre-architected for Firebase Authentication, Cloud Firestore real-time synchronization, 
              Firebase Storage for documents, and Gemini AI for intelligent scheduling. In this first milestone, 
              the core design system and layout foundation are active.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="blue">Firebase Auth: Ready</Badge>
              <Badge variant="emerald">Cloud Firestore: Ready</Badge>
              <Badge variant="purple">Gemini AI: Ready</Badge>
            </div>
          </GlassCard>
        </div>
      );

    default:
      return null;
  }
};
