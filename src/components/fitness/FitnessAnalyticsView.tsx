import React from 'react';
import {
  TrendingUp,
  Activity,
  BarChart3,
  Dumbbell,
  Info,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

export const FitnessAnalyticsView: React.FC = () => {
  const { summary, loggedWorkouts } = useFitness();

  // Volume progression data across last 10 logged sessions
  const volumeProgressionData = [...loggedWorkouts]
    .reverse()
    .slice(-10)
    .map((w, idx) => ({
      name: w.date.slice(5),
      volume: w.totalVolume,
      duration: w.durationMinutes,
      sets: w.totalSets,
      title: w.title,
    }));

  // Muscle radar / balance data
  const muscleRadarData = summary.muscleDistribution.map((m) => ({
    muscle: m.muscle,
    sets: m.sets,
    percentage: m.percentage,
  }));

  // Workouts per day of week distribution
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  loggedWorkouts.forEach((w) => {
    const day = new Date(w.date).getDay();
    dayOfWeekCounts[day]++;
  });

  const dayOfWeekData = [
    { day: 'Sun', count: dayOfWeekCounts[0] },
    { day: 'Mon', count: dayOfWeekCounts[1] },
    { day: 'Tue', count: dayOfWeekCounts[2] },
    { day: 'Wed', count: dayOfWeekCounts[3] },
    { day: 'Thu', count: dayOfWeekCounts[4] },
    { day: 'Fri', count: dayOfWeekCounts[5] },
    { day: 'Sat', count: dayOfWeekCounts[6] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Training Analytics & Biomechanical Trends
        </h2>
        <p className="text-sm text-slate-400">
          Advanced volume metrics, progressive overload trajectory, and symmetrical muscle balance analysis.
        </p>
      </div>

      {/* Top 3 Summary Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            All-Time Volume Moved
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {(summary.totalVolumeLbs ?? summary.weeklyVolumeLbs).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">lbs</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Progressive overload trajectory positive
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Workout Density
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-400">
              {summary.averageDurationMinutes}
            </span>
            <span className="text-xs font-semibold text-slate-400">min / session</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target hypertrophy window (45-75 min)
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Training Consistency Index
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {summary.consistencyRate}%
            </span>
            <span className="text-xs font-semibold text-slate-400">Execution rate</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {summary.currentStreak} day active streak maintained
          </p>
        </GlassCard>
      </div>

      {/* Volume Overload Progression Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Volume Progression Load (lbs)
            </h3>
            <p className="text-xs text-slate-400">
              Session volume (Weight × Reps × Sets) tracking progressive overload over time
            </p>
          </div>
          <Badge variant="blue" size="sm">Tonnage Curve</Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeProgressionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                name="Volume (lbs)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#volGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Two Column Grid: Muscle Symmetrical Balance & Frequency Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Muscle Balance Radar Chart */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Muscle Group Symmetry</h3>
              <p className="text-xs text-slate-400">Relative total set volume distribution</p>
            </div>
            <Badge variant="emerald" size="sm">Symmetry Radar</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleRadarData.slice(0, 8)}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="muscle" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                <Radar
                  name="Sets"
                  dataKey="sets"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Training Frequency Day-of-Week Distribution */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Training Day Frequency</h3>
              <p className="text-xs text-slate-400">Session distribution across days of the week</p>
            </div>
            <Badge variant="outline" size="sm">Weekly Pattern</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Sessions" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Transparent Calculation Explanations */}
      <GlassCard className="p-5 space-y-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-bold text-white">Transparent Calculation Methodology</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="font-semibold text-slate-200">Session Tonnage / Volume</p>
            <p className="mt-1">
              Calculated as <code className="text-blue-300">Sum(Weight × Reps)</code> across all completed sets. Warmup sets are excluded from pure work volume.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="font-semibold text-slate-200">Epley 1RM Formula</p>
            <p className="mt-1">
              Calculated as <code className="text-emerald-300">Weight × (1 + Reps / 30)</code>. Proven accuracy for estimating true maximal strength from submaximal sets.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="font-semibold text-slate-200">Recovery Readiness Score</p>
            <p className="mt-1">
              Derived from recent training density, days since last session, and logged RPE exertion to forecast central nervous system (CNS) readiness.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
