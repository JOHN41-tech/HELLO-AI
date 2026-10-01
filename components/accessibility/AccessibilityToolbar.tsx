'use client';

import React, { useState, useEffect } from 'react';
import { SunMoon, Type } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function AccessibilityToolbar() {
  const { t } = useLanguage();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle('font-scale-lg', isLargeFont);
  }, [isLargeFont]);

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1" role="group">
      <button
        type="button"
        onClick={() => setIsHighContrast((value) => !value)}
        className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors sm:px-2.5 ${
          isHighContrast ? 'bg-amber-400 text-slate-950' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
        }`}
        title={t('accessibility.highContrast')}
        aria-label={t('accessibility.highContrast')}
        aria-pressed={isHighContrast}
      >
        <SunMoon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{t('accessibility.highContrast')}</span>
      </button>
      <button
        type="button"
        onClick={() => setIsLargeFont((value) => !value)}
        className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors sm:px-2.5 ${
          isLargeFont ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
        }`}
        title={isLargeFont ? t('accessibility.fontNormal') : t('accessibility.fontIncrease')}
        aria-label={isLargeFont ? t('accessibility.fontNormal') : t('accessibility.fontIncrease')}
        aria-pressed={isLargeFont}
      >
        <Type className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">
          {isLargeFont ? t('accessibility.fontNormal') : t('accessibility.fontIncrease')}
        </span>
      </button>
    </div>
  );
}
