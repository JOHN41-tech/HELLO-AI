'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { translateKey } from '@/lib/i18n/localization';
import { LanguageCode } from '@/types/language';

const PREVIEW_KEYS = [
  'welcome.title',
  'welcome.start',
  'assistant.placeholder',
  'assistant.listen',
  'conversation.thinking',
  'eligibility.potentiallyEligible',
  'actions.categoryBusiness',
  'errors.generic',
  'errors.voiceUnavailable',
];

export default function LanguagePreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40">
          <h1 className="text-2xl font-black text-amber-300 mb-1">🔧 Developer Language Preview</h1>
          <p className="text-xs text-amber-200">This page shows all 12+1 locale translations. Only visible in development mode.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div key={lang.code} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" dir={lang.direction}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <span className="text-lg font-black text-slate-100">{lang.nativeName}</span>
                  <span className="block text-xs text-slate-400">{lang.name} · {lang.code} · {lang.locale}</span>
                  {lang.direction === 'rtl' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                      RTL
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {PREVIEW_KEYS.map((key) => {
                  const translated = translateKey(lang.code as LanguageCode, key);
                  const isFallback = translated === translateKey('en', key) && lang.code !== 'en';
                  return (
                    <div key={key} className="text-xs">
                      <span className="text-slate-500 font-mono">{key}: </span>
                      <span className={isFallback ? 'text-amber-400 italic' : 'text-slate-200'}>
                        {translated}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
