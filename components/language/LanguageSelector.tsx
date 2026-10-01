'use client';

import React from 'react';
import { LanguageCode } from '@/types/language';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { useLanguage } from '@/hooks/useLanguage';

export interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  variant?: 'pills' | 'dropdown' | 'grid';
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  variant = 'grid',
}: LanguageSelectorProps) {
  const { t } = useLanguage();

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer min-h-[44px]"
        aria-label={t('welcome.chooseLanguage')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full"
      role="group"
      aria-label={t('welcome.chooseLanguage')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[48px] cursor-pointer border ${
              isSelected
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-102 font-black'
                : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
            }`}
            aria-pressed={isSelected}
            title={`${lang.name} - ${lang.nativeName}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="truncate">{lang.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
}
