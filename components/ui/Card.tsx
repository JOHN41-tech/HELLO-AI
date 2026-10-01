import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function Card({ className, bordered = true, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-xl transition-all',
          bordered && 'border border-slate-800/80 hover:border-slate-700/80',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
