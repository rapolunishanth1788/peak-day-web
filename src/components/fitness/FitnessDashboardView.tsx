import React from 'react';
import {
  Dumbbell,
  Flame,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  HeartPulse,
  Plus,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  TitaniumPlateGraphic,
  HexDumbbellGraphic,
  TrophyPRGraphic,
  FlameStreakGraphic,
} from './Subtle3DFitnessGraphics';

interface FitnessDashboardViewProps {
  onStartQuickWorkout: () => void;
  onOpenWorkoutBuilder: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const FitnessDashboardView: React.FC<FitnessDashboardViewProps> = ({
  onStartQuickWorkout,
  onOpenWorkoutBuilder,
  onNavigateTab,
}) => {
  const { summary, loggedWorkouts, templates, activeWorkout, startWorkout } = useFitness();

  const latestWorkout = loggedWorkouts.length > 0 ? loggedWorkouts[0] : null;

  return (
    <div className="space-y-6">
      {/* Quick Launch & Hero Training Banner */}
      <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-white/[0.08]">
        {/* Subtle decorative 3D background elements */}
        <div className="absolute -right-8 -top-8 opacity-25 pointer-events-none hidden sm:block">
          <TitaniumPlateGraphic size={200} />
        </div>
        <div className="absolute right-40 -bottom-10 opacity-20 pointer-events-none hidden lg:block">
          <HexDumbbellGraphic size={160} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                <Flame className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {summary.currentStreak} Day Training Streak
              </Badge>
              <Badge variant="blue" size="sm">
                <HeartPulse className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Readiness {summary.recoveryReadinessScore}%
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Athletic Operating System
            </h2>
            <p className="text-sm text-slate-300">
              Track multi-set volume, progressive overload, RPE exertion, biometric recovery, and personal records in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeWorkout ? (
              <Button
                variant="accent-emerald"
                size="lg"
                onClick={onStartQuickWorkout}
                className="shadow-lg shadow-emerald-500/20 animate-pulse"
              >
                <Zap className="w-4 h-4 mr-2" />
                Resume Active Workout
              </Button>
            ) : (
              <>
                <Button
                  variant="accent-emerald"
                  size="md"
                  onClick={onStartQuickWorkout}
                  className="shadow-md shadow-emerald-500/15"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onOpenWorkoutBuilder}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Build Routine
                </Button>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 4 Metric Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Weekly Volume */}
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Weekly Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">
                {summary.weeklyVolumeLbs.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold">lbs</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {summary.weeklyWorkoutsCount} sessions logged this week
            </p>
          </div>
        </GlassCard>

        {/* Metric 2: Streak & Consistency */}
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Training Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">
                {summary.currentStreak}
              </span>
              <span className="text-xs text-slate-400 font-semibold">days active</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Best record: {summary.bestStreak} days • Consistency {summary.consistencyRate}%
            </p>
          </div>
        </GlassCard>

        {/* Metric 3: Recovery Readiness */}
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recovery Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400">
                {summary.recoveryReadinessScore}%
              </span>
              <span className="text-xs text-slate-400 font-semibold">Optimal</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Avg session: {summary.averageDurationMinutes} min active duration
            </p>
          </div>
        </GlassCard>

        {/* Metric 4: Personal Records */}
        <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              All-Time PRs
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-purple-300">
                {summary.recentPRs.length}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Milestones</span>
            </div>
            <p className="text-xs text-purple-400 font-medium mt-1">
              {summary.latestWeight ? `Bodyweight: ${summary.latestWeight} lbs` : 'Weights tracked'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Two Column Grid: Muscle Distribution & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Muscle Group Volume Tracker */}
        <GlassCard className="p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Muscle Group Distribution
              </h3>
              <p className="text-xs text-slate-400">Relative volume across body splits</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-blue-400 p-0 hover:bg-transparent"
            >
              Analytics →
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {summary.muscleDistribution.slice(0, 6).map((item) => (
              <div key={item.muscle} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.muscle}
                  </span>
                  <span className="text-slate-400">
                    {item.sets} sets • {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span>Primary Focus</span>
            <span className="font-semibold text-white">Hypertrophy & Strength</span>
          </div>
        </GlassCard>

        {/* Middle/Right Column: Training Routines & Recent PRs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Routines Launcher */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Quick Routine Launcher
                </h3>
                <p className="text-xs text-slate-400">Launch your structured split in one click</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('planner')}
                className="text-xs text-blue-400"
              >
                View All ({templates.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.slice(0, 3).map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] flex flex-col justify-between transition-all group"
                >
                  <div>
                    <Badge variant="blue" size="sm" className="mb-2">
                      {tpl.category}
                    </Badge>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {tpl.exercises.length} Exercises • ~{tpl.estimatedDurationMinutes} min
                    </p>
                  </div>

                  <Button
                    variant="accent-emerald"
                    size="sm"
                    className="w-full mt-3 justify-center text-xs"
                    onClick={() => startWorkout(tpl)}
                  >
                    Start Session
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent PR Hall of Fame & Latest Logged Workout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recent PR Highlight */}
            <GlassCard className="p-5 space-y-3 bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrophyPRGraphic size={32} />
                  <div>
                    <h4 className="text-sm font-bold text-white">Recent Personal Record</h4>
                    <p className="text-[11px] text-amber-400 font-semibold">1RM Overload</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab('prs')}
                  className="text-xs text-amber-400"
                >
                  PRs →
                </Button>
              </div>

              {summary.recentPRs.length > 0 ? (
                <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{summary.recentPRs[0].exerciseName}</span>
                    <span className="font-black text-amber-400 text-sm">
                      {summary.recentPRs[0].weight} lbs × {summary.recentPRs[0].reps}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Est. 1RM: <span className="text-white font-semibold">{summary.recentPRs[0].estimated1RM} lbs</span>
                    {summary.recentPRs[0].previousBestWeight && ` • +${summary.recentPRs[0].weight - summary.recentPRs[0].previousBestWeight} lbs increase`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No PRs recorded yet. Complete your first heavy session!</p>
              )}
            </GlassCard>

            {/* Latest Workout Snapshot */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Last Completed Session</h4>
                    <p className="text-[11px] text-slate-400">{latestWorkout?.date || 'Today'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab('history')}
                  className="text-xs text-emerald-400"
                >
                  Logs →
                </Button>
              </div>

              {latestWorkout ? (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <p className="text-xs font-bold text-white truncate">{latestWorkout.title}</p>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{latestWorkout.durationMinutes} min active</span>
                    <span className="text-emerald-400 font-semibold">{latestWorkout.totalVolume.toLocaleString()} lbs volume</span>
                    <span>RPE {latestWorkout.rpe || 8}/10</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No previous sessions logged yet.</p>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
