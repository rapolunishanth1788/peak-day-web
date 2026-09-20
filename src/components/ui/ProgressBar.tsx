import React from 'react';
import { motion } from 'motion/react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  valueDisplay?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  valueDisplay,
  variant = 'blue',
  size = 'md',
  showGlow = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const fillColors = {
    blue: 'bg-blue-500 shadow-[0_0_12px_rgba(10,132,255,0.4)]',
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(48,209,88,0.4)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(255,159,10,0.4)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(191,90,242,0.4)]',
    gradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(48,209,88,0.3)]',
  }[variant];

  return (
    <div className={`w-full flex flex-col gap-1.5 font-sans ${className}`}>
      {(label || valueDisplay) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {valueDisplay ? (
            <span className="text-slate-400 font-mono text-[11px]">{valueDisplay}</span>
          ) : (
            <span className="text-slate-400 font-mono text-[11px]">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.04] ${heightClasses}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full relative ${fillColors}`}
        >
          {showGlow && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80 blur-[1px]" />
          )}
        </motion.div>
      </div>
    </div>
  );
};
