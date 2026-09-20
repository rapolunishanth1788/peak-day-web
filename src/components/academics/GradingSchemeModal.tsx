import React, { useState, useEffect } from 'react';
import {
  useAcademics,
  PRESET_SCHEMES,
  GradingFormulaPreset,
  GradingSchemeWeights,
} from '../../contexts/AcademicContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Settings2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calculator,
  RotateCcw,
} from 'lucide-react';

interface GradingSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradingSchemeModal: React.FC<GradingSchemeModalProps> = ({ isOpen, onClose }) => {
  const { gradingConfig, updateGradingConfig, setGradingPreset } = useAcademics();

  const [selectedPreset, setSelectedPreset] = useState<GradingFormulaPreset>(gradingConfig.preset);
  const [weights, setWeights] = useState<GradingSchemeWeights>(gradingConfig.weights);
  const [useBestOfMids, setUseBestOfMids] = useState<boolean>(gradingConfig.useBestOfMids);
  const [normalizeUnevaluated, setNormalizeUnevaluated] = useState<boolean>(
    gradingConfig.normalizeUnevaluated
  );
  const [minAttendanceThreshold, setMinAttendanceThreshold] = useState<number>(
    gradingConfig.minAttendanceThreshold || 75
  );
  const [targetOverallPercentage, setTargetOverallPercentage] = useState<number>(
    gradingConfig.targetOverallPercentage || 88
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedPreset(gradingConfig.preset);
    setWeights(gradingConfig.weights);
    setUseBestOfMids(gradingConfig.useBestOfMids);
    setNormalizeUnevaluated(gradingConfig.normalizeUnevaluated);
    setMinAttendanceThreshold(gradingConfig.minAttendanceThreshold || 75);
    setTargetOverallPercentage(gradingConfig.targetOverallPercentage || 88);
  }, [gradingConfig, isOpen]);

  const handleSelectPreset = (preset: GradingFormulaPreset) => {
    setSelectedPreset(preset);
    const p = PRESET_SCHEMES[preset];
    if (p) {
      setWeights(p.weights);
      setUseBestOfMids(p.useBestOfMids);
    }
  };

  const totalWeight =
    weights.mid1Weight +
    weights.mid2Weight +
    weights.semesterWeight +
    weights.assignmentWeight +
    weights.labWeight;

  const isWeightValid = selectedPreset === 'raw_points' || Math.abs(totalWeight - 100) < 0.1;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateGradingConfig({
        preset: selectedPreset,
        name:
          selectedPreset === 'custom'
            ? 'Custom Configured Scheme'
            : PRESET_SCHEMES[selectedPreset].name,
        description:
          selectedPreset === 'custom'
            ? 'User custom-weighted assessment scheme.'
            : PRESET_SCHEMES[selectedPreset].description,
        weights,
        useBestOfMids,
        normalizeUnevaluated,
        minAttendanceThreshold,
        targetOverallPercentage,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update grading configuration:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grading Calculation Scheme & Transparency Engine"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Transparency Banner */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Configurable Academic Engine</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Peak Day allows you to adapt calculations to match your exact university grading
            curriculum. Choose a preset or customize each assessment weight individually. All
            computations are 100% transparent.
          </p>
        </div>

        {/* 1. PRESET SELECTOR */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select University Grading Scheme Preset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(PRESET_SCHEMES) as GradingFormulaPreset[]).map((key) => {
              const preset = PRESET_SCHEMES[key];
              const isSelected = selectedPreset === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{preset.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{preset.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CUSTOM WEIGHTS CONFIGURATION */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Component Weights Allocation</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total:</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  isWeightValid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {totalWeight}%
              </span>
            </div>
          </div>

          {!isWeightValid && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Total weights must sum to 100% (currently {totalWeight}%). Adjust the sliders below.
            </p>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Midterm 1 Weight</span>
                <span className="font-mono text-white font-bold">{weights.mid1Weight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={weights.mid1Weight}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  setWeights((prev) => ({ ...prev, mid1Weight: Number(e.target.value) }));
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Midterm 2 Weight</span>
                <span className="font-mono text-white font-bold">{weights.mid2Weight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={weights.mid2Weight}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  setWeights((prev) => ({ ...prev, mid2Weight: Number(e.target.value) }));
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Semester Final Exam Weight</span>
                <span className="font-mono text-white font-bold">{weights.semesterWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={70}
                step={1}
                value={weights.semesterWeight}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  setWeights((prev) => ({ ...prev, semesterWeight: Number(e.target.value) }));
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Assignments & Quizzes Weight</span>
                <span className="font-mono text-white font-bold">{weights.assignmentWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={weights.assignmentWeight}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  setWeights((prev) => ({ ...prev, assignmentWeight: Number(e.target.value) }));
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Laboratory & Practical Work Weight</span>
                <span className="font-mono text-white font-bold">{weights.labWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={weights.labWeight}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  setWeights((prev) => ({ ...prev, labWeight: Number(e.target.value) }));
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. CALCULATION OPTIONS & TOGGLES */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Advanced Assessment Rules
          </h4>

          <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04]">
            <input
              type="checkbox"
              checked={useBestOfMids}
              onChange={(e) => {
                setSelectedPreset('custom');
                setUseBestOfMids(e.target.checked);
              }}
              className="mt-1 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-white/5 w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                Best of Two Midterms Policy
              </span>
              <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                Takes only your highest percentage between Mid 1 and Mid 2, allocating the combined
                weight ({weights.mid1Weight + weights.mid2Weight}%) to your best attempt.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04]">
            <input
              type="checkbox"
              checked={normalizeUnevaluated}
              onChange={(e) => setNormalizeUnevaluated(e.target.checked)}
              className="mt-1 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-white/5 w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="text-xs font-semibold text-white block">
                Normalize Unevaluated Assessments to 100%
              </span>
              <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                Before final exams occur, scales current midterm and coursework results to a 100%
                basis so your current GPA accurately reflects completed assignments.
              </span>
            </div>
          </label>
        </div>

        {/* 4. INSTITUTIONAL THRESHOLDS */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Thresholds & Academic Targets
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Min. Attendance Threshold</span>
                <span className="font-mono text-emerald-400 font-bold">{minAttendanceThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={90}
                step={5}
                value={minAttendanceThreshold}
                onChange={(e) => setMinAttendanceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Alerts when course attendance drops below this minimum rate.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Target Cumulative Percentage</span>
                <span className="font-mono text-blue-400 font-bold">{targetOverallPercentage}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={98}
                step={1}
                value={targetOverallPercentage}
                onChange={(e) => setTargetOverallPercentage(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Benchmark for Dean's List and semester performance goals.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-white/[0.08]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectPreset('standard_weighted')}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Default
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !isWeightValid}
            >
              {isSaving ? 'Applying...' : 'Save & Apply Scheme'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
