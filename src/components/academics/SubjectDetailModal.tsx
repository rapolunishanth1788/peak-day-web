import React from 'react';
import {
  X,
  BookOpen,
  User,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Calculator,
  Percent,
  Check,
  Edit2,
  FileSpreadsheet,
} from 'lucide-react';
import { Subject, SubjectCalculation, GradingSchemeConfig } from '../../contexts/AcademicContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SubjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  calculation: SubjectCalculation | null;
  gradingConfig: GradingSchemeConfig;
  onOpenMarksEntry: (subject: Subject) => void;
  onEditSubject: (subject: Subject) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  isOpen,
  onClose,
  subject,
  calculation,
  gradingConfig,
  onOpenMarksEntry,
  onEditSubject,
}) => {
  if (!subject || !calculation) return null;

  const isAttendanceShortage = calculation.attendanceStatus === 'critical';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${subject.code} — Detailed Academic Analysis`}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Course Overview Banner */}
        <div
          className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            backgroundColor: `${subject.color || '#3B82F6'}15`,
            borderColor: `${subject.color || '#3B82F6'}40`,
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
                {subject.code}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {subject.credits} {subject.credits === 1 ? 'Credit' : 'Credits'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{subject.name}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{subject.facultyName || 'Faculty Instructor'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Subject Grade</p>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-black font-mono text-white">
                  {calculation.gradeLetter}
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {calculation.currentPercentage}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                GPA {calculation.gpaPoint4.toFixed(1)} / 4.0
              </p>
            </div>
          </div>
        </div>

        {/* 1. TRANSPARENT CALCULATION FORMULA BREAKDOWN */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Calculator className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Grading Calculation Formula
              </h4>
            </div>
            <Badge variant="blue" size="sm">
              {gradingConfig.name}
            </Badge>
          </div>

          {/* Explanation Text */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            <p className="font-semibold text-blue-100 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Formula Explanation:</span>
            </p>
            <p className="mt-1 text-slate-300 leading-relaxed">
              {calculation.calculationFormulaExplanation}
            </p>
          </div>

          {/* Component Contributions Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 font-mono text-[11px]">
                  <th className="pb-2">Assessment</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Raw %</th>
                  <th className="pb-2">Scheme Weight</th>
                  <th className="pb-2 text-right">Weighted Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {calculation.componentDetails.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 font-medium text-white flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isEvaluated ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2 font-mono text-slate-300">{item.statusLabel}</td>
                    <td className="py-2 font-mono text-slate-400">
                      {item.isEvaluated ? `${item.rawPercentage.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2 font-mono text-slate-300">{item.nominalWeight}%</td>
                    <td className="py-2 font-mono font-bold text-right text-emerald-400">
                      {item.isEvaluated ? `+${item.weightedContribution.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ATTENDANCE ANALYTICS & SHORTAGE MITIGATION */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Attendance & Eligibility Tracker</span>
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                isAttendanceShortage
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {calculation.attendancePercentage}% Present
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Attended</span>
              <span className="text-base font-bold text-white font-mono">
                {subject.attendance?.attended || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Conducted</span>
              <span className="text-base font-bold text-white font-mono">
                {subject.attendance?.total || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Required Min</span>
              <span className="text-base font-bold text-slate-300 font-mono">
                {gradingConfig.minAttendanceThreshold}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Status</span>
              <span
                className={`text-sm font-bold font-mono ${
                  isAttendanceShortage ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isAttendanceShortage ? 'Shortage Alert' : 'Eligible'}
              </span>
            </div>
          </div>

          {/* Guidance Callout */}
          {isAttendanceShortage ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Attendance Shortage Alert</p>
                <p className="text-slate-300 mt-0.5">
                  Your current attendance is {calculation.attendancePercentage}%, which is below the mandatory {gradingConfig.minAttendanceThreshold}% threshold. You must attend the next{' '}
                  <span className="font-bold text-white underline">
                    {calculation.classesNeededForThreshold} consecutive classes
                  </span>{' '}
                  without missing to regain eligibility.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Safe Buffer: You can safely miss{' '}
                  <span className="font-bold text-white">{calculation.bunksAvailable}</span> more{' '}
                  {calculation.bunksAvailable === 1 ? 'class' : 'classes'} while maintaining the {gradingConfig.minAttendanceThreshold}% mark.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. NOTES & SYLLABUS HIGHLIGHTS */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Academic Notes & Study Roadmap
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
            {subject.notes || 'No notes added yet for this subject. Click Edit to add course materials, syllabus notes, or faculty office hour details.'}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onEditSubject(subject);
              }}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onOpenMarksEntry(subject);
              }}
            >
              Enter / Update Marks
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
