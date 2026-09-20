import React, { useState } from 'react';
import { useAcademics, Subject } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Filter,
} from 'lucide-react';

export const AttendanceTrackerView: React.FC = () => {
  const { subjects, subjectCalculations, summary, gradingConfig, logAttendance } = useAcademics();
  const [filter, setFilter] = useState<'all' | 'warning' | 'safe'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const threshold = gradingConfig.minAttendanceThreshold || 75;

  const handleLog = async (subjectId: string, type: 'present' | 'absent') => {
    try {
      setIsUpdating(subjectId);
      await logAttendance(subjectId, type);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredSubjects = subjects.filter((sub) => {
    const calc = subjectCalculations.get(sub.id);
    if (!calc) return true;
    if (filter === 'warning') return calc.attendancePercentage < threshold;
    if (filter === 'safe') return calc.attendancePercentage >= threshold;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Attendance Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Overall Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {summary.overallAttendancePercentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({summary.totalClassesAttended}/{summary.totalClassesConducted})
            </span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                summary.overallAttendancePercentage >= threshold ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, summary.overallAttendancePercentage)}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Institutional Threshold</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black font-mono text-white">{threshold}%</span>
          <p className="text-[11px] text-slate-400 mt-1">Minimum mandatory eligibility requirement</p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Shortage Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black font-mono text-amber-400">
            {summary.attendanceWarningSubjects.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.attendanceWarningSubjects.length === 0
              ? 'All courses satisfy eligibility'
              : 'Subjects requiring urgent attendance'}
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Courses Monitored</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black font-mono text-white">{subjects.length}</span>
          <p className="text-[11px] text-slate-400 mt-1">Real-time dynamic bunk calculator</p>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Courses ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'warning'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Needs Attention ({summary.attendanceWarningSubjects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'safe'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe / Eligible ({subjects.length - summary.attendanceWarningSubjects.length})
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Click <span className="text-emerald-400 font-bold">+</span> to log present, or{' '}
          <span className="text-rose-400 font-bold">-</span> to log absent.
        </p>
      </div>

      {/* Subject Attendance Cards List */}
      <div className="space-y-3">
        {filteredSubjects.map((subject) => {
          const calc = subjectCalculations.get(subject.id);
          const attPct = calc ? calc.attendancePercentage : 0;
          const isWarning = attPct < threshold;
          const attended = subject.attendance?.attended || 0;
          const total = subject.attendance?.total || 0;

          return (
            <GlassCard
              key={subject.id}
              className={`p-4 border-l-4 transition-all duration-200 ${
                isWarning
                  ? 'border-l-rose-500 bg-rose-500/[0.02]'
                  : attPct >= 85
                  ? 'border-l-emerald-500'
                  : 'border-l-amber-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Subject Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                      {subject.code}
                    </span>
                    <h4 className="text-sm font-bold text-white">{subject.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Faculty: {subject.facultyName || 'Instructor'} • {subject.credits} Credits
                  </p>
                </div>

                {/* Progress Bar & Stats */}
                <div className="flex-1 max-w-md space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Attendance Rate: <strong className="text-white font-mono">{attPct}%</strong>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {attended} / {total} Classes
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                    {/* Threshold marker pin */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${threshold}%` }}
                      title={`Threshold: ${threshold}%`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning
                          ? 'bg-rose-500'
                          : attPct >= 85
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, attPct)}%` }}
                    />
                  </div>

                  {/* Bunk / Mitigation Advice */}
                  <div className="text-[11px]">
                    {isWarning ? (
                      <span className="text-rose-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Must attend next {calc?.classesNeededForThreshold} classes to reach {threshold}%!
                      </span>
                    ) : (calc?.bunksAvailable || 0) > 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Safe to miss {calc?.bunksAvailable} more{' '}
                        {(calc?.bunksAvailable || 0) === 1 ? 'class' : 'classes'}
                      </span>
                    ) : (
                      <span className="text-amber-400/90">
                        At threshold margin: missing a class will trigger shortage alert.
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleLog(subject.id, 'present')}
                    disabled={isUpdating === subject.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Present (+1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLog(subject.id, 'absent')}
                    disabled={isUpdating === subject.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
