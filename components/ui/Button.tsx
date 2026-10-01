'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'voice';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:pointer-events-none active:scale-98 cursor-pointer select-none';

    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm',
      outline: 'border-2 border-emerald-500/60 hover:bg-emerald-950/40 text-emerald-300',
      ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
      voice: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/20',
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm gap-2 min-h-[44px]',
      md: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
      lg: 'h-14 px-8 text-lg gap-3 min-h-[56px]',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
