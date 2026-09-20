import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Trash2,
  Award,
  Sparkles,
  Plus,
  X,
  Flame,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoggedWorkout, MuscleGroup } from '../../types/fitness';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

export const WorkoutHistoryView: React.FC = () => {
  const { loggedWorkouts, deleteLoggedWorkout, logDirectWorkout } = useFitness();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days'>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Log Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('Push / Pull / Legs');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualDuration, setManualDuration] = useState(50);
  const [manualVolume, setManualVolume] = useState(12000);
  const [manualSets, setManualSets] = useState(15);
  const [manualRpe, setManualRpe] = useState(8);
  const [manualNotes, setManualNotes] = useState('');

  const now = new Date();
  const filteredLogs = loggedWorkouts.filter((w) => {
    if (timeFilter === 'all') return true;
    const wDate = new Date(w.date);
    const diffDays = (now.getTime() - wDate.getTime()) / (1000 * 3600 * 24);
    if (timeFilter === '7days') return diffDays <= 7;
    if (timeFilter === '30days') return diffDays <= 30;
    return true;
  });

  const handleSaveManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle) return;

    await logDirectWorkout({
      title: manualTitle,
      category: manualCategory,
      date: manualDate,
      startTime: `${manualDate}T10:00:00.000Z`,
      endTime: `${manualDate}T11:00:00.000Z`,
      durationMinutes: manualDuration,
      totalVolume: manualVolume,
      totalSets: manualSets,
      totalReps: manualSets * 10,
      muscleGroups: ['Chest', 'Shoulders'] as MuscleGroup[],
      rpe: manualRpe,
      notes: manualNotes,
      completed: true,
      exercises: [],
    });

    setIsManualModalOpen(false);
    setManualTitle('');
    setManualNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Workout History & Training Logs
          </h2>
          <p className="text-sm text-slate-400">
            Chronological record of completed sessions, volume loads & personal records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time filter */}
          <div className="flex bg-slate-900 border border-white/[0.08] rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeFilter === 'all' ? 'bg-white/[0.1] text-white font-bold' : 'text-slate-400'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeFilter === '30days' ? 'bg-white/[0.1] text-white font-bold' : 'text-slate-400'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeFilter === '7days' ? 'bg-white/[0.1] text-white font-bold' : 'text-slate-400'
              }`}
            >
              Past 7 Days
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Log Past Session
          </Button>
        </div>
      </div>

      {/* History List */}
      {filteredLogs.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-base font-bold text-white">No workouts recorded for this timeframe</p>
          <p className="text-xs text-slate-400">Complete an active workout or log a past session to populate history.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <GlassCard
                key={log.id}
                className="p-5 space-y-4 hover:border-white/[0.15] transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" size="sm">{log.category}</Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {log.date}
                      </span>
                      {log.rpe && (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          RPE {log.rpe}/10
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{log.title}</h3>
                  </div>

                  {/* Summary Pills */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">
                        {log.totalVolume.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-slate-400">lbs volume</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {log.totalSets} sets • {log.durationMinutes} min active
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete workout log "${log.title}"?`)) {
                          deleteLoggedWorkout(log.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.05]"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PR Tags if any */}
                {log.personalRecordsAchieved && log.personalRecordsAchieved.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-300">PR Achieved:</span>
                    {log.personalRecordsAchieved.map((pr, i) => (
                      <span
                        key={i}
                        className="text-xs text-white font-medium bg-black/40 px-2 py-0.5 rounded border border-amber-400/30"
                      >
                        {pr.exerciseName}: {pr.weight} lbs × {pr.reps} reps (1RM: {pr.estimated1RM} lbs)
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <p className="text-xs text-slate-300 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                    "{log.notes}"
                  </p>
                )}

                {/* Exercises Preview or Expand */}
                {log.exercises && log.exercises.length > 0 && (
                  <div>
                    {isExpanded ? (
                      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Exercise Performance Breakdown:
                        </p>
                        {log.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2 text-xs"
                          >
                            <div className="flex justify-between items-center font-bold text-white">
                              <span>
                                {exIdx + 1}. {ex.exerciseName}
                              </span>
                              <span className="text-slate-400">
                                {ex.primaryMuscle} • {ex.equipment}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                              {ex.sets.map((s) => (
                                <div
                                  key={s.id}
                                  className="p-2 rounded bg-black/30 border border-white/[0.05] text-[11px]"
                                >
                                  <span className="text-slate-400">Set {s.setNumber}: </span>
                                  <span className="text-white font-semibold">
                                    {s.actualWeight ?? s.targetWeight} lbs ×{' '}
                                    {s.actualReps ?? s.targetReps} reps
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {log.exercises.map((ex, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs text-slate-300 font-medium"
                          >
                            {ex.exerciseName} ({ex.sets.length} sets)
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Collapse Details <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View Sets & Reps <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Manual Past Workout Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/[0.12] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Log Past Workout</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Workout Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Deadlift & Back Focus"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category / Split</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="Push / Pull / Legs">Push / Pull / Legs</option>
                    <option value="Upper / Lower Split">Upper / Lower Split</option>
                    <option value="Full Body Hypertrophy">Full Body Hypertrophy</option>
                    <option value="Strength & Powerlifting">Strength & Powerlifting</option>
                    <option value="Conditioning & Cardio">Conditioning & Cardio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Workout Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duration (min)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(parseInt(e.target.value, 10) || 45)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Volume (lbs)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualVolume}
                    onChange={(e) => setManualVolume(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">RPE (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={manualRpe}
                    onChange={(e) => setManualRpe(parseFloat(e.target.value) || 8)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes / Comments</label>
                <textarea
                  rows={2}
                  placeholder="Personal records, cues, training partners..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent-emerald"
                  size="md"
                  className="flex-1"
                  type="submit"
                >
                  Save Training Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
