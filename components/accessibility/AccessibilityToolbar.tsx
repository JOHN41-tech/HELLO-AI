'use client';

import React, { useState, useEffect } from 'react';
import { SunMoon, Type, Volume2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function AccessibilityToolbar() {
  const { t } = useLanguage();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    if (isLargeFont) {
      document.documentElement.classList.add('font-scale-lg');
    } else {
      document.documentElement.classList.remove('font-scale-lg');
    }
  }, [isLargeFont]);

  return (
    <div className="flex items-center gap-2 text-xs bg-slate-900/80 backdrop-blur border border-slate-800 rounded-full px-3 py-1.5 shadow-sm">
      <button
        onClick={() => setIsHighContrast(!isHighContrast)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
          isHighContrast ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
        }`}
        title={t('accessibility.highContrast')}
        aria-label={t('accessibility.highContrast')}
      >
        <SunMoon className="w-4 h-4" />
        <span className="hidden sm:inline">{t('accessibility.highContrast')}</span>
      </button>

      <div className="w-px h-4 bg-slate-700" />

      <button
        onClick={() => setIsLargeFont(!isLargeFont)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
          isLargeFont ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
        }`}
        title={t('accessibility.fontIncrease')}
        aria-label={t('accessibility.fontIncrease')}
      >
        <Type className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isLargeFont ? t('accessibility.fontNormal') : t('accessibility.fontIncrease')}
        </span>
      </button>
    </div>
  );
}
