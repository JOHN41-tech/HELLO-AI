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
          'rounded-2xl bg-slate-900 p-4 shadow-sm sm:p-5',
          bordered && 'border border-slate-800',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
