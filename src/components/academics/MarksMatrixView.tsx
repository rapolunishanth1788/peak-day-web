import React, { useState } from 'react';
import { useAcademics, Subject } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MarksEntryModal } from './MarksEntryModal';
import {
  FileSpreadsheet,
  Award,
  Edit2,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
} from 'lucide-react';

export const MarksMatrixView: React.FC = () => {
  const { subjects, subjectCalculations, gradingConfig, updateSubjectMarks } = useAcademics();
  const [activeSubjectForModal, setActiveSubjectForModal] = useState<Subject | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <span>Academic Marks Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of all midterm, semester, assignment, and practical lab marks across your curriculum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="sm">
            Scheme: {gradingConfig.name}
          </Badge>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono text-[11px]">
                <th className="p-3.5 font-semibold">Course</th>
                <th className="p-3.5 font-semibold text-center">
                  Midterm 1 ({gradingConfig.weights.mid1Weight}%)
                </th>
                <th className="p-3.5 font-semibold text-center">
                  Midterm 2 ({gradingConfig.weights.mid2Weight}%)
                </th>
                <th className="p-3.5 font-semibold text-center">
                  Final Exam ({gradingConfig.weights.semesterWeight}%)
                </th>
                <th className="p-3.5 font-semibold text-center">
                  Assignments ({gradingConfig.weights.assignmentWeight}%)
                </th>
                <th className="p-3.5 font-semibold text-center">
                  Lab Work ({gradingConfig.weights.labWeight}%)
                </th>
                <th className="p-3.5 font-semibold text-center">Score %</th>
                <th className="p-3.5 font-semibold text-center">Grade</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {subjects.map((sub) => {
                const calc = subjectCalculations.get(sub.id);
                return (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-xs">{sub.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="text-blue-400">{sub.code}</span> • {sub.credits} Credits
                      </div>
                    </td>

                    {/* Mid 1 */}
                    <td className="p-3.5 text-center font-mono">
                      {sub.mid1Marks?.evaluated ? (
                        <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white">
                          {sub.mid1Marks.scored}/{sub.mid1Marks.max}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    {/* Mid 2 */}
                    <td className="p-3.5 text-center font-mono">
                      {sub.mid2Marks?.evaluated ? (
                        <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white">
                          {sub.mid2Marks.scored}/{sub.mid2Marks.max}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    {/* Semester */}
                    <td className="p-3.5 text-center font-mono">
                      {sub.semesterMarks?.evaluated ? (
                        <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white">
                          {sub.semesterMarks.scored}/{sub.semesterMarks.max}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    {/* Assignments */}
                    <td className="p-3.5 text-center font-mono">
                      {sub.assignmentMarks?.evaluated ? (
                        <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white">
                          {sub.assignmentMarks.scored}/{sub.assignmentMarks.max}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    {/* Labs */}
                    <td className="p-3.5 text-center font-mono">
                      {sub.labMarks?.evaluated ? (
                        <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-white">
                          {sub.labMarks.scored}/{sub.labMarks.max}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    {/* Current Percentage */}
                    <td className="p-3.5 text-center font-mono font-bold text-white">
                      {calc?.currentPercentage}%
                    </td>

                    {/* Letter Grade */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-black ${
                          (calc?.currentPercentage || 0) >= 85
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : (calc?.currentPercentage || 0) >= 70
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {calc?.gradeLetter || '—'}
                      </span>
                    </td>

                    {/* Edit Action */}
                    <td className="p-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit2 className="w-3 h-3" />}
                        onClick={() => setActiveSubjectForModal(sub)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Marks Entry Modal */}
      <MarksEntryModal
        isOpen={Boolean(activeSubjectForModal)}
        onClose={() => setActiveSubjectForModal(null)}
        subject={activeSubjectForModal}
      />
    </div>
  );
};
