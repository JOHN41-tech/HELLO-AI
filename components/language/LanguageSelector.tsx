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
      <label className="sr-only" htmlFor="language-selector">
        {t('welcome.chooseLanguage')}
        <select
          id="language-selector"
          value={currentLanguage}
          onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
          className="not-sr-only min-h-11 max-w-[8.5rem] cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-2.5 text-sm font-semibold text-slate-100 sm:max-w-48 sm:px-3"
          aria-label={t('welcome.chooseLanguage')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} lang={lang.code} dir={lang.direction}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
      role="group"
      aria-label={t('welcome.chooseLanguage')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            lang={lang.code}
            dir={lang.direction}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              isSelected
                ? 'border-emerald-500 bg-emerald-600 text-white'
                : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800'
            }`}
            aria-pressed={isSelected}
            title={lang.nativeName}
          >
            <span className="truncate">{lang.nativeName}</span>
            {isSelected && <span className="sr-only">{t('common.selected')}</span>}
          </button>
        );
      })}
    </div>
  );
}
