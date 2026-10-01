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
      'inline-flex select-none items-center justify-center gap-2.5 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-55';
    const variants = {
      primary: 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500',
      secondary: 'border border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800',
      outline: 'border border-emerald-500 bg-transparent text-emerald-400 hover:bg-emerald-950',
      ghost: 'border border-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100',
      voice: 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500',
    };
    const sizes = {
      sm: 'min-h-11 px-4 text-sm',
      md: 'min-h-12 px-5 text-base',
      lg: 'min-h-14 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
