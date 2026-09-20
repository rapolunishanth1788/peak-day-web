import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] py-0.5 px-2.5 font-medium tracking-tight rounded-full gap-1',
    md: 'text-xs py-1 px-3 font-medium tracking-tight rounded-full gap-1.5',
  }[size];

  const variantClasses = {
    default: 'bg-white/10 text-slate-200 border border-white/10',
    blue: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    outline: 'bg-transparent text-slate-300 border border-white/20',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap select-none transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
