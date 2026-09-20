import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  GraduationCap,
  Dumbbell,
  Sparkles,
  Zap,
  Calendar,
  Flame,
  TrendingUp,
  Brain,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export const InteractiveHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto flex items-center justify-center p-4">
      {/* Dynamic 3D ambient aura & multi-layer focal glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-emerald-500/15 blur-3xl -z-10 animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-2xl -z-10" />

      {/* Orbit Rings with delicate radial markers (Apple depth aesthetic) */}
      <div className="absolute inset-4 rounded-full border border-white/[0.07] pointer-events-none" />
      <div className="absolute inset-16 rounded-full border border-dashed border-white/[0.05] pointer-events-none" />

      {/* Central 3D Glass Core (The Peak Day OS Core) */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotateZ: [0, 1, 0, -1, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-5 glass-surface-elevated border border-white/20 shadow-2xl shadow-blue-950/60 flex flex-col justify-between overflow-hidden backdrop-blur-xl"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(10, 20, 50, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Subtle internal gradient refraction */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar inside the central core */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30">
              <Zap className="w-4 h-4 text-white fill-white/20" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Peak Index</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Today's Alignment</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 font-mono">
            94%
          </span>
        </div>

        {/* Center Dynamic Radar / Metrics */}
        <div className="my-auto py-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">
              Peak Day <span className="text-blue-400">OS</span>
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18%
            </span>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
            Academic block scheduled, calories on target, workout completed, and AI review pending.
          </p>

          {/* Mini progress indicators */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>DAILY SYNC</span>
              <span>4 OF 4 DOMAINS</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom micro stats */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-mono">Tasks</div>
            <div className="text-xs font-bold text-slate-200">12/14</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono">GPA Target</div>
            <div className="text-xs font-bold text-emerald-400">3.92</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono">Readiness</div>
            <div className="text-xs font-bold text-blue-400">High</div>
          </div>
        </div>
      </motion.div>

      {/* SATELLITE 1: Productivity (Floating Top-Left) */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          x: [0, 4, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className="absolute -top-3 -left-2 sm:top-2 sm:left-0 z-20 w-44 sm:w-48 p-3 rounded-2xl glass-surface-elevated border border-blue-400/30 shadow-xl shadow-blue-950/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Productivity</div>
            <p className="text-[10px] text-slate-400">Deep Work: 4h 15m</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
          <span className="text-emerald-400">Sprint Done</span>
          <span className="text-slate-300">8 / 9 Tasks</span>
        </div>
      </motion.div>

      {/* SATELLITE 2: Academics (Floating Top-Right) */}
      <motion.div
        animate={{
          y: [0, 10, 0],
          x: [0, -6, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        }}
        className="absolute -top-1 -right-2 sm:top-4 sm:right-0 z-20 w-44 sm:w-52 p-3 rounded-2xl glass-surface-elevated border border-indigo-400/30 shadow-xl shadow-indigo-950/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">Academics</div>
            <p className="text-[10px] text-slate-400 truncate">CS 229 Midterm Prep</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
          <span className="text-indigo-300">Exam in 3 Days</span>
          <span className="text-emerald-400 font-semibold">91% Ready</span>
        </div>
      </motion.div>

      {/* SATELLITE 3: Fitness (Floating Bottom-Left) */}
      <motion.div
        animate={{
          y: [0, 8, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.4,
        }}
        className="absolute -bottom-3 -left-2 sm:bottom-3 sm:left-2 z-20 w-44 sm:w-48 p-3 rounded-2xl glass-surface-elevated border border-emerald-400/30 shadow-xl shadow-emerald-950/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Fitness</div>
            <p className="text-[10px] text-slate-400">Upper Push Day</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
          <span className="text-emerald-400 flex items-center gap-1">
            <Flame className="w-3 h-3" /> 620 kcal
          </span>
          <span className="text-slate-300">Completed</span>
        </div>
      </motion.div>

      {/* SATELLITE 4: AI Assistant (Floating Bottom-Right) */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          x: [0, -4, 0],
        }}
        transition={{
          duration: 6.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        className="absolute -bottom-3 -right-2 sm:bottom-2 sm:right-2 z-20 w-48 sm:w-52 p-3 rounded-2xl glass-surface-elevated border border-amber-400/30 shadow-xl shadow-amber-950/40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">AI Advisor</div>
            <p className="text-[10px] text-slate-400 truncate">Gemini Intelligent Synapse</p>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-300 border-t border-white/5 pt-1.5 italic line-clamp-1">
          "Shift study block by 30m for peak recovery."
        </div>
      </motion.div>
    </div>
  );
};
