'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors">
              {t('appName')}
            </span>
            <span className="block text-[10px] font-medium text-emerald-400/80 tracking-wide uppercase">
              {t('app.navigatorLabel')}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <AccessibilityToolbar />
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            variant="dropdown"
          />
        </div>
      </div>
    </header>
  );
}
