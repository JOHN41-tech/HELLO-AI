'use client';

import React from 'react';
import Link from 'next/link';
import { Mic2 } from 'lucide-react';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar';
import { LanguageCode } from '@/types/language';
import { useLanguage } from '@/hooks/useLanguage';

export interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export function Header({ currentLanguage, onLanguageChange }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t('actions.skipToContent')}
      </a>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 rounded-xl"
            aria-label={t('appName')}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950 text-emerald-400">
              <Mic2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-slate-100 sm:text-lg">
                {t('appName')}
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:block">
                {t('app.navigatorLabel')}
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AccessibilityToolbar />
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              variant="dropdown"
            />
          </div>
        </div>
      </header>
    </>
  );
}
