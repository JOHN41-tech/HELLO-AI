import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'verified' | 'danger';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'border-emerald-500/30 bg-emerald-950 text-emerald-400',
    warning: 'border-amber-500/30 bg-amber-950 text-amber-300',
    danger: 'border-red-500/40 bg-red-950/40 text-red-400',
    info: 'border-indigo-500/40 bg-indigo-950/80 text-indigo-300',
    neutral: 'border-slate-800 bg-slate-800 text-slate-300',
    verified: 'border-teal-500/30 bg-teal-950 text-teal-400',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', variants[variant], className)
      )}
      {...props}
    >
      {children}
    </span>
  );
}
