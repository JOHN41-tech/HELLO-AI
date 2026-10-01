import React from 'react';

export interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ label = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3" role="status">
      <div
        className={`${sizes[size]} border-emerald-500 border-t-transparent rounded-full animate-spin`}
      />
      {label && <span className="text-sm font-medium text-slate-300 animate-pulse">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
}
