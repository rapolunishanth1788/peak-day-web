import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckSquare,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Plus,
  Zap,
  Activity,
  Award,
  AlertCircle,
  Play,
  MessageSquare,
  CheckCircle2,
  Circle,
  Timer,
  ChevronRight,
  Target,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { AiOrb } from './AiOrb';
import { SectionId } from '../../types';
import { useTasks, TaskCategory, TaskPriority } from '../../contexts/TaskContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAcademics } from '../../contexts/AcademicContext';
import { useFitness } from '../../contexts/FitnessContext';

interface DashboardViewProps {
  onNavigateSection?: (sectionId: SectionId) => void;
}

interface TaskItem {
  id: string;
  title: string;
  category: 'Academic' | 'Fitness' | 'Personal';
  done: boolean;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface UpcomingClass {
  id: string;
  title: string;
  courseCode: string;
  location: string;
  startTime: string; // e.g., '11:30 AM'
  endTime: string;
  instructor: string;
  minutesUntil: number;
}

interface DeadlineItem {
  id: string;
  title: string;
  course: string;
  dueTime: string;
  dueIn: string;
  urgency: 'critical' | 'warning' | 'normal';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateSection }) => {
  const { user } = useAuth();

  // Dynamic live time and date updates
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Shared TaskContext connection
  const {
    tasks: globalTasks,
    addTask: addGlobalTask,
    toggleComplete: toggleGlobalTask,
    dailyCompletionRate,
  } = useTasks();

  // Shared ScheduleContext connection for real-time live class & countdown
  const {
    currentActiveEvent,
    nextUpcomingClass,
    addEvent: addGlobalScheduleEvent,
  } = useSchedule();

  // Shared AcademicContext connection
  const {
    summary: academicSummary,
    subjects: academicSubjects,
    addSubject: addGlobalSubject,
  } = useAcademics();

  // Shared FitnessContext connection
  const {
    summary: fitnessSummary,
    startWorkout: startGlobalWorkout,
  } = useFitness();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasksList = globalTasks.filter((t) => t.dueDate === todayStr);

  // Upcoming Deadlines
  const deadlines: DeadlineItem[] = [
    {
      id: 'd1',
      title: 'Algorithms Homework 3 (Dynamic Programming)',
      course: 'CS 261',
      dueTime: 'Tonight, 11:59 PM',
      dueIn: '13 hours left',
      urgency: 'critical',
    },
    {
      id: 'd2',
      title: 'Sports Physiology Midterm Prep Deck',
      course: 'KIN 210',
      dueTime: 'Tomorrow, 5:00 PM',
      dueIn: '1 day left',
      urgency: 'warning',
    },
    {
      id: 'd3',
      title: 'Machine Learning Term Project Proposal',
      course: 'CS 329D',
      dueTime: 'Sept 23, 11:59 PM',
      dueIn: '4 days left',
      urgency: 'normal',
    },
  ];

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<
    'task' | 'event' | 'subject' | 'workout' | 'ai' | null
  >(null);

  // Form states for modals
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Academics');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('High');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('02:00 PM');
  const [newEventLocation, setNewEventLocation] = useState('Campus Library');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  const [newWorkoutFocus, setNewWorkoutFocus] = useState('Push / Upper Hypertrophy');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState('60');

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Success toast indicator for quick action feedback
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  // Progress metrics calculation from shared TaskContext
  const completedTasksCount = todayTasksList.filter((t) => t.completed).length;
  const totalTasksCount = todayTasksList.length;
  const taskCompletionPercent = dailyCompletionRate;

  // Toggle task handler
  const handleToggleTask = (id: string) => {
    toggleGlobalTask(id);
  };

  // Add task handler
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    addGlobalTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      dueDate: todayStr,
    });
    setNewTaskTitle('');
    setActiveModal(null);
    triggerToast(`Added task: "${newTaskTitle.trim()}"`);
  };

  // Add event handler
  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) return;
    try {
      await addGlobalScheduleEvent({
        title: newEventTitle.trim(),
        type: 'Event',
        category: 'Academic',
        date: todayStr,
        startTime: newEventTime,
        endTime: '03:00 PM',
        location: newEventLocation.trim() || undefined,
        completed: false,
      });
      triggerToast(`Scheduled "${newEventTitle}" for ${newEventTime} at ${newEventLocation}`);
    } catch (err) {
      console.error('Failed to create schedule event:', err);
    }
    setActiveModal(null);
    setNewEventTitle('');
  };

  // Add subject handler
  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await addGlobalSubject({
        name: newSubjectName.trim(),
        code: (newSubjectCode.trim() || 'SUB 101').toUpperCase(),
        credits: 3,
        facultyName: 'Faculty Instructor',
        targetMarks: 85,
        notes: '',
        color: '#3B82F6',
        attendance: { attended: 0, total: 0 },
        mid1Marks: { scored: 0, max: 30, evaluated: false },
        mid2Marks: { scored: 0, max: 30, evaluated: false },
        semesterMarks: { scored: 0, max: 100, evaluated: false },
        assignmentMarks: { scored: 0, max: 50, evaluated: false },
        labMarks: { scored: 0, max: 30, evaluated: false },
      });
      triggerToast(`Subject "${newSubjectCode || 'Course'}: ${newSubjectName}" added to curriculum`);
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
    setActiveModal(null);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  // Start workout handler
  const handleStartWorkout = () => {
    setActiveModal(null);
    startGlobalWorkout(null, newWorkoutFocus || 'Performance Session');
    triggerToast(`Workout session "${newWorkoutFocus}" started! (${newWorkoutDuration} min timer active)`);
    if (onNavigateSection) {
      onNavigateSection('fitness');
    }
  };

  // AI Ask handler
  const handleAskAi = () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiResponse(
        `Based on your CS 329D class at 11:30 AM and your 5:30 PM Upper Hypertrophy session, here is your optimal sequence:
1. Focus your next 60 minutes on finishing DP Algorithm Problem 3 while cognitive clarity is at 92%.
2. Take a 20-minute transition walk after Machine Learning to prime CNS recovery.
3. Fuel with 45g complex carbohydrates by 4:15 PM to maximize gym volume performance.`
      );
    }, 700);
  };

  // Personalized Greeting
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Alex');
  const hour = currentTime.getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Formatted date and time strings
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-medium text-xs sm:text-sm shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{actionSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 1. MAIN HERO CARD: Premium Glass Canvas with AI Orb & Live Time */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#111628]/95 via-[#0D1220]/90 to-[#070A12]/95 border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Subtle Ambient Glow Behind Hero */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Rim Specular Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Greeting, Date, Live Time, Focus Prompt */}
          <div className="space-y-4 max-w-2xl">
            {/* Live Status Pill & Streak */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Peak Readiness • 94% CNS Score</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-300/40" />
                <span>12 Day Streak</span>
              </div>
            </div>

            {/* Personalized Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {greetingTime},{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                  {displayName}
                </span>
                .
              </h1>
              <p className="text-base sm:text-lg text-slate-300 mt-2 font-medium">
                Today is focused on{' '}
                <span className="text-blue-300 font-semibold">Algorithmic Problem Solving</span> and{' '}
                <span className="text-emerald-300 font-semibold">Upper Body Hypertrophy</span>.
              </p>
            </div>

            {/* Current Live Date & Precision Clock */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-semibold tracking-wide text-white">{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Futuristic AI Visual Orb + Today's Progress Radial */}
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 self-center lg:self-auto bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
            {/* The Animated AI Visual Orb */}
            <div
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => setActiveModal('ai')}
              title="Click to ask PeakIQ AI Assistant"
            >
              <AiOrb size="md" isThinking={false} />
              <div className="flex items-center gap-1.5 text-xs text-cyan-300/80 group-hover:text-cyan-200 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] font-semibold tracking-wide">PeakIQ Active</span>
              </div>
            </div>

            {/* Circular Progress Gauge for Today's Completion */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG Radial Meter */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-white/10"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress stroke */}
                  <motion.path
                    className="text-blue-500"
                    strokeDasharray={`${taskCompletionPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="url(#progressGradient)"
                    fill="none"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${taskCompletionPercent}, 100` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner percentage indicator */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-white tracking-tight">
                    {taskCompletionPercent}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Done
                  </span>
                </div>
              </div>

              <span className="text-xs font-medium text-slate-300 text-center">
                {completedTasksCount} of {totalTasksCount} Targets Met
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. QUICK ACTIONS BAR: High Touch-Friendly Action Buttons */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Instant Actions
          </h2>
          <span className="text-[11px] text-slate-400">Click to test quick entries</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Action 1: Add Task */}
          <button
            type="button"
            onClick={() => setActiveModal('task')}
            className="group relative flex items-center justify-center sm:justify-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.1] hover:to-white/[0.05] border border-white/[0.08] hover:border-blue-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25 group-hover:scale-105 transition-all">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white block">
                Add Task
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Queue assignment</span>
            </div>
          </button>

          {/* Action 2: Add Schedule Event */}
          <button
            type="button"
            onClick={() => setActiveModal('event')}
            className="group relative flex items-center justify-center sm:justify-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.1] hover:to-white/[0.05] border border-white/[0.08] hover:border-indigo-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25 group-hover:scale-105 transition-all">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white block">
                Add Event
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Lecture or meet</span>
            </div>
          </button>

          {/* Action 3: Add Subject */}
          <button
            type="button"
            onClick={() => setActiveModal('subject')}
            className="group relative flex items-center justify-center sm:justify-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.1] hover:to-white/[0.05] border border-white/[0.08] hover:border-purple-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 group-hover:scale-105 transition-all">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white block">
                Add Subject
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Enroll syllabus</span>
            </div>
          </button>

          {/* Action 4: Start Workout */}
          <button
            type="button"
            onClick={() => setActiveModal('workout')}
            className="group relative flex items-center justify-center sm:justify-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.1] hover:to-white/[0.05] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 group-hover:scale-105 transition-all">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white block">
                Start Workout
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Upper Hypertrophy</span>
            </div>
          </button>

          {/* Action 5: Ask AI */}
          <button
            type="button"
            onClick={() => setActiveModal('ai')}
            className="col-span-2 sm:col-span-1 group relative flex items-center justify-center sm:justify-start gap-2.5 p-3.5 rounded-2xl bg-gradient-to-b from-cyan-500/15 to-blue-600/10 hover:from-cyan-500/25 hover:to-blue-600/20 border border-cyan-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-semibold text-cyan-200 group-hover:text-white block">
                Ask PeakIQ
              </span>
              <span className="text-[10px] text-cyan-300/70 hidden sm:block">AI Coach synthesis</span>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CORE METRICS & COUNTDOWN: What to Focus on Right Now */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Live Active Class or Next Class Countdown Card */}
        {currentActiveEvent ? (
          <GlassCard className="p-5 md:p-6 space-y-4 border-l-4 border-l-emerald-500 bg-emerald-500/[0.04] relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Current Live Session</span>
              </div>
              <Badge variant="emerald" size="sm" className="animate-pulse">
                Active Now
              </Badge>
            </div>

            <div>
              {currentActiveEvent.courseCode && (
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                  {currentActiveEvent.courseCode}
                </span>
              )}
              <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                {currentActiveEvent.title}
              </h3>
              {currentActiveEvent.instructor && (
                <p className="text-xs text-slate-400 mt-1">{currentActiveEvent.instructor}</p>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {currentActiveEvent.startTime} – {currentActiveEvent.endTime}
              </span>
              <span className="text-slate-400 truncate max-w-[130px]">{currentActiveEvent.location || 'Campus'}</span>
            </div>
          </GlassCard>
        ) : nextUpcomingClass?.event ? (
          <GlassCard className="p-5 md:p-6 space-y-4 border-l-4 border-l-purple-500 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Next Live Class</span>
              </div>
              <Badge variant="purple" size="sm">
                In {nextUpcomingClass.startsInFormatted}
              </Badge>
            </div>

            <div>
              {nextUpcomingClass.event.courseCode && (
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">
                  {nextUpcomingClass.event.courseCode}
                </span>
              )}
              <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                {nextUpcomingClass.event.title}
              </h3>
              {nextUpcomingClass.event.instructor && (
                <p className="text-xs text-slate-400 mt-1">{nextUpcomingClass.event.instructor}</p>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {nextUpcomingClass.event.startTime} – {nextUpcomingClass.event.endTime}
              </span>
              <span className="text-slate-400 truncate max-w-[130px]">
                {nextUpcomingClass.event.location || 'Campus'}
              </span>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 md:p-6 space-y-4 border-l-4 border-l-purple-500 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Timetable Status</span>
              </div>
              <Badge variant="purple" size="sm">
                Up to Date
              </Badge>
            </div>

            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                No More Classes Today
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You are all caught up on scheduled lectures and laboratory sessions.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Next session on schedule
              </span>
              <span
                className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                onClick={() => onNavigateSection && onNavigateSection('schedule')}
              >
                View Full Timetable →
              </span>
            </div>
          </GlassCard>
        )}

        {/* Academic Progress Snapshot */}
        <GlassCard
          className="p-5 md:p-6 space-y-4 border-l-4 border-l-blue-500 cursor-pointer hover:border-white/20 transition-all"
          onClick={() => onNavigateSection && onNavigateSection('academics')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Academic Load</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-300">
              GPA {academicSummary.overallGpa4.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-semibold text-white">Cumulative Average</span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {academicSummary.creditWeightedPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${Math.min(100, academicSummary.creditWeightedPercentage)}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase">Overall Attendance</p>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {academicSummary.overallAttendancePercentage}%
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase">Active Modules</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">
                {academicSubjects.length} Courses ({academicSummary.totalCredits} cr)
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Fitness & Recovery Status Snapshot */}
        <GlassCard
          onClick={() => onNavigateSection && onNavigateSection('fitness')}
          className="p-5 md:p-6 space-y-4 border-l-4 border-l-emerald-500 cursor-pointer hover:border-white/[0.15] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fitness & CNS</span>
            </div>
            <Badge variant="emerald" size="sm">
              Readiness {fitnessSummary.recoveryReadinessScore}%
            </Badge>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-semibold text-white">Weekly Training Volume</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {fitnessSummary.weeklyVolumeLbs.toLocaleString()} lbs
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, Math.max(15, (fitnessSummary.weeklyVolumeLbs / 30000) * 100))}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase">Streak & Consistency</p>
              <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {fitnessSummary.currentStreak} Days ({fitnessSummary.consistencyRate}%)
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase">Sessions This Week</p>
              <p className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                {fitnessSummary.weeklyWorkoutsCount} Logged
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN WORKSPACE SPLIT: Tasks Agenda & AI Recommendations */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Agenda (2 Columns on large screens) */}
        <GlassCard className="p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Today's Focus Tasks</h3>
                <p className="text-xs text-slate-400">
                  {completedTasksCount} of {totalTasksCount} completed • Click circle to check off
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setActiveModal('task')}
            >
              Add Task
            </Button>
          </div>

          {/* Interactive Tasks List */}
          <div className="space-y-2.5">
            {todayTasksList.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group select-none ${
                  task.completed
                    ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                    : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                        : 'border border-white/20 text-transparent group-hover:border-blue-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="overflow-hidden">
                    <p
                      className={`text-sm font-medium transition-all ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{task.dueDate}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-300">{task.category}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    task.priority === 'High'
                      ? 'rose'
                      : task.priority === 'Medium'
                      ? 'amber'
                      : 'default'
                  }
                  size="sm"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>

          {/* Upcoming Academic Deadlines Panel */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Upcoming Major Deadlines
              </h4>
              <button
                type="button"
                onClick={() => onNavigateSection && onNavigateSection('academics')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                View Syllabus <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {deadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {item.course} • {item.dueTime}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.urgency === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.urgency === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.dueIn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Right Column: AI Coach Recommendations & Productivity Statistics */}
        <div className="space-y-6">
          {/* AI Recommendation Area with Interactive Feedback */}
          <GlassCard className="p-6 space-y-4 border border-cyan-500/30 bg-gradient-to-b from-[#0F1A2A]/90 to-[#0A101C]/90 shadow-[0_8px_32px_rgba(56,189,248,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">PeakIQ Daily Synthesis</h3>
              </div>
              <Badge variant="blue" size="sm">
                Real-time
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              "Your cognitive rhythm peaks between <strong>9:00 AM – 11:15 AM</strong>. Finish your 
              Algorithms problem set before CS 329D. Your leg musculature is fully recovered (+94% readiness) 
              for high-intensity squats today."
            </p>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-semibold text-cyan-200 block uppercase tracking-wide">
                Optimal Recovery Strategy
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Hydrate with 500ml water by 11:00 AM</li>
                <li>45g carbs 90 min before workout</li>
                <li>Target sleep window: 10:45 PM tonight</li>
              </ul>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-cyan-300 hover:text-white border border-cyan-500/20 hover:bg-cyan-500/10"
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => setActiveModal('ai')}
            >
              Ask AI for Today's Plan
            </Button>
          </GlassCard>

          {/* Productivity & Consistency Statistics */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Weekly Productivity</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-semibold">+14% vs last wk</span>
            </div>

            {/* Micro 7-day bar chart simulation */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-2 h-24">
                {[
                  { day: 'M', height: '65%', active: false },
                  { day: 'T', height: '80%', active: false },
                  { day: 'W', height: '90%', active: false },
                  { day: 'T', height: '75%', active: false },
                  { day: 'F', height: '95%', active: false },
                  { day: 'S', height: `${taskCompletionPercent}%`, active: true },
                  { day: 'S', height: '20%', active: false },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full rounded-md bg-white/[0.06] h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          bar.active
                            ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-blue-500/30'
                            : 'bg-white/20'
                        }`}
                        style={{ height: bar.height }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium ${
                        bar.active ? 'text-blue-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span>Focus Score: <strong className="text-white font-mono">92/100</strong></span>
              <span>Habit Consistency: <strong className="text-emerald-400 font-mono">96%</strong></span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MODALS FOR QUICK ACTIONS: Adding Tasks, Events, Subjects, Workouts, AI */}
      {/* ============================================================== */}

      {/* Quick Action: Add Task Modal */}
      <Modal
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        title="Add New Daily Task"
        description="Schedule a high-impact task or academic assignment."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              Save Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task Description"
            placeholder="e.g. Read Operating Systems Chapter 4"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Category</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as any)}
                className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Academics">Academics</option>
                <option value="Fitness">Fitness</option>
                <option value="College">College</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Action: Add Event Modal */}
      <Modal
        isOpen={activeModal === 'event'}
        onClose={() => setActiveModal(null)}
        title="Schedule Calendar Event"
        description="Add a class, meeting, coach review, or study session."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateEvent}>
              Schedule Event
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Event Name"
            placeholder="e.g. Linear Algebra Discussion or Team Film Study"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              placeholder="e.g. 02:00 PM"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
            />
            <Input
              label="Location / Room"
              placeholder="e.g. Room 304 or Zoom"
              value={newEventLocation}
              onChange={(e) => setNewEventLocation(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Quick Action: Add Subject Modal */}
      <Modal
        isOpen={activeModal === 'subject'}
        onClose={() => setActiveModal(null)}
        title="Enroll Academic Subject"
        description="Add a course, credit units, and syllabus details."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubject}>
              Add Subject
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject / Course Name"
            placeholder="e.g. Discrete Mathematics"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              placeholder="e.g. MATH 108"
              value={newSubjectCode}
              onChange={(e) => setNewSubjectCode(e.target.value)}
            />
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Term</label>
              <select className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500">
                <option>Fall Semester</option>
                <option>Spring Semester</option>
                <option>Summer Intensive</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Action: Start Workout Modal */}
      <Modal
        isOpen={activeModal === 'workout'}
        onClose={() => setActiveModal(null)}
        title="Initiate Workout Session"
        description="Configure your training session, muscle focus, and timer."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="accent-emerald" onClick={handleStartWorkout} leftIcon={<Play className="w-3.5 h-3.5" />}>
              Start Session Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Session Focus"
            value={newWorkoutFocus}
            onChange={(e) => setNewWorkoutFocus(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Duration (mins)"
              type="number"
              value={newWorkoutDuration}
              onChange={(e) => setNewWorkoutDuration(e.target.value)}
            />
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Intensity</label>
              <select className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500">
                <option>RPE 8 (Hypertrophy)</option>
                <option>RPE 9 (Peak Strength)</option>
                <option>RPE 6 (Recovery / Deload)</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Action: Ask AI Modal with Interactive Consultation */}
      <Modal
        isOpen={activeModal === 'ai'}
        onClose={() => setActiveModal(null)}
        title="PeakIQ Assistant Consultation"
        description="Ask your AI agent to optimize your study sequence, recovery, or diet."
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <AiOrb size="sm" isThinking={isAiLoading} />
            <div>
              <p className="text-xs font-semibold text-cyan-200">PeakIQ Student-Athlete Intelligence</p>
              <p className="text-[11px] text-slate-300">
                Ask about exam prep, workout splits, nutrition timing, or day planning.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask anything, e.g. How should I pace my study sets before my workout?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              autoFocus
            />
            <Button
              variant="primary"
              onClick={handleAskAi}
              disabled={isAiLoading || !aiQuestion.trim()}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {isAiLoading ? 'Synthesizing...' : 'Ask'}
            </Button>
          </div>

          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 leading-relaxed whitespace-pre-line"
            >
              {aiResponse}
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Suggested queries:</span>
            {[
              'Optimize today for max energy',
              'What should I eat before training?',
              'Review my upcoming deadlines',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiQuestion(q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
