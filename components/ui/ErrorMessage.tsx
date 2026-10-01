'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useLanguage();

  return (
    <div
      aria-live="assertive"
      className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3 my-2 shadow-md"
    >
      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm leading-relaxed">
        <p className="font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold underline text-amber-300 hover:text-amber-100 focus-visible:outline-none"
          >
            {t('actions.tryAgain')}
          </button>
        )}
      </div>
    </div>
  );
}
