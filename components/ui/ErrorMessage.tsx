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
    <div role="alert" aria-live="assertive" className="my-3 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950 px-4 py-3 text-slate-300">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        <p>{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-amber-300 underline underline-offset-2 hover:text-slate-100"
          >
            {t('actions.tryAgain')}
          </button>
        )}
      </div>
    </div>
  );
}
