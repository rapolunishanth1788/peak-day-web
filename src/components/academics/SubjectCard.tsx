import React from 'react';
import {
  BookOpen,
  User,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Subject, SubjectCalculation } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface SubjectCardProps {
  subject: Subject;
  calculation: SubjectCalculation;
  onOpenDetails: (subject: Subject) => void;
  onOpenMarksEntry: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onLogAttendance: (subjectId: string, type: 'present' | 'absent') => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  calculation,
  onOpenDetails,
  onOpenMarksEntry,
  onEdit,
  onDelete,
  onLogAttendance,
}) => {
  const isAttentionNeeded = calculation.status === 'needs_attention';
  const isAttendanceShortage = calculation.attendanceStatus === 'critical';

  return (
    <GlassCard
      className={`p-5 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] relative overflow-hidden group ${
        isAttentionNeeded
          ? 'border-rose-500/40 bg-rose-500/[0.02]'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
      style={{ borderTopColor: subject.color || '#3B82F6', borderTopWidth: '4px' }}
    >
      <div>
        {/* Card Header: Code, Credits & Letter Grade */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: `${subject.color || '#3B82F6'}33`, borderColor: subject.color || '#3B82F6' }}
            >
              {subject.code}
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              {subject.credits} {subject.credits === 1 ? 'Credit' : 'Credits'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold flex items-center gap-1 border ${
                calculation.currentPercentage >= 85
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : calculation.currentPercentage >= 70
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>{calculation.gradeLetter}</span>
              <span className="opacity-70 text-[10px]">({calculation.currentPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Subject Title */}
        <h3
          onClick={() => onOpenDetails(subject)}
          className="text-base font-bold text-white hover:text-blue-300 transition-colors cursor-pointer leading-snug"
        >
          {subject.name}
        </h3>

        {/* Faculty Name */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{subject.facultyName || 'Faculty Instructor'}</span>
        </p>

        {/* Target Progress Bar */}
        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <span>Target: {subject.targetMarks}%</span>
              {calculation.trajectory === 'up' && (
                <span className="text-emerald-400 text-[10px] flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> Trend Up
                </span>
              )}
              {calculation.trajectory === 'down' && (
                <span className="text-rose-400 text-[10px] flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> Trend Down
                </span>
              )}
            </span>
            <span
              className={`font-mono font-bold ${
                calculation.targetGap >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {calculation.targetGap >= 0 ? `+${calculation.targetGap}% Ahead` : `${calculation.targetGap}% to Target`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            {/* Target benchmark pin */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-70"
              style={{ left: `${Math.min(100, Math.max(0, subject.targetMarks))}%` }}
              title={`Target: ${subject.targetMarks}%`}
            />
            {/* Current progress fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calculation.currentPercentage >= subject.targetMarks
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, calculation.currentPercentage))}%` }}
            />
          </div>
        </div>

        {/* Assessment Component Score Chips */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Mid 1</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {subject.mid1Marks?.evaluated ? `${subject.mid1Marks.scored}/${subject.mid1Marks.max}` : 'Pending'}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Mid 2</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {subject.mid2Marks?.evaluated ? `${subject.mid2Marks.scored}/${subject.mid2Marks.max}` : 'Pending'}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Final</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {subject.semesterMarks?.evaluated ? `${subject.semesterMarks.scored}/${subject.semesterMarks.max}` : 'Pending'}
            </span>
          </div>
        </div>

        {/* Attendance Banner & Quick Counter */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Attendance:</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isAttendanceShortage
                    ? 'text-rose-400'
                    : calculation.attendanceStatus === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {calculation.attendancePercentage}%
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({subject.attendance?.attended || 0}/{subject.attendance?.total || 0})
              </span>
            </div>

            {isAttendanceShortage ? (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 font-medium">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Attend next {calculation.classesNeededForThreshold} classes!
              </span>
            ) : calculation.bunksAvailable > 0 ? (
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {calculation.bunksAvailable} safe {calculation.bunksAvailable === 1 ? 'bunk' : 'bunks'} left
              </span>
            ) : (
              <span className="text-[10px] text-amber-400/90 mt-0.5 block">
                On threshold margin
              </span>
            )}
          </div>

          {/* Quick attendance increment buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onLogAttendance(subject.id, 'present')}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-xs font-medium cursor-pointer"
              title="Attended today (+1)"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onLogAttendance(subject.id, 'absent')}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-xs font-medium cursor-pointer"
              title="Missed today (+1 total missed)"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenMarksEntry(subject)}
          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          <span>Enter Marks</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenDetails(subject)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Detailed Formula & Syllabus"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(subject)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Edit Subject"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(subject)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
