import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'verified';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    info: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    verified: 'bg-teal-950/80 text-teal-300 border-teal-500/40',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
