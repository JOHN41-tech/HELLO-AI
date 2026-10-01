'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mic, ShieldCheck, Briefcase, HeartHandshake, Award, BookOpen, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';

export default function WelcomePage() {
  const { language, currentConfig, setLanguage, t } = useLanguage();

  const quickPrompts = [
    { icon: Briefcase, key: 'actions.categoryBusiness' },
    { icon: HeartHandshake, key: 'actions.categoryAssistance' },
    { icon: Award, key: 'actions.categorySkill' },
    { icon: BookOpen, key: 'actions.categoryEducation' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{t('app.phaseBadge')} — {t('welcome.languageBadge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight max-w-3xl">
          {t('tagline')}
        </h1>

        <p className="text-base sm:text-xl text-slate-300 mt-5 max-w-2xl leading-relaxed">
          {t('welcome.subtitle')}
        </p>

        {/* Language Selector */}
        <div className="mt-8 mb-6 p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl w-full max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
            🇮🇳 {t('welcome.chooseLanguage')}
          </p>
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} variant="grid" />
        </div>

        {/* Primary CTA */}
        <Link href="/assistant" className="w-full max-w-md">
          <Button variant="voice" size="lg" fullWidth className="group text-lg">
            <Mic className="w-6 h-6 text-slate-950" />
            <span>{t('welcome.start')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        {/* Sample Intent Chips */}
        <div className="mt-10 w-full max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
            {t('welcome.chooseNeed')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickPrompts.map((item, idx) => {
              const Icon = item.icon;
              const label = t(item.key);
              return (
                <Link key={idx} href={`/assistant?query=${encodeURIComponent(label)}`}>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all flex items-center gap-3 group cursor-pointer shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 leading-snug">
                      &ldquo;{label}&rdquo;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t('welcome.privacyNote')}</span>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
