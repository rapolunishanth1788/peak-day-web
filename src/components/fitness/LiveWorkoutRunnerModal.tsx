import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Volume2,
  Dumbbell,
  Timer,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Flame,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { LoggedWorkout } from '../../types/fitness';
import { TrophyPRGraphic } from './Subtle3DFitnessGraphics';

interface LiveWorkoutRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveWorkoutRunnerModal: React.FC<LiveWorkoutRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeWorkout,
    activeWorkoutDuration,
    restTimer,
    updateActiveSet,
    toggleActiveSetComplete,
    addActiveSet,
    removeActiveSet,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    pauseRestTimer,
    resumeRestTimer,
    adjustRestTimer,
    stopRestTimer,
    finishActiveWorkout,
    cancelActiveWorkout,
  } = useFitness();

  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number>(0);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [rpeRating, setRpeRating] = useState<number>(8);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState<LoggedWorkout | null>(null);

  if (!isOpen || !activeWorkout) return null;

  // Format active workout timer (HH:MM:SS or MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format rest countdown seconds
  const formatRestSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Compute live active session statistics
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let liveVolume = 0;

  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        liveVolume += (s.actualWeight || s.targetWeight || 0) * (s.actualReps || s.targetReps || 0);
      }
    });
  });

  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  const handleFinish = async () => {
    const summary = await finishActiveWorkout(rpeRating, workoutNotes);
    if (summary) {
      setCompletedWorkoutSummary(summary);
    } else {
      onClose();
    }
  };

  const handleDismissSummary = () => {
    setCompletedWorkoutSummary(null);
    setIsFinishing(false);
    onClose();
  };

  const filteredExercisesToAdd = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchExerciseQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || ex.primaryMuscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Celebration Modal when workout finishes */}
      {completedWorkoutSummary ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative"
        >
          <div className="flex justify-center">
            <TrophyPRGraphic size={80} />
          </div>

          <div>
            <Badge variant="emerald" size="md" className="mx-auto mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Workout Crushed!
            </Badge>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {completedWorkoutSummary.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Logged to Peak Day Athletic Vault • {completedWorkoutSummary.durationMinutes} Minutes Active
            </p>
          </div>

          {/* Key accomplishment cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Total Volume</p>
              <p className="text-lg font-bold text-white mt-1">
                {completedWorkoutSummary.totalVolume.toLocaleString()}{' '}
                <span className="text-xs text-slate-400">lbs</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Sets Completed</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {completedWorkoutSummary.totalSets}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Intensity (RPE)</p>
              <p className="text-lg font-bold text-amber-400 mt-1">
                {completedWorkoutSummary.rpe || 8}/10
              </p>
            </div>
          </div>

          {/* Newly Unlocked PRs */}
          {completedWorkoutSummary.personalRecordsAchieved &&
            completedWorkoutSummary.personalRecordsAchieved.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/40 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">
                    New Personal Record{completedWorkoutSummary.personalRecordsAchieved.length > 1 ? 's' : ''} Achieved!
                  </span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {completedWorkoutSummary.personalRecordsAchieved.map((pr, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-200">
                      <span className="font-semibold">{pr.exerciseName}</span>
                      <span className="text-amber-300 font-bold">
                        {pr.weight} lbs × {pr.reps} reps (1RM: {pr.estimated1RM} lbs)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <Button
            variant="accent-emerald"
            size="lg"
            className="w-full justify-center"
            onClick={handleDismissSummary}
          >
            Continue to Fitness OS
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      ) : isFinishing ? (
        /* Finish Workout Confirmation Modal */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white">Complete Workout</h3>
              <p className="text-sm text-slate-400">
                Review your session stats and finalize your training log.
              </p>
            </div>
            <button
              onClick={() => setIsFinishing(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-base font-bold text-white mt-1">
                {formatTimer(activeWorkoutDuration)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Volume</p>
              <p className="text-base font-bold text-emerald-400 mt-1">
                {liveVolume.toLocaleString()} lbs
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <p className="text-xs text-slate-400">Sets Done</p>
              <p className="text-base font-bold text-blue-400 mt-1">
                {completedSetsCount} / {totalSetsCount}
              </p>
            </div>
          </div>

          {/* RPE Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium">Session RPE (Effort 1-10)</span>
              <span className="text-amber-400 font-bold">{rpeRating} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={rpeRating}
              onChange={(e) => setRpeRating(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1 (Very Light)</span>
              <span>5 (Moderate)</span>
              <span>8 (Challenging)</span>
              <span>10 (Maximal)</span>
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Coaching / Journal Notes</label>
            <textarea
              rows={3}
              placeholder="How did the lifts feel? Any fatigue, soreness, or technique cues?"
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-white/[0.08] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setIsFinishing(false)}
            >
              Resume Workout
            </Button>
            <Button
              variant="accent-emerald"
              size="md"
              className="flex-1 justify-center"
              onClick={handleFinish}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save & Log Session
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Main Active Workout View */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-slate-900/95 border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-slate-900/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white truncate">{activeWorkout.title}</h2>
                  <Badge variant="emerald" size="sm">LIVE</Badge>
                </div>
                <p className="text-xs text-slate-400">{activeWorkout.category}</p>
              </div>
            </div>

            {/* Live Timer and Quick Controls */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-base sm:text-lg font-bold">
                  <Timer className="w-4 h-4 animate-pulse" />
                  {formatTimer(activeWorkoutDuration)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {completedSetsCount}/{totalSetsCount} Sets • {liveVolume.toLocaleString()} lbs
                </div>
              </div>

              <Button
                variant="accent-emerald"
                size="sm"
                onClick={() => setIsFinishing(true)}
              >
                Finish
              </Button>

              <button
                onClick={onClose}
                title="Minimize workout dock"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1">
            <div
              className="bg-emerald-500 h-1 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Rest Timer Floating Banner when active */}
          {restTimer.isActive && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-blue-950/70 border-b border-blue-500/30 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span className="text-slate-300 font-medium">
                  Rest Timer {restTimer.exerciseName ? `(${restTimer.exerciseName})` : ''}:
                </span>
                <span className="font-mono text-blue-300 font-bold text-base">
                  {formatRestSeconds(restTimer.secondsRemaining)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustRestTimer(-15)}
                  className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 hover:text-white text-xs"
                >
                  -15s
                </button>
                <button
                  onClick={() => adjustRestTimer(30)}
                  className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 hover:text-white text-xs"
                >
                  +30s
                </button>
                <button
                  onClick={restTimer.isActive ? pauseRestTimer : resumeRestTimer}
                  className="p-1 rounded bg-white/[0.08] text-white hover:bg-white/[0.15]"
                >
                  {restTimer.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={stopRestTimer}
                  className="px-2 py-0.5 rounded bg-white/[0.06] text-rose-400 hover:text-rose-300 text-xs"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Exercise List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeWorkout.exercises.map((exercise, exIdx) => {
              const isExpanded = expandedExerciseIndex === exIdx;
              const completedCount = exercise.sets.filter((s) => s.completed).length;

              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl border transition-all ${
                    exercise.completed
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : 'bg-white/[0.02] border-white/[0.08]'
                  }`}
                >
                  {/* Exercise Header */}
                  <div
                    onClick={() => setExpandedExerciseIndex(isExpanded ? -1 : exIdx)}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-slate-300">
                        {exIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {exercise.exerciseName}
                          </h4>
                          {exercise.completed && (
                            <Badge variant="emerald" size="sm">
                              Done
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {exercise.primaryMuscle} • {exercise.equipment} •{' '}
                          <span className="text-emerald-400">
                            {completedCount}/{exercise.sets.length} Sets Completed
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExerciseFromActiveWorkout(exIdx);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Sets Table */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-3">
                      {exercise.notes && (
                        <p className="text-xs text-slate-400 italic bg-white/[0.02] p-2 rounded-lg">
                          Tip: {exercise.notes}
                        </p>
                      )}

                      {/* Sets Headers */}
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-4 text-center">Target (Lbs × Reps)</div>
                        <div className="col-span-4 text-center">Actual (Lbs × Reps)</div>
                        <div className="col-span-2 text-center">Status</div>
                      </div>

                      {/* Set Rows */}
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                          <div
                            key={set.id}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${
                              set.completed
                                ? 'bg-emerald-950/30 border border-emerald-500/30'
                                : 'bg-white/[0.03] border border-white/[0.04]'
                            }`}
                          >
                            {/* Set Number */}
                            <div className="col-span-2 text-center">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  set.isWarmup
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-white/[0.06] text-slate-300'
                                }`}
                              >
                                {set.isWarmup ? 'W' : set.setNumber}
                              </span>
                            </div>

                            {/* Target Preview */}
                            <div className="col-span-4 text-center text-xs text-slate-400">
                              {set.targetWeight} lbs × {set.targetReps}
                            </div>

                            {/* Actual Inputs */}
                            <div className="col-span-4 flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="1500"
                                value={set.actualWeight ?? set.targetWeight}
                                onChange={(e) =>
                                  updateActiveSet(exIdx, setIdx, {
                                    actualWeight: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-14 sm:w-16 bg-slate-800 border border-white/[0.1] rounded-lg px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                                placeholder="lbs"
                              />
                              <span className="text-slate-500 text-xs">×</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={set.actualReps ?? set.targetReps}
                                onChange={(e) =>
                                  updateActiveSet(exIdx, setIdx, {
                                    actualReps: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className="w-12 sm:w-14 bg-slate-800 border border-white/[0.1] rounded-lg px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                                placeholder="reps"
                              />
                            </div>

                            {/* Toggle Complete Button */}
                            <div className="col-span-2 flex items-center justify-center gap-1">
                              <button
                                onClick={() => toggleActiveSetComplete(exIdx, setIdx)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  set.completed
                                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                    : 'bg-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.15]'
                                }`}
                                title={set.completed ? 'Mark incomplete' : 'Complete set'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              {exercise.sets.length > 1 && (
                                <button
                                  onClick={() => removeActiveSet(exIdx, setIdx)}
                                  className="text-slate-600 hover:text-rose-400 p-1"
                                  title="Delete set"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Set Button */}
                      <button
                        onClick={() => addActiveSet(exIdx)}
                        className="w-full py-2 rounded-xl border border-dashed border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white hover:border-emerald-500/50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Set
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Exercise Trigger */}
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/[0.15] hover:border-emerald-500/60 bg-white/[0.02] text-sm font-semibold text-slate-300 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Exercise to Workout
            </button>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-white/[0.08] bg-slate-900/90 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Cancel and discard this active workout session?')) {
                  cancelActiveWorkout();
                  onClose();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Cancel Workout
            </button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                Minimize
              </Button>
              <Button
                variant="accent-emerald"
                size="sm"
                onClick={() => setIsFinishing(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Finish Workout
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Exercise Modal Sub-dialog */}
      <AnimatePresence>
        {isAddExerciseModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/[0.15] rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Select Exercise</h3>
                <button
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search and muscle filter chips */}
              <input
                type="text"
                placeholder="Search exercises by name or muscle..."
                value={searchExerciseQuery}
                onChange={(e) => setSearchExerciseQuery(e.target.value)}
                className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Cardio'].map(
                  (m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMuscleFilter(m)}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                        selectedMuscleFilter === m
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-white/[0.05] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredExercisesToAdd.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      addExerciseToActiveWorkout(ex.id);
                      setIsAddExerciseModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {ex.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {ex.primaryMuscle} • {ex.equipment} • {ex.category}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" className="pointer-events-none text-xs">
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
