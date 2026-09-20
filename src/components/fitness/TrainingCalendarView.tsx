import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Flame,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoggedWorkout } from '../../types/fitness';

export const TrainingCalendarView: React.FC = () => {
  const { loggedWorkouts } = useFitness();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayWorkout, setSelectedDayWorkout] = useState<LoggedWorkout | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Map workouts by ISO date string (YYYY-MM-DD)
  const workoutsByDate: Record<string, LoggedWorkout[]> = {};
  loggedWorkouts.forEach((w) => {
    if (!workoutsByDate[w.date]) {
      workoutsByDate[w.date] = [];
    }
    workoutsByDate[w.date].push(w);
  });

  // Calculate monthly aggregates
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthWorkouts = loggedWorkouts.filter((w) => w.date.startsWith(monthPrefix));
  const totalMonthVolume = thisMonthWorkouts.reduce((acc, w) => acc + w.totalVolume, 0);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Training Calendar & Recovery Periodization
          </h2>
          <p className="text-sm text-slate-400">
            Map training frequency, rest periods, supercompensation cycles & progressive overload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-white px-2">
            {monthNames[month]} {year}
          </span>
          <Button variant="secondary" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Sessions Completed</p>
            <p className="text-2xl font-black text-white mt-0.5">{thisMonthWorkouts.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Monthly Volume</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">
              {totalMonthVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">lbs</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Active Rest Days</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">
              {Math.max(0, daysInMonth - thisMonthWorkouts.length)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-amber-400" />
          </div>
        </GlassCard>
      </div>

      {/* Full Monthly Grid */}
      <GlassCard className="p-5 space-y-4">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-1 border-b border-white/[0.06]">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {blankDays.map((i) => (
            <div key={`blank-${i}`} className="min-h-[85px] sm:min-h-[105px] rounded-xl bg-white/[0.01] opacity-30" />
          ))}

          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayWorkouts = workoutsByDate[dateStr] || [];
            const hasWorkout = dayWorkouts.length > 0;
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  setSelectedDayWorkout(hasWorkout ? dayWorkouts[0] : null);
                }}
                className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isToday
                    ? 'border-blue-500 bg-blue-500/10'
                    : hasWorkout
                    ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500/60'
                    : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                      isToday
                        ? 'bg-blue-500 text-white'
                        : hasWorkout
                        ? 'text-emerald-400 font-black'
                        : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                  {hasWorkout && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  )}
                </div>

                <div className="mt-1 space-y-1">
                  {hasWorkout ? (
                    dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="p-1 rounded bg-slate-900/90 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold truncate"
                      >
                        {w.title}
                        <span className="block text-[9px] text-slate-400 font-normal">
                          {w.totalVolume.toLocaleString()} lbs
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 block text-center mt-3">
                      Rest & Recover
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Selected Day Details Panel */}
      {selectedDateStr && (
        <GlassCard className="p-5 border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Date Details: {selectedDateStr}</h4>
            </div>
            <button
              onClick={() => setSelectedDateStr(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {selectedDayWorkout ? (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="emerald" size="sm" className="mb-1">
                    Completed Session
                  </Badge>
                  <h5 className="text-base font-bold text-white">{selectedDayWorkout.title}</h5>
                  <p className="text-xs text-slate-400">{selectedDayWorkout.category}</p>
                </div>
                <span className="text-sm font-black text-emerald-400">
                  {selectedDayWorkout.totalVolume.toLocaleString()} lbs
                </span>
              </div>

              <div className="flex gap-4 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
                <span>Duration: {selectedDayWorkout.durationMinutes} min</span>
                <span>Sets: {selectedDayWorkout.totalSets}</span>
                <span>RPE: {selectedDayWorkout.rpe || 8}/10</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.02] text-xs text-slate-400 flex items-center justify-between">
              <span>Rest day taken on this date. Cellular repair and muscle protein synthesis active.</span>
              <Badge variant="outline" size="sm">Active Recovery</Badge>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};
