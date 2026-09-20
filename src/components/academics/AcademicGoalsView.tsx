import React, { useState, useMemo } from 'react';
import { useAcademics } from '../../contexts/AcademicContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Target,
  Award,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const AcademicGoalsView: React.FC = () => {
  const { subjects, subjectCalculations, summary, gradingConfig } = useAcademics();

  // Final Exam Target Calculator State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [desiredTargetPct, setDesiredTargetPct] = useState<number>(90);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const selectedCalc = selectedSubject ? subjectCalculations.get(selectedSubject.id) : null;

  // Calculate required Semester Final Exam score:
  // Current known weighted points (excluding semester exam)
  // Required = (DesiredPct - otherWeightedPoints) / (semesterWeight / 100)
  const examRequirement = useMemo(() => {
    if (!selectedSubject) return null;

    const weights = gradingConfig.weights;
    const semWeight = weights.semesterWeight;
    if (semWeight <= 0) return { requiredPct: 0, requiredRaw: 0, maxRaw: 100, isPossible: true };

    const mid1 = selectedSubject.mid1Marks || { scored: 0, max: 30, evaluated: false };
    const mid2 = selectedSubject.mid2Marks || { scored: 0, max: 30, evaluated: false };
    const assign = selectedSubject.assignmentMarks || { scored: 0, max: 50, evaluated: false };
    const lab = selectedSubject.labMarks || { scored: 0, max: 30, evaluated: false };

    const m1Pct = mid1.max > 0 ? (mid1.scored / mid1.max) * 100 : 0;
    const m2Pct = mid2.max > 0 ? (mid2.scored / mid2.max) * 100 : 0;
    const assignPct = assign.max > 0 ? (assign.scored / assign.max) * 100 : 0;
    const labPct = lab.max > 0 ? (lab.scored / lab.max) * 100 : 0;

    let otherWeightedPoints = 0;

    if (gradingConfig.useBestOfMids) {
      const best = Math.max(m1Pct, m2Pct);
      const combined = weights.mid1Weight + weights.mid2Weight;
      otherWeightedPoints += best * (combined / 100);
    } else {
      otherWeightedPoints += m1Pct * (weights.mid1Weight / 100);
      otherWeightedPoints += m2Pct * (weights.mid2Weight / 100);
    }

    otherWeightedPoints += assignPct * (weights.assignmentWeight / 100);
    otherWeightedPoints += labPct * (weights.labWeight / 100);

    const neededWeightedPoints = desiredTargetPct - otherWeightedPoints;
    const requiredPct = Math.max(0, (neededWeightedPoints / (semWeight / 100)));

    const semMax = selectedSubject.semesterMarks?.max || 100;
    const requiredRaw = Number(((requiredPct / 100) * semMax).toFixed(1));

    return {
      requiredPct: Number(requiredPct.toFixed(1)),
      requiredRaw,
      maxRaw: semMax,
      isPossible: requiredPct <= 100,
      otherWeightedPoints: Number(otherWeightedPoints.toFixed(1)),
      neededWeightedPoints: Number(neededWeightedPoints.toFixed(1)),
    };
  }, [selectedSubject, desiredTargetPct, gradingConfig]);

  const targetPercentageGoal = gradingConfig.targetOverallPercentage || 88;
  const targetGpaGoal = gradingConfig.targetOverallGpa || 3.8;

  const currentWeightedPct = summary.creditWeightedPercentage;
  const currentGpa = summary.overallGpa4;
  const overallGap = currentWeightedPct - targetPercentageGoal;

  return (
    <div className="space-y-6">
      {/* Target Milestone Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Target Cumulative %</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{targetPercentageGoal}%</span>
            <span className={`text-xs font-mono font-bold ${overallGap >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {overallGap >= 0 ? `+${overallGap.toFixed(1)}%` : `${overallGap.toFixed(1)}%`}
            </span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, (currentWeightedPct / targetPercentageGoal) * 100)}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Target GPA</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{targetGpaGoal.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-mono">Current: {currentGpa.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-purple-300 mt-1">
            {currentGpa >= targetGpaGoal ? "Dean's List Standing" : 'Within reach this term'}
          </p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Strong Subjects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {summary.strongSubjects.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Maintaining A / A+ grade pacing</p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black font-mono text-rose-400">
            {summary.needsAttentionSubjects.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Target deficit or attendance shortage</p>
        </GlassCard>
      </div>

      {/* Interactive Final Exam Score Requirement Planner */}
      <GlassCard className="p-5 md:p-6 space-y-4 border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <span>Final Exam What-If Planner & Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a course and desired final grade to calculate the exact marks required in the End-Semester Examination.
            </p>
          </div>
          <Badge variant="blue" size="sm">
            {gradingConfig.name}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Course
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400 uppercase font-semibold">Desired Final Grade %</span>
                <span className="font-mono text-blue-400 font-bold">{desiredTargetPct}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                step={1}
                value={desiredTargetPct}
                onChange={(e) => setDesiredTargetPct(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Passing (60%)</span>
                <span>Honor (80%)</span>
                <span>Dean's List (90%+)</span>
              </div>
            </div>

            {selectedCalc && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Subject Score:</span>
                  <span className="font-mono font-bold text-white">{selectedCalc.currentPercentage}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Course Target:</span>
                  <span className="font-mono text-slate-300">{selectedSubject?.targetMarks}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Final Exam Weight:</span>
                  <span className="font-mono text-blue-400 font-bold">{gradingConfig.weights.semesterWeight}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Calculator Result Card */}
          <div className="md:col-span-2 flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Required Exam Performance
              </span>

              {examRequirement ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-4xl sm:text-5xl font-black font-mono ${
                        !examRequirement.isPossible
                          ? 'text-rose-400'
                          : examRequirement.requiredPct <= 75
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {examRequirement.requiredRaw}
                    </span>
                    <span className="text-sm font-mono text-slate-400">
                      / {examRequirement.maxRaw} marks ({examRequirement.requiredPct}%)
                    </span>
                  </div>

                  {!examRequirement.isPossible ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-rose-200">Target Statistically Exceeds Max</p>
                        <p className="text-slate-300 mt-0.5">
                          Achieving {desiredTargetPct}% overall would require {examRequirement.requiredPct}% in the final exam (greater than 100%). Consider lowering your target slightly to a realistic benchmark.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Achievable goal! Scoring {examRequirement.requiredRaw} out of {examRequirement.maxRaw} in the Semester Final guarantees your target of {desiredTargetPct}%.
                      </span>
                    </div>
                  )}

                  {/* Mathematical Formula Transparency */}
                  <div className="pt-2 text-[11px] text-slate-400 font-mono space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                    <p className="font-bold text-slate-300">Calculation Transparency:</p>
                    <p>• Internal coursework points accumulated: {examRequirement.otherWeightedPoints} pts</p>
                    <p>• Remaining weighted points needed for {desiredTargetPct}%: {examRequirement.neededWeightedPoints} pts</p>
                    <p>
                      • Final Exam requirement: {examRequirement.neededWeightedPoints} / ({gradingConfig.weights.semesterWeight} / 100) = {examRequirement.requiredPct}% ({examRequirement.requiredRaw}/{examRequirement.maxRaw})
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Course Intervention Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5 space-y-3 border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Strong Subjects (Keep Momentum)
            </h4>
          </div>

          <div className="space-y-2">
            {summary.strongSubjects.length > 0 ? (
              summary.strongSubjects.map((sub) => {
                const calc = subjectCalculations.get(sub.id);
                return (
                  <div key={sub.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{sub.name}</span>
                      <span className="text-slate-400 font-mono">{sub.code} • {sub.credits} Credits</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/20">
                      {calc?.currentPercentage}% ({calc?.gradeLetter})
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No courses currently meet the high performance threshold.</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-3 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Intervention Priorities (Needs Attention)
            </h4>
          </div>

          <div className="space-y-2">
            {summary.needsAttentionSubjects.length > 0 ? (
              summary.needsAttentionSubjects.map((sub) => {
                const calc = subjectCalculations.get(sub.id);
                return (
                  <div key={sub.id} className="p-2.5 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{sub.name}</span>
                      <span className="text-rose-400 font-mono">
                        {calc?.attendancePercentage}% Att • {calc?.targetGap}% Gap to Target
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 font-mono font-bold border border-rose-500/20">
                      {calc?.currentPercentage}%
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-emerald-400">No courses require urgent intervention right now!</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
