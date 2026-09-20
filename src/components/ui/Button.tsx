import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger' | 'accent-emerald' | 'accent-amber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Size-specific styles with 2x horizontal padding per anti-slop guidelines
  const sizeClasses = {
    sm: 'text-xs py-2 px-4 rounded-xl gap-1.5 h-8',
    md: 'text-sm py-2.5 px-5 rounded-xl gap-2 h-10',
    lg: 'text-base py-3 px-6 rounded-2xl gap-2.5 h-12 font-medium',
    icon: 'p-2.5 rounded-xl h-10 w-10 justify-center',
  }[size];

  // Apple-inspired refined dark variant styles
  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 border border-blue-400/30 font-medium',
    secondary:
      'bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 font-medium',
    glass:
      'glass-surface-subtle hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-md',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-medium',
    'accent-emerald':
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30 font-medium',
    'accent-amber':
      'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 border border-amber-400/30 font-medium',
  }[variant];

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center font-sans tracking-tight transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children && <span className="truncate">{children}</span>}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
