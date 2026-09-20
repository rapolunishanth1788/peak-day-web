import React, { useState } from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  Calendar,
  History,
  BookOpen,
  Award,
  Scale,
  Target,
  BarChart3,
  Plus,
  Play,
  Zap,
  Timer,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { FitnessDashboardView } from './FitnessDashboardView';
import { WorkoutPlannerView } from './WorkoutPlannerView';
import { WorkoutHistoryView } from './WorkoutHistoryView';
import { ExerciseLibraryView } from './ExerciseLibraryView';
import { PersonalRecordsView } from './PersonalRecordsView';
import { BodyTrackingView } from './BodyTrackingView';
import { FitnessGoalsView } from './FitnessGoalsView';
import { TrainingCalendarView } from './TrainingCalendarView';
import { FitnessAnalyticsView } from './FitnessAnalyticsView';
import { LiveWorkoutRunnerModal } from './LiveWorkoutRunnerModal';
import { WorkoutBuilderModal } from './WorkoutBuilderModal';
import { WorkoutTemplate } from '../../types/fitness';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const FitnessManagerView: React.FC = () => {
  const { activeWorkout, activeWorkoutDuration, startWorkout } = useFitness();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'planner', label: 'Routines & Splits', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'history', label: 'History Logs', icon: <History className="w-4 h-4" /> },
    { id: 'exercises', label: 'Exercise Vault', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'prs', label: 'PRs & 1RM', icon: <Award className="w-4 h-4" /> },
    { id: 'body', label: 'Body & Photos', icon: <Scale className="w-4 h-4" /> },
    { id: 'goals', label: 'Objectives', icon: <Target className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleStartQuickSession = () => {
    if (!activeWorkout) {
      startWorkout(null, 'Quick Performance Workout');
    }
    setIsRunnerOpen(true);
  };

  const handleOpenBuilder = (template?: WorkoutTemplate) => {
    setEditingTemplate(template || null);
    setIsBuilderOpen(true);
  };

  // Format timer string for dock
  const formatTimerMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Navigation Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Peak Day Fitness OS
              <Badge variant="emerald" size="sm">Pro</Badge>
            </h1>
            <p className="text-xs text-slate-400">
              Biomechanical tracking, progressive overload & periodized hypertrophy
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeWorkout ? (
            <Button
              variant="accent-emerald"
              size="sm"
              onClick={() => setIsRunnerOpen(true)}
              className="animate-pulse shadow-md shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Active Session ({formatTimerMinSec(activeWorkoutDuration)})
            </Button>
          ) : (
            <Button
              variant="accent-emerald"
              size="sm"
              onClick={handleStartQuickSession}
            >
              <Play className="w-4 h-4 mr-1.5" />
              Start Workout
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenBuilder()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Build Routine
          </Button>
        </div>
      </div>

      {/* Tabs navigation pill bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'dashboard' && (
          <FitnessDashboardView
            onStartQuickWorkout={handleStartQuickSession}
            onOpenWorkoutBuilder={() => handleOpenBuilder()}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'planner' && (
          <WorkoutPlannerView onOpenBuilder={(tpl) => handleOpenBuilder(tpl)} />
        )}
        {activeTab === 'history' && <WorkoutHistoryView />}
        {activeTab === 'exercises' && <ExerciseLibraryView />}
        {activeTab === 'prs' && <PersonalRecordsView />}
        {activeTab === 'body' && <BodyTrackingView />}
        {activeTab === 'goals' && <FitnessGoalsView />}
        {activeTab === 'calendar' && <TrainingCalendarView />}
        {activeTab === 'analytics' && <FitnessAnalyticsView />}
      </div>

      {/* Persistent Floating Active Workout Dock (shown whenever an active session is in progress) */}
      {activeWorkout && !isRunnerOpen && (
        <div
          onClick={() => setIsRunnerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-center gap-4 cursor-pointer hover:scale-105 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Timer className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                {activeWorkout.title}
              </p>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {formatTimerMinSec(activeWorkoutDuration)} • Tap to expand sets
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}

      {/* Live Active Workout Runner Modal */}
      <LiveWorkoutRunnerModal
        isOpen={isRunnerOpen}
        onClose={() => setIsRunnerOpen(false)}
      />

      {/* Workout Builder Modal */}
      <WorkoutBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingTemplate(null);
        }}
        initialTemplate={editingTemplate}
      />
    </div>
  );
};
