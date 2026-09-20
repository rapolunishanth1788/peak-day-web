import React, { useState, useEffect, useMemo } from 'react';
import { Subject, MarksComponent, useAcademics } from '../../contexts/AcademicContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FileSpreadsheet, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

interface MarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const MarksEntryModal: React.FC<MarksEntryModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const { updateSubjectMarks, gradingConfig } = useAcademics();

  // Form local state
  const [mid1, setMid1] = useState<MarksComponent>({ scored: 0, max: 30, evaluated: false });
  const [mid2, setMid2] = useState<MarksComponent>({ scored: 0, max: 30, evaluated: false });
  const [semester, setSemester] = useState<MarksComponent>({ scored: 0, max: 100, evaluated: false });
  const [assignment, setAssignment] = useState<MarksComponent>({ scored: 0, max: 50, evaluated: false });
  const [lab, setLab] = useState<MarksComponent>({ scored: 0, max: 30, evaluated: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subject) {
      setMid1(subject.mid1Marks || { scored: 0, max: 30, evaluated: false });
      setMid2(subject.mid2Marks || { scored: 0, max: 30, evaluated: false });
      setSemester(subject.semesterMarks || { scored: 0, max: 100, evaluated: false });
      setAssignment(subject.assignmentMarks || { scored: 0, max: 50, evaluated: false });
      setLab(subject.labMarks || { scored: 0, max: 30, evaluated: false });
    }
  }, [subject, isOpen]);

  // Live calculation of preview percentage with current weights
  const previewPercentage = useMemo(() => {
    const weights = gradingConfig.weights;
    let evalWeightSum = 0;
    let weightedPts = 0;

    const m1Pct = mid1.max > 0 ? (mid1.scored / mid1.max) * 100 : 0;
    const m2Pct = mid2.max > 0 ? (mid2.scored / mid2.max) * 100 : 0;
    const semPct = semester.max > 0 ? (semester.scored / semester.max) * 100 : 0;
    const assignPct = assignment.max > 0 ? (assignment.scored / assignment.max) * 100 : 0;
    const labPct = lab.max > 0 ? (lab.scored / lab.max) * 100 : 0;

    if (gradingConfig.preset === 'raw_points') {
      const scored = (mid1.evaluated ? mid1.scored : 0) +
        (mid2.evaluated ? mid2.scored : 0) +
        (semester.evaluated ? semester.scored : 0) +
        (assignment.evaluated ? assignment.scored : 0) +
        (lab.evaluated ? lab.scored : 0);

      const max = (mid1.evaluated ? mid1.max : 0) +
        (mid2.evaluated ? mid2.max : 0) +
        (semester.evaluated ? semester.max : 0) +
        (assignment.evaluated ? assignment.max : 0) +
        (lab.evaluated ? lab.max : 0);

      return max > 0 ? Number(((scored / max) * 100).toFixed(1)) : 0;
    }

    if (gradingConfig.useBestOfMids) {
      const combinedWeight = weights.mid1Weight + weights.mid2Weight;
      const best = Math.max(mid1.evaluated ? m1Pct : 0, mid2.evaluated ? m2Pct : 0);
      if (mid1.evaluated || mid2.evaluated) {
        evalWeightSum += combinedWeight;
        weightedPts += best * (combinedWeight / 100);
      }
    } else {
      if (mid1.evaluated) {
        evalWeightSum += weights.mid1Weight;
        weightedPts += m1Pct * (weights.mid1Weight / 100);
      }
      if (mid2.evaluated) {
        evalWeightSum += weights.mid2Weight;
        weightedPts += m2Pct * (weights.mid2Weight / 100);
      }
    }

    if (semester.evaluated) {
      evalWeightSum += weights.semesterWeight;
      weightedPts += semPct * (weights.semesterWeight / 100);
    }
    if (assignment.evaluated) {
      evalWeightSum += weights.assignmentWeight;
      weightedPts += assignPct * (weights.assignmentWeight / 100);
    }
    if (lab.evaluated) {
      evalWeightSum += weights.labWeight;
      weightedPts += labPct * (weights.labWeight / 100);
    }

    if (gradingConfig.normalizeUnevaluated && evalWeightSum > 0 && evalWeightSum < 100) {
      return Number(((weightedPts / (evalWeightSum / 100))).toFixed(1));
    }
    return Number(weightedPts.toFixed(1));
  }, [mid1, mid2, semester, assignment, lab, gradingConfig]);

  if (!subject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateSubjectMarks(subject.id, {
        mid1Marks: mid1,
        mid2Marks: mid2,
        semesterMarks: semester,
        assignmentMarks: assignment,
        labMarks: lab,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update marks:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComponentRow = (
    label: string,
    state: MarksComponent,
    setState: React.Dispatch<React.SetStateAction<MarksComponent>>,
    nominalWeight: number
  ) => {
    const pct = state.max > 0 ? ((state.scored / state.max) * 100).toFixed(1) : '0';
    const isOverMax = state.scored > state.max;

    return (
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.evaluated}
              onChange={(e) => setState((prev) => ({ ...prev, evaluated: e.target.checked }))}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-white/5 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-white">{label}</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded">
              Weight: {nominalWeight}%
            </span>
            {state.evaluated ? (
              <span className={`text-xs font-mono font-bold ${Number(pct) >= 80 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {pct}%
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500">Pending</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Scored Marks
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={state.scored}
              onChange={(e) => {
                const val = Number(e.target.value);
                setState((prev) => ({ ...prev, scored: val, evaluated: true }));
              }}
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Maximum Marks
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={state.max}
              onChange={(e) => {
                const val = Number(e.target.value);
                setState((prev) => ({ ...prev, max: val }));
              }}
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {isOverMax && (
          <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" /> Scored marks cannot exceed maximum marks.
          </p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Marks Entry: ${subject.code} — ${subject.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Live Calculation Preview Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Live Projected Subject Score
              </span>
              <span className="text-xs text-slate-300">
                Scheme: {gradingConfig.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-white">
              {previewPercentage}%
            </span>
            <span className="text-[11px] text-slate-400 block">
              Target: {subject.targetMarks}%
            </span>
          </div>
        </div>

        {/* Assessment Rows */}
        {renderComponentRow(
          'Midterm 1 Examination',
          mid1,
          setMid1,
          gradingConfig.weights.mid1Weight
        )}
        {renderComponentRow(
          'Midterm 2 Examination',
          mid2,
          setMid2,
          gradingConfig.weights.mid2Weight
        )}
        {renderComponentRow(
          'Semester Final Exam',
          semester,
          setSemester,
          gradingConfig.weights.semesterWeight
        )}
        {renderComponentRow(
          'Coursework & Assignments',
          assignment,
          setAssignment,
          gradingConfig.weights.assignmentWeight
        )}
        {renderComponentRow(
          'Laboratory / Practical Sessions',
          lab,
          setLab,
          gradingConfig.weights.labWeight
        )}

        <div className="flex justify-between items-center pt-2 border-t border-white/[0.08]">
          <p className="text-[11px] text-slate-400">
            Check the box to activate an assessment into calculations.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Marks'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
