import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Calculator,
  Calendar,
  Flame,
  Dumbbell,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useFitness, calculate1RM } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TrophyPRGraphic } from './Subtle3DFitnessGraphics';

export const PersonalRecordsView: React.FC = () => {
  const { personalRecords } = useFitness();

  // Interactive 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(225);
  const [calcReps, setCalcReps] = useState<number>(5);

  const estimated1RM = calculate1RM(calcWeight, calcReps);

  const percentageTable = [
    { percent: 100, reps: '1 rep (Max)', weight: estimated1RM },
    { percent: 95, reps: '2 reps', weight: Math.round(estimated1RM * 0.95) },
    { percent: 90, reps: '3-4 reps', weight: Math.round(estimated1RM * 0.90) },
    { percent: 85, reps: '5-6 reps', weight: Math.round(estimated1RM * 0.85) },
    { percent: 80, reps: '7-8 reps', weight: Math.round(estimated1RM * 0.80) },
    { percent: 75, reps: '9-10 reps', weight: Math.round(estimated1RM * 0.75) },
    { percent: 70, reps: '11-12 reps', weight: Math.round(estimated1RM * 0.70) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Personal Records & 1RM Calculator
          </h2>
          <p className="text-sm text-slate-400">
            All-time strength milestones calculated via the Epley progressive formula.
          </p>
        </div>

        <Badge variant="amber" size="md">
          <TrophyPRGraphic size={18} className="mr-1 inline-block" />
          {personalRecords.length} All-Time Records
        </Badge>
      </div>

      {/* Interactive 1RM Calculator Widget */}
      <GlassCard className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/20 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">One Rep Max (1RM) Estimator</h3>
            <p className="text-xs text-slate-400">
              Input any submaximal set to calculate your true theoretical 1RM and percentage rep loads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Lifted Weight (lbs)</label>
            <input
              type="number"
              min="10"
              max="1500"
              value={calcWeight}
              onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-4 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Reps Completed</label>
            <input
              type="number"
              min="1"
              max="30"
              value={calcReps}
              onChange={(e) => setCalcReps(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-4 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex flex-col justify-center items-center text-center">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Estimated 1RM
            </span>
            <span className="text-3xl font-black text-white mt-0.5">
              {estimated1RM} <span className="text-sm font-semibold text-indigo-300">lbs</span>
            </span>
          </div>
        </div>

        {/* 1RM Percentage Training Zones Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {percentageTable.map((item) => (
            <div
              key={item.percent}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
            >
              <span className="text-[10px] font-bold text-slate-400 block">{item.percent}% 1RM</span>
              <span className="text-base font-black text-white block my-0.5">{item.weight} lbs</span>
              <span className="text-[10px] text-indigo-400">{item.reps}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Hall of Fame Records Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Exercise Hall of Fame ({personalRecords.length})
        </h3>

        {personalRecords.length === 0 ? (
          <GlassCard className="p-8 text-center text-slate-400 text-sm">
            No personal records found yet. Log a workout to establish your baseline records!
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalRecords.map((pr) => (
              <GlassCard
                key={pr.exerciseId}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Badge variant="blue" size="sm" className="mb-1.5">
                        {pr.primaryMuscle}
                      </Badge>
                      <h4 className="text-base font-bold text-white line-clamp-1">
                        {pr.exerciseName}
                      </h4>
                    </div>
                    <TrophyPRGraphic size={36} className="shrink-0" />
                  </div>

                  {/* Highlight Numbers */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Heavy Set
                      </span>
                      <p className="text-lg font-black text-white mt-0.5">
                        {pr.maxWeight}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          lbs × {pr.repsAtMaxWeight}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Est. 1RM
                      </span>
                      <p className="text-lg font-black text-amber-400 mt-0.5">
                        {pr.estimated1RM}{' '}
                        <span className="text-xs font-normal text-slate-400">lbs</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pr.dateAchieved}
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {pr.history.length} Session Records
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
