import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface StatWidgetProps {
  label: string;
  value: string | number;
  subvalue?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  progress?: number; // 0 to 100
  trend?: {
    value: string;
    isPositive: boolean;
  };
  id?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  subvalue,
  icon: Icon,
  color = 'blue',
  progress,
  trend,
  id,
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      ring: '#0A84FF',
      glow: 'shadow-blue-500/10',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      ring: '#30D158',
      glow: 'shadow-emerald-500/10',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      ring: '#FF9F0A',
      glow: 'shadow-amber-500/10',
    },
    purple: {
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      ring: '#BF5AF2',
      glow: 'shadow-purple-500/10',
    },
    rose: {
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      ring: '#FF453A',
      glow: 'shadow-rose-500/10',
    },
  }[color];

  // SVG Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progress !== undefined ? circumference - (progress / 100) * circumference : 0;

  return (
    <div
      id={id}
      className="p-4 rounded-2xl bg-[#111625]/75 border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-white/15 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-xl border ${colorMap.iconBg} inline-flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>

        {progress !== undefined && (
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-white/[0.08]"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="22"
                cy="22"
                r={radius}
                stroke={colorMap.ring}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-mono text-slate-300 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 tracking-tight">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight text-white font-sans">{value}</span>
          {subvalue && <span className="text-xs text-slate-400">{subvalue}</span>}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-slate-400">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
};
