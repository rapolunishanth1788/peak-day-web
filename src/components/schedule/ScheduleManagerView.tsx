import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  FileText,
  Bell,
  Sparkles,
  MapPin,
  User,
  Trash2,
  Edit2,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Check,
  Cloud,
  RefreshCw,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  useSchedule,
  ScheduleEvent,
  ScheduleItemType,
  ScheduleCategory,
  timeStringToMinutes,
  getLocalDateString,
} from '../../contexts/ScheduleContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

const ITEM_TYPES: ScheduleItemType[] = ['Class', 'Exam', 'Assignment', 'Event', 'Reminder'];
const CATEGORIES: ScheduleCategory[] = ['Academic', 'Fitness', 'Personal', 'Other'];

const TYPE_COLORS: Record<ScheduleItemType, { bg: string; text: string; border: string; badge: 'purple' | 'rose' | 'amber' | 'blue' | 'emerald' }> = {
  Class: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30', badge: 'purple' },
  Exam: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30', badge: 'rose' },
  Assignment: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/30', badge: 'rose' },
  Event: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30', badge: 'blue' },
  Reminder: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', badge: 'emerald' },
};

const COLOR_PRESETS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#EF4444' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Cyan', value: '#06B6D4' },
];

const DAYS_OF_WEEK = [
  { short: 'Sun', full: 'Sunday', index: 0 },
  { short: 'Mon', full: 'Monday', index: 1 },
  { short: 'Tue', full: 'Tuesday', index: 2 },
  { short: 'Wed', full: 'Wednesday', index: 3 },
  { short: 'Thu', full: 'Thursday', index: 4 },
  { short: 'Fri', full: 'Friday', index: 5 },
  { short: 'Sat', full: 'Saturday', index: 6 },
];

