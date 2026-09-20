import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  FileText,
  Flame,
  TrendingUp,
  Tag,
  ChevronDown,
  Sparkles,
  BookOpen,
  Dumbbell,
  GraduationCap,
  User,
  SlidersHorizontal,
  X,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useTasks, Task, TaskCategory, TaskPriority } from '../../contexts/TaskContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

type TaskViewTab = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
type SortOption = 'dueDate' | 'priority' | 'title' | 'createdAt';

const CATEGORIES: { id: TaskCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Academics', label: 'Academics', icon: GraduationCap },
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'College', label: 'College', icon: BookOpen },
  { id: 'Personal', label: 'Personal', icon: User },
  { id: 'Other', label: 'Other', icon: Tag },
];

export const TaskManagerView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    dailyCompletionRate,
    weeklyCompletionRate,
    totalCompletedCount,
    currentStreakDays,
    todayTasksCount,
    upcomingTasksCount,
    completedTasksCount,
    overdueTasksCount,
    isLoading,
    isSyncing,
    error: firestoreError,
  } = useTasks();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TaskViewTab>('today');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Academics');
  const [formPriority, setFormPriority] = useState<TaskPriority>('High');
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormCategory('Academics');
    setFormPriority('High');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormNotes(task.notes || '');
    setIsModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        notes: formNotes.trim() || undefined,
      });
      showToast(`Updated task: "${formTitle.trim()}"`);
    } else {
      addTask({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        dueDate: formDueDate,
        notes: formNotes.trim() || undefined,
      });
      showToast(`Created task: "${formTitle.trim()}"`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteConfirmTaskId) {
      const taskToDelete = tasks.find((t) => t.id === deleteConfirmTaskId);
      deleteTask(deleteConfirmTaskId);
      showToast(`Deleted task: "${taskToDelete?.title || 'Task'}"`);
      setDeleteConfirmTaskId(null);
    }
  };

  // Filtered and Sorted Tasks Computation
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab Filtering
        if (activeTab === 'today') {
          if (task.dueDate !== todayStr) return false;
        } else if (activeTab === 'upcoming') {
          if (task.completed || task.dueDate <= todayStr) return false;
        } else if (activeTab === 'completed') {
          if (!task.completed) return false;
        } else if (activeTab === 'overdue') {
          if (task.completed || task.dueDate >= todayStr) return false;
        }

        // Search Query Filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchNotes = task.notes?.toLowerCase().includes(q);
          const matchCategory = task.category.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchCategory) return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Priority Filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'dueDate') {
          comparison = a.dueDate.localeCompare(b.dueDate);
        } else if (sortBy === 'priority') {
          const priorityWeights: Record<TaskPriority, number> = { High: 3, Medium: 2, Low: 1 };
          comparison = priorityWeights[b.priority] - priorityWeights[a.priority];
        } else if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'createdAt') {
          comparison = a.createdAt.localeCompare(b.createdAt);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [tasks, activeTab, searchQuery, selectedCategory, selectedPriority, sortBy, sortDirection, todayStr]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-500/90 text-white font-medium text-xs sm:text-sm shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider">
              Student Athlete Task Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Focus & Task Management
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <p className="text-xs sm:text-sm text-slate-400">
              Prioritize coursework, training splits, and university deadlines with zero friction.
            </p>
            {isSyncing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[11px] font-mono border border-blue-500/25">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                <span>Syncing Firestore</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-mono border border-emerald-500/25">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Cloud Firestore Active</span>
              </span>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreateModal}
          className="shadow-lg shadow-blue-500/20"
        >
          Add New Task
        </Button>
      </div>

      {/* Firestore Error Alert if any */}
      {firestoreError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg shadow-rose-950/20">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-rose-200">Cloud Firestore Error</p>
            <p className="text-slate-300 text-xs mt-0.5 truncate">{firestoreError}</p>
          </div>
        </div>
      )}

      {/* STATISTICS CARDS WITH ANIMATED PROGRESS BARS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Daily Completion */}
        <GlassCard className="p-4 sm:p-5 space-y-3 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Daily Completion</span>
            <span className="text-blue-400 font-mono font-bold">{dailyCompletionRate}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {tasks.filter((t) => t.dueDate === todayStr && t.completed).length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {tasks.filter((t) => t.dueDate === todayStr).length} today
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyCompletionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            />
          </div>
        </GlassCard>

        {/* Weekly Completion */}
        <GlassCard className="p-4 sm:p-5 space-y-3 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Weekly Target</span>
            <span className="text-purple-400 font-mono font-bold">{weeklyCompletionRate}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {weeklyCompletionRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">pacing index</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyCompletionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
            />
          </div>
        </GlassCard>

        {/* Total Completed */}
        <GlassCard className="p-4 sm:p-5 space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Completed</span>
            <span className="text-emerald-400 font-mono font-bold">Lifetime</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {totalCompletedCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">milestones</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High athletic discipline</span>
          </div>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard className="p-4 sm:p-5 space-y-3 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Habit Streak</span>
            <span className="text-amber-400 font-mono font-bold">Active 🔥</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {currentStreakDays}
            </span>
            <span className="text-xs text-slate-400 font-medium">consecutive days</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300">
            <Flame className="w-3.5 h-3.5 fill-amber-300/40" />
            <span>Never miss twice</span>
          </div>
        </GlassCard>
      </div>

      {/* FILTER TABS: Today, Upcoming, Completed, Overdue, All */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { id: 'today', label: "Today's Tasks", count: todayTasksCount },
          { id: 'upcoming', label: 'Upcoming', count: upcomingTasksCount },
          { id: 'overdue', label: 'Overdue', count: overdueTasksCount, alert: overdueTasksCount > 0 },
          { id: 'completed', label: 'Completed', count: completedTasksCount },
          { id: 'all', label: 'All Tasks', count: tasks.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TaskViewTab)}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-white border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                tab.alert
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : activeTab === tab.id
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH, CATEGORY, PRIORITY & SORT CONTROLS BAR */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, notes, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D121F] text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-[#0D121F] text-slate-200 text-xs rounded-xl py-2 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Academics">Academics</option>
                <option value="Fitness">Fitness</option>
                <option value="College">College</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full sm:w-auto bg-[#0D121F] text-slate-200 text-xs rounded-xl py-2 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="relative flex-1 sm:flex-initial flex items-center gap-1 bg-[#0D121F] rounded-xl px-2 border border-white/10">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-slate-200 text-xs py-2 focus:outline-none cursor-pointer"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Alphabetical</option>
                <option value="createdAt">Date Created</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="px-1.5 py-1 text-slate-400 hover:text-white text-xs font-mono"
                title="Toggle sort direction"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary Chips */}
        {(selectedCategory !== 'all' || selectedPriority !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06] text-xs">
            <span className="text-slate-400">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory('all')}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {selectedPriority !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {selectedPriority}
                <button type="button" onClick={() => setSelectedPriority('all')}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-slate-200">
                "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </GlassCard>

      {/* TASK LIST WITH ANIMATED TRANSITIONS */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => {
            const isOverdue = !task.completed && task.dueDate < todayStr;
            const isDueToday = task.dueDate === todayStr;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                    : isOverdue
                    ? 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/30'
                    : 'bg-[#101524]/80 hover:bg-[#13192B]/90 border-white/[0.08] hover:border-white/[0.15]'
                } shadow-md shadow-black/20`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Complete Checkbox + Title + Category + Date */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Interactive Completion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(task.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                          : 'border border-white/25 hover:border-blue-400 text-transparent hover:text-blue-400/40 bg-white/[0.04]'
                      }`}
                      title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          onClick={() => toggleComplete(task.id)}
                          className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer transition-all ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-100 group-hover:text-white'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Priority Badge */}
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

                        {/* Category Badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                            task.category === 'Academics'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                              : task.category === 'Fitness'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                              : task.category === 'College'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                              : 'bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {task.category}
                        </span>
                      </div>

                      {/* Notes (if present) */}
                      {task.notes && (
                        <p className="text-xs text-slate-400 flex items-start gap-1.5 pt-0.5 leading-relaxed">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                          <span>{task.notes}</span>
                        </p>
                      )}

                      {/* Due date & status alert */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate}
                        </span>

                        {isDueToday && !task.completed && (
                          <span className="text-blue-400 font-semibold">• Due Today</span>
                        )}

                        {isOverdue && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}

                        {task.completed && (
                          <span className="text-emerald-400 font-semibold">• Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Edit & Delete buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmTaskId(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Skeletons */}
        {isLoading && tasks.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/10" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
                <div className="flex items-center gap-3 pl-9">
                  <div className="h-3 bg-white/5 rounded w-20" />
                  <div className="h-3 bg-white/5 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredTasks.length === 0 && !isLoading && (
          <GlassCard className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : activeTab === 'completed'
                ? 'No completed tasks yet. Finish a task today to build your streak!'
                : activeTab === 'overdue'
                ? 'Zero overdue tasks. You are fully on schedule!'
                : 'Your agenda is clean. Add a new task to stay ahead of your day.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenCreateModal}
            >
              Create Task
            </Button>
          </GlassCard>
        )}
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? 'Edit Task' : 'Create New Focus Task'}
        description="Set your task priority, category, deadline, and reference notes."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSaveTask()}>
              {editingTaskId ? 'Save Changes' : 'Create Task'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Dynamic Programming Problem Set 3"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Category Dropdown */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Academics">Academics</option>
                <option value="Fitness">Fitness</option>
                <option value="College">College</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Due Date
            </label>
            <input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500 cursor-pointer"
            />
          </div>

          {/* Notes Area */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Notes & Reference (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key deliverables, textbook chapter references, gym reps, or links..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-[#111624] text-slate-200 text-sm rounded-xl py-2.5 px-3 border border-white/10 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteConfirmTaskId !== null}
        onClose={() => setDeleteConfirmTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirmTaskId(null)}>
              Keep Task
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-300">
          Task:{' '}
          <strong className="text-white">
            {tasks.find((t) => t.id === deleteConfirmTaskId)?.title}
          </strong>
        </p>
      </Modal>
    </div>
  );
};
