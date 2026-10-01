'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, HeartHandshake, Award, BookOpen, ChevronDown, Mic2, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { useLanguage } from '@/hooks/useLanguage';

export default function WelcomePage() {
  const { language, currentConfig, setLanguage, t } = useLanguage();
  const [showLanguages, setShowLanguages] = useState(false);

  const quickPrompts = [
    { icon: BriefcaseBusiness, key: 'actions.categoryBusiness' },
    { icon: HeartHandshake, key: 'actions.categoryAssistance' },
    { icon: Award, key: 'actions.categorySkill' },
    { icon: BookOpen, key: 'actions.categoryEducation' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-12 lg:justify-center"
      >
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.75fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-start">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950 px-3.5 py-2 text-xs font-semibold text-emerald-400 sm:text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-500">
                <Mic2 className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>{t('welcome.languageBadge')}</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-100 sm:text-5xl">
              {t('welcome.title')}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t('welcome.subtitle')}
            </p>
            <p className="mt-4 text-sm font-semibold text-emerald-400">{t('tagline')}</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/assistant"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-emerald-600 bg-emerald-600 px-7 text-base font-bold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:text-lg"
              >
                <Mic2 className="h-5 w-5" aria-hidden="true" />
                <span>{t('welcome.start')}</span>
                <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setShowLanguages((value) => !value)}
                aria-expanded={showLanguages}
                aria-controls="welcome-language-options"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>{t('welcome.chooseLanguage')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showLanguages ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2 text-start text-xs leading-relaxed text-slate-500 lg:max-w-xl">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{t('welcome.privacyNote')}</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:mx-0">
            {showLanguages && (
              <section
                id="welcome-language-options"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:p-5"
                aria-label={t('welcome.chooseLanguage')}
              >
                <h2 className="mb-3 text-sm font-bold text-slate-100">{t('welcome.chooseLanguage')}</h2>
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} variant="grid" />
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5" aria-labelledby="quick-start-title">
              <h2 id="quick-start-title" className="mb-3 text-sm font-bold text-slate-100">
                {t('welcome.chooseNeed')}
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickPrompts.map(({ icon: Icon, key }) => {
                  const label = t(key);
                  return (
                    <Link
                      key={key}
                      href={`/assistant?query=${encodeURIComponent(label)}`}
                      className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-start text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-950 hover:text-slate-100"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span className="leading-snug">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