export const ScheduleManagerView: React.FC = () => {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    toggleEventCompleted,
    currentActiveEvent,
    nextUpcomingClass,
    isLoading,
    isSyncing,
    error,
  } = useSchedule();

  // View state: daily vs weekly
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');

  // Selected date reference for calendar navigation
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateStr = getLocalDateString(selectedDate);
  const todayStr = getLocalDateString(new Date());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ScheduleItemType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ScheduleCategory | 'ALL'>('ALL');

  // Modal states for Create / Edit / Reschedule
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ScheduleItemType>('Class');
  const [formCategory, setFormCategory] = useState<ScheduleCategory>('Academic');
  const [formCourseCode, setFormCourseCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(selectedDateStr);
  const [formStartTime, setFormStartTime] = useState('10:00 AM');
  const [formEndTime, setFormEndTime] = useState('11:15 AM');
  const [formInstructor, setFormInstructor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState('#3B82F6');
  const [formDaysOfWeek, setFormDaysOfWeek] = useState<number[]>([]);

  // Reschedule Quick Modal
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduleEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Calculate current week boundaries based on selectedDate (Monday-start)
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay(); // 0 is Sun, 1 is Mon...
    // Adjust so Monday is day 0
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMon);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        dateStr: getLocalDateString(d),
        dayName: DAYS_OF_WEEK[(d.getDay() + 7) % 7].short,
        dayNumber: d.getDate(),
        isToday: getLocalDateString(d) === todayStr,
        isSelected: getLocalDateString(d) === selectedDateStr,
      };
    });
  }, [selectedDate, selectedDateStr, todayStr]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Open modal for new event
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormType('Class');
    setFormCategory('Academic');
    setFormCourseCode('');
    setFormLocation('');
    setFormDate(defaultDate || selectedDateStr);
    setFormStartTime('10:00 AM');
    setFormEndTime('11:15 AM');
    setFormInstructor('');
    setFormNotes('');
    setFormColor('#3B82F6');
    setFormDaysOfWeek([]);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (ev: ScheduleEvent) => {
    setEditingEventId(ev.id);
    setFormTitle(ev.title);
    setFormType(ev.type);
    setFormCategory(ev.category);
    setFormCourseCode(ev.courseCode || '');
    setFormLocation(ev.location || '');
    setFormDate(ev.date);
    setFormStartTime(ev.startTime);
    setFormEndTime(ev.endTime);
    setFormInstructor(ev.instructor || '');
    setFormNotes(ev.notes || '');
    setFormColor(ev.color || '#3B82F6');
    setFormDaysOfWeek(ev.daysOfWeek || []);
    setIsModalOpen(true);
  };

  // Open reschedule quick action
  const handleOpenReschedule = (ev: ScheduleEvent) => {
    setRescheduleTarget(ev);
    setRescheduleDate(ev.date);
    setRescheduleTime(ev.startTime);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleTarget) return;
    try {
      await moveEvent(rescheduleTarget.id, rescheduleDate, rescheduleTime);
      setRescheduleTarget(null);
    } catch (err) {
      console.error('Error rescheduling event:', err);
    }
  };

  // Submit create or edit form
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, {
          title: formTitle.trim(),
          type: formType,
          category: formCategory,
          courseCode: formCourseCode.trim() || undefined,
          location: formLocation.trim() || undefined,
          date: formDate,
          startTime: formStartTime.trim(),
          endTime: formEndTime.trim(),
          instructor: formInstructor.trim() || undefined,
          notes: formNotes.trim() || undefined,
          color: formColor,
          daysOfWeek: formDaysOfWeek.length > 0 ? formDaysOfWeek : undefined,
        });
      } else {
        await addEvent({
          title: formTitle.trim(),
          type: formType,
          category: formCategory,
          courseCode: formCourseCode.trim() || undefined,
          location: formLocation.trim() || undefined,
          date: formDate,
          startTime: formStartTime.trim(),
          endTime: formEndTime.trim(),
          instructor: formInstructor.trim() || undefined,
          notes: formNotes.trim() || undefined,
          color: formColor,
          daysOfWeek: formDaysOfWeek.length > 0 ? formDaysOfWeek : undefined,
          completed: false,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save event failed:', err);
    }
  };

  // Delete event
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteEvent(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete event failed:', err);
    }
  };

  // Filtered Events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (typeFilter !== 'ALL' && ev.type !== typeFilter) return false;
      if (categoryFilter !== 'ALL' && ev.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchCode = ev.courseCode?.toLowerCase().includes(q);
        const matchLoc = ev.location?.toLowerCase().includes(q);
        const matchInst = ev.instructor?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLoc && !matchInst) return false;
      }
      return true;
    });
  }, [events, typeFilter, categoryFilter, searchQuery]);

  // Events for Daily Timetable
  const dailyEvents = useMemo(() => {
    const dayOfWeekIndex = selectedDate.getDay();
    const list = filteredEvents.filter((ev) => {
      if (ev.date === selectedDateStr) return true;
      if (ev.daysOfWeek && ev.daysOfWeek.includes(dayOfWeekIndex)) return true;
      return false;
    });
    return list.sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));
  }, [filteredEvents, selectedDate, selectedDateStr]);

  // Group events by day for Weekly Timetable
  const weeklyMap = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    weekDays.forEach((wd) => {
      const dayIdx = wd.date.getDay();
      const items = filteredEvents.filter((ev) => {
        if (ev.date === wd.dateStr) return true;
        if (ev.daysOfWeek && ev.daysOfWeek.includes(dayIdx)) return true;
        return false;
      });
      items.sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));
      map.set(wd.dateStr, items);
    });
    return map;
  }, [filteredEvents, weekDays]);

  // Toggle day selection for recurring classes
  const toggleDayOfWeek = (idx: number) => {
    setFormDaysOfWeek((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ============================================================== */}
      {/* 1. HEADER WITH CLOUD STATUS & ACTIONS                          */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Schedule & Timetable
            </h1>
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
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Seamlessly harmonize academic lectures, exams, assignment deadlines, and varsity workouts.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View mode toggle: Daily vs Weekly */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily Timetable
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Timetable
            </button>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenAddModal()}
          >
            Add Schedule Item
          </Button>
        </div>
      </div>

      {/* Firestore Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-rose-200">Firestore Schedule Error</p>
            <p className="text-slate-300 text-xs truncate">{error}</p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. REAL-TIME CURRENT CLASS & NEXT CLASS COUNTDOWN BANNERS       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CURRENTLY ACTIVE CLASS BANNER */}
        {currentActiveEvent ? (
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/40 shadow-lg shadow-emerald-950/20">
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-emerald-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              Live Right Now
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                    {currentActiveEvent.courseCode || currentActiveEvent.type}
                  </span>
                  <span className="text-xs text-emerald-200/80 font-medium">
                    {currentActiveEvent.startTime} – {currentActiveEvent.endTime}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  {currentActiveEvent.title}
                </h3>

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                  {currentActiveEvent.location && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {currentActiveEvent.location}
                    </span>
                  )}
                  {currentActiveEvent.instructor && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      {currentActiveEvent.instructor}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <GlassCard className="p-5 flex items-center justify-between border-dashed border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Session Status
                </p>
                <p className="text-sm font-medium text-slate-200 mt-0.5">
                  No lecture or training session active right now
                </p>
              </div>
            </div>
            <Badge variant="default" size="sm">Free Study / Rest</Badge>
          </GlassCard>
        )}

        {/* NEXT CLASS WITH SMOOTH COUNTDOWN ANIMATION */}
        {nextUpcomingClass?.event ? (
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent border border-blue-500/40 shadow-lg shadow-blue-950/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                      Upcoming Next
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {nextUpcomingClass.event.courseCode || nextUpcomingClass.event.type}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                    {nextUpcomingClass.event.title}
                  </h3>

                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {nextUpcomingClass.event.startTime} – {nextUpcomingClass.event.endTime}
                    </span>
                    {nextUpcomingClass.event.location && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {nextUpcomingClass.event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown counter badge */}
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-xs font-mono font-bold tracking-tight">
                    {nextUpcomingClass.minutesUntil < 9999 ? (
                      `Starts in ${nextUpcomingClass.startsInFormatted}`
                    ) : (
                      nextUpcomingClass.startsInFormatted
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {nextUpcomingClass.event.date === todayStr ? 'Today' : nextUpcomingClass.event.date}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <GlassCard className="p-5 flex items-center justify-between border-dashed border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Upcoming Class
                </p>
                <p className="text-sm font-medium text-slate-200 mt-0.5">
                  All scheduled lectures completed for today
                </p>
              </div>
            </div>
            <Badge variant="emerald" size="sm">Schedule Clear</Badge>
          </GlassCard>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. CALENDAR NAVIGATOR & FILTERS BAR                            */}
      {/* ============================================================== */}
      <GlassCard className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>

            <span className="text-sm sm:text-base font-bold text-white ml-2">
              {viewMode === 'weekly'
                ? `Week of ${weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes, rooms, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              typeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            All Items
          </button>
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                typeFilter === type
                  ? `${TYPE_COLORS[type].bg} ${TYPE_COLORS[type].text} border ${TYPE_COLORS[type].border}`
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              <span>{type}s</span>
            </button>
          ))}

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Category Filter Chips */}
          <span className="text-slate-400 font-medium shrink-0">Category:</span>
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              categoryFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                categoryFilter === cat
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ============================================================== */}
      {/* 4. TIMETABLE VIEWS (WEEKLY CALENDAR vs DAILY TIMELINE)          */}
      {/* ============================================================== */}
      {viewMode === 'weekly' ? (
        /* WEEKLY CALENDAR VIEW */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((dayObj) => {
            const dayEvents = weeklyMap.get(dayObj.dateStr) || [];
            return (
              <div
                key={dayObj.dateStr}
                className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden min-h-[360px] ${
                  dayObj.isToday
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/30'
                    : dayObj.isSelected
                    ? 'bg-white/[0.04] border-white/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                }`}
              >
                {/* Day Header */}
                <div
                  onClick={() => {
                    setSelectedDate(dayObj.date);
                  }}
                  className={`p-3 border-b flex items-center justify-between cursor-pointer ${
                    dayObj.isToday
                      ? 'bg-blue-600/15 border-blue-500/30'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {dayObj.dayName}
                    </span>
                    <span
                      className={`text-lg font-extrabold block leading-tight ${
                        dayObj.isToday ? 'text-blue-400' : 'text-white'
                      }`}
                    >
                      {dayObj.dayNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {dayObj.isToday && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500 text-[9px] font-bold text-slate-950 uppercase">
                        Today
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(dayObj.dateStr);
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Add item to this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day Events Stack */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                  {dayEvents.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-[11px] text-slate-500">No events</span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(dayObj.dateStr)}
                        className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add item
                      </button>
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const isCurrent = currentActiveEvent?.id === ev.id;
                      const typeConfig = TYPE_COLORS[ev.type] || TYPE_COLORS.Class;

                      return (
                        <div
                          key={ev.id}
                          className={`p-2.5 rounded-xl border transition-all relative group cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                              : `${typeConfig.bg} ${typeConfig.border} hover:scale-[1.02]`
                          }`}
                          style={{ borderLeftColor: ev.color, borderLeftWidth: '3px' }}
                          onClick={() => handleOpenEditModal(ev)}
                        >
                          {/* Active pulsing dot */}
                          {isCurrent && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{ev.startTime}</span>
                          </div>

                          <h4 className="text-xs font-bold text-white mt-1 leading-snug truncate">
                            {ev.title}
                          </h4>

                          {ev.courseCode && (
                            <span className="text-[10px] font-mono text-slate-300 block mt-0.5">
                              {ev.courseCode}
                            </span>
                          )}

                          {ev.location && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          )}

                          {/* Quick action buttons on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 mt-2 pt-1.5 border-t border-white/10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReschedule(ev);
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white text-[10px]"
                              title="Reschedule / Move"
                            >
                              Move
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(ev.id);
                              }}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DAILY TIMETABLE VIEW */
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Daily Timeline Schedule
              </h3>
              <p className="text-xs text-slate-400">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {dailyEvents.length} items scheduled
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => handleOpenAddModal(selectedDateStr)}
            >
              Add Item for Today
            </Button>
          </div>

          {dailyEvents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No items scheduled for this day</p>
              <p className="text-xs text-slate-500">
                Click "Add Item" to add lectures, exams, training sessions, or reminders.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenAddModal(selectedDateStr)}
              >
                Add First Schedule Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
              {dailyEvents.map((ev) => {
                const isCurrent = currentActiveEvent?.id === ev.id;
                const typeConfig = TYPE_COLORS[ev.type] || TYPE_COLORS.Class;

                return (
                  <div
                    key={ev.id}
                    className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                        : `${typeConfig.bg} ${typeConfig.border} hover:bg-white/[0.06]`
                    }`}
                  >
                    {/* Time indicator pill */}
                    <div className="w-24 shrink-0 text-right">
                      <span className="text-xs font-mono font-bold text-white block">
                        {ev.startTime}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {ev.endTime}
                      </span>
                      {isCurrent && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-bold text-slate-950 uppercase animate-pulse">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Timeline Node */}
                    <div
                      className="w-4 h-4 rounded-full border-2 border-slate-950 shrink-0 mt-1"
                      style={{ backgroundColor: ev.color || '#3B82F6' }}
                    />

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={typeConfig.badge} size="sm">
                          {ev.type}
                        </Badge>
                        {ev.courseCode && (
                          <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-2 py-0.5 rounded">
                            {ev.courseCode}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {ev.category}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                        {ev.title}
                      </h4>

                      {ev.notes && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {ev.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                        {ev.location && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {ev.location}
                          </span>
                        )}
                        {ev.instructor && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {ev.instructor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 self-start shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(ev)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-medium"
                        title="Reschedule / Move"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ev)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(ev.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      )}

      {/* ============================================================== */}
      {/* 5. ADD / EDIT MODAL                                             */}
      {/* ============================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? 'Edit Schedule Item' : 'Add Schedule Item'}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <Input
            label="Title *"
            placeholder="e.g. CS 329D Lecture, Physiology Midterm, Squat Session"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Item Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Item Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ScheduleItemType)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ScheduleCategory)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course / Module Code"
              placeholder="e.g. CS 329D"
              value={formCourseCode}
              onChange={(e) => setFormCourseCode(e.target.value)}
            />
            <Input
              label="Location or Room"
              placeholder="e.g. Packard 101, Campus Gym"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Date *"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
            <Input
              label="Start Time *"
              placeholder="10:00 AM"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time *"
              placeholder="11:15 AM"
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
              required
            />
          </div>

          {/* Recurring Days of Week for Classes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Recurring Days (Weekly Timetable)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = formDaysOfWeek.includes(d.index);
                return (
                  <button
                    key={d.index}
                    type="button"
                    onClick={() => toggleDayOfWeek(d.index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Instructor / Coach"
            placeholder="e.g. Prof. J. Henderson"
            value={formInstructor}
            onChange={(e) => setFormInstructor(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Color Tag
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setFormColor(col.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                    formColor === col.value ? 'border-white scale-110' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: col.value }}
                >
                  {formColor === col.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes & Reminders
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Preparation notes, required textbooks, workout reps..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingEventId ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 6. QUICK RESCHEDULE / MOVE MODAL                               */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule / Move Item"
      >
        {rescheduleTarget && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Move <span className="font-bold text-white">"{rescheduleTarget.title}"</span> to a new date or starting time:
            </p>

            <Input
              label="New Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              required
            />

            <Input
              label="New Start Time"
              placeholder="e.g. 02:00 PM"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => setRescheduleTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveReschedule}>
                Save Rescheduled Time
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================== */}
      {/* 7. DELETE CONFIRMATION MODAL                                   */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Schedule Item"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove this item from your timetable? This will permanently delete it from Cloud Firestore.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-rose-600 hover:bg-rose-500"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
