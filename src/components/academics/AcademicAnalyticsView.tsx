import React from 'react';
import { useAcademics } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];

export const AcademicAnalyticsView: React.FC = () => {
  const { subjects, subjectCalculations, summary, gradingConfig } = useAcademics();

  // 1. Data for Subject Performance vs Target
  const performanceVsTargetData = subjects.map((sub) => {
    const calc = subjectCalculations.get(sub.id);
    return {
      name: sub.code,
      fullName: sub.name,
      current: calc?.currentPercentage || 0,
      target: sub.targetMarks || 85,
      attendance: calc?.attendancePercentage || 0,
    };
  });

  // 2. Data for Assessment Breakdown across courses
  const componentBreakdownData = subjects.map((sub) => {
    const m1 = sub.mid1Marks?.max > 0 ? (sub.mid1Marks.scored / sub.mid1Marks.max) * 100 : 0;
    const m2 = sub.mid2Marks?.max > 0 ? (sub.mid2Marks.scored / sub.mid2Marks.max) * 100 : 0;
    const assign = sub.assignmentMarks?.max > 0 ? (sub.assignmentMarks.scored / sub.assignmentMarks.max) * 100 : 0;
    const lab = sub.labMarks?.max > 0 ? (sub.labMarks.scored / sub.labMarks.max) * 100 : 0;

    return {
      subject: sub.code,
      'Midterm 1': Number(m1.toFixed(1)),
      'Midterm 2': Number(m2.toFixed(1)),
      'Assignments': Number(assign.toFixed(1)),
      'Lab Work': Number(lab.toFixed(1)),
    };
  });

  // 3. Credit distribution data for Pie Chart
  const creditPieData = subjects.map((sub, idx) => ({
    name: sub.code,
    fullName: sub.name,
    value: sub.credits,
    color: sub.color || COLORS[idx % COLORS.length],
  }));

  // 4. Custom Dark Mode Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-bold text-white font-mono">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center gap-2">
              <span className="font-medium">{entry.name}:</span>
              <span className="font-mono font-bold">{entry.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Analytics High-Level Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Credit Weighted GPA</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {summary.overallGpa4.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 4.0 scale</span>
          </div>
          <p className="text-xs text-blue-300 mt-2 font-medium">
            Cumulative Average: {summary.creditWeightedPercentage}% across {summary.totalCredits} credits
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Top Performing Subjects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1 mt-1">
            {summary.strongSubjects.length > 0 ? (
              summary.strongSubjects.slice(0, 2).map((sub) => {
                const calc = subjectCalculations.get(sub.id);
                return (
                  <div key={sub.id} className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium truncate max-w-[170px]">{sub.name}</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {calc?.currentPercentage}% ({calc?.gradeLetter})
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Consistent average pacing across all courses.</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Attention Required</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="space-y-1 mt-1">
            {summary.needsAttentionSubjects.length > 0 ? (
              summary.needsAttentionSubjects.slice(0, 2).map((sub) => {
                const calc = subjectCalculations.get(sub.id);
                return (
                  <div key={sub.id} className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium truncate max-w-[170px]">{sub.name}</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {calc?.targetGap}% Gap
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All courses are meeting target thresholds!
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Primary Chart: Performance vs Target Marks */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Current Score vs Goal Target Benchmark</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes actual calculated score vs your target mark for each course.
            </p>
          </div>
          <Badge variant="blue" size="sm">
            {gradingConfig.name}
          </Badge>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceVsTargetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
              />
              <Bar dataKey="current" name="Current Score %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target Mark %" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Secondary Charts: Component Breakdown & Credit Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Performance Breakdown */}
        <GlassCard className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Assessment Performance Across Evaluations</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">100% Normalized</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                />
                <Bar dataKey="Midterm 1" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Midterm 2" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Assignments" fill="#EC4899" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Lab Work" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Credit Weight Distribution Pie */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Credit Allocation</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {summary.totalCredits} Total Credits
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={creditPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {creditPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Credits (${item.payload.fullName})`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#ffffff15',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[11px]">
            {creditPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-mono truncate">{item.name} ({item.value}c)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
