import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onClear?: () => void;
  isSearch?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      onClear,
      isSearch = false,
      className = '',
      value,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-slate-300 tracking-wide select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center group">
          {isSearch && !leftIcon ? (
            <div className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          ) : (
            leftIcon && (
              <div className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
                {leftIcon}
              </div>
            )
          )}

          <input
            id={inputId}
            ref={ref}
            value={value}
            className={`w-full bg-[#111624]/80 text-slate-100 placeholder:text-slate-500 text-sm rounded-xl py-2.5 
              ${leftIcon || isSearch ? 'pl-10' : 'pl-3.5'} 
              ${rightElement || onClear ? 'pr-11' : 'pr-3.5'} 
              border border-white/10 hover:border-white/15 
              focus:border-blue-500/80 focus:bg-[#13192B] focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
              transition-all duration-150 backdrop-blur-md ${
                error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
              } ${className}`}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {onClear && value && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {rightElement}
          </div>
        </div>

        {error ? (
          <p className="text-xs text-rose-400 flex items-center gap-1">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
