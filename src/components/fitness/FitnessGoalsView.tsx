import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Dumbbell,
  Scale,
  Flame,
  X,
  Edit2,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FitnessGoal, FitnessGoalType } from '../../types/fitness';

export const FitnessGoalsView: React.FC = () => {
  const { goals, addGoal, updateGoalProgress } = useFitness();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FitnessGoalType>('strength');
  const [targetValue, setTargetValue] = useState<number>(315);
  const [currentValue, setCurrentValue] = useState<number>(275);
  const [unit, setUnit] = useState('lbs');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [notes, setNotes] = useState('');

  // Editing current progress state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [quickProgressValue, setQuickProgressValue] = useState<number>(0);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addGoal({
      title,
      type: category,
      category: 'Fitness',
      targetValue,
      currentValue,
      unit,
      deadline: targetDate,
      targetDate,
      completed: currentValue >= targetValue,
      status: currentValue >= targetValue ? 'completed' : 'active',
      notes,
    });

    setIsModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const handleUpdateProgressSubmit = async (goalId: string) => {
    await updateGoalProgress(goalId, quickProgressValue);
    setEditingGoalId(null);
  };

  const categoryIcons: Record<FitnessGoalType, React.ReactNode> = {
    strength: <Dumbbell className="w-4 h-4 text-purple-400" />,
    weight: <Scale className="w-4 h-4 text-blue-400" />,
    muscle_gain: <Sparkles className="w-4 h-4 text-emerald-400" />,
    consistency: <Flame className="w-4 h-4 text-amber-400" />,
    personal_record: <Trophy className="w-4 h-4 text-yellow-400" />,
    exercise_pr: <Trophy className="w-4 h-4 text-yellow-400" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Fitness Objectives & Overload Targets
          </h2>
          <p className="text-sm text-slate-400">
            Set and conquer quantitative milestones across strength, body composition & consistency.
          </p>
        </div>

        <Button
          variant="accent-emerald"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Set New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.round((g.currentValue / g.targetValue) * 100))
          );
          const isAchieved = g.completed || g.status === 'completed' || g.currentValue >= g.targetValue;

          return (
            <GlassCard
              key={g.id}
              className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                isAchieved
                  ? 'border-emerald-500/40 bg-emerald-950/15'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        {categoryIcons[(g.type as FitnessGoalType) || 'strength'] || categoryIcons.strength}
                      </span>
                      <Badge
                        variant={isAchieved ? 'emerald' : 'blue'}
                        size="sm"
                      >
                        {isAchieved ? 'Goal Achieved' : (g.type || g.category || 'Goal').replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {g.title}
                    </h3>
                  </div>

                  <span className="text-xl font-black text-white">
                    {progressPercent}%
                  </span>
                </div>

                {g.notes && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    "{g.notes}"
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">
                      Current:{' '}
                      <span className="text-white font-bold">
                        {g.currentValue} {g.unit}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      Target:{' '}
                      <span className="text-emerald-400 font-bold">
                        {g.targetValue} {g.unit}
                      </span>
                    </span>
                  </div>

                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isAchieved ? 'bg-emerald-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Inline Progress Update */}
                {editingGoalId === g.id ? (
                  <div className="mt-3 p-3 rounded-xl bg-slate-800 border border-white/[0.1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Update current value ({g.unit}):</span>
                      <button
                        onClick={() => setEditingGoalId(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quickProgressValue}
                        onChange={(e) => setQuickProgressValue(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-white/[0.1] rounded-lg px-2.5 py-1 text-sm text-white font-bold"
                      />
                      <Button
                        variant="accent-emerald"
                        size="sm"
                        onClick={() => handleUpdateProgressSubmit(g.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target: {g.deadline || g.targetDate}
                </span>

                <button
                  onClick={() => {
                    setEditingGoalId(g.id);
                    setQuickProgressValue(g.currentValue);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Update Value
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/[0.12] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Create Fitness Objective</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 315 lbs Barbell Bench Press"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FitnessGoalType)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="strength">Strength / Lift Target</option>
                    <option value="muscle_gain">Muscle Hypertrophy</option>
                    <option value="weight">Scale Weight Target</option>
                    <option value="consistency">Consistency / Streak</option>
                    <option value="personal_record">Personal Record (PR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Value</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={currentValue}
                    onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Value</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="lbs, reps, days"
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes & Milestones</label>
                <textarea
                  rows={2}
                  placeholder="Programming strategy, cycle dates, progression rate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent-emerald"
                  size="md"
                  className="flex-1"
                  type="submit"
                >
                  Set Objective
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
