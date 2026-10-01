'use client';

import React from 'react';
import { ApplicationStep } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { ExternalLink, CheckCircle2, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface ApplicationStepCardProps {
  steps: ApplicationStep[];
  language: LanguageCode;
}

export function ApplicationStepCard({ steps, language }: ApplicationStepCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-emerald-500/30 bg-slate-900/90 my-4 shadow-xl">
      <h3 className="text-base sm:text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-emerald-400" />
        <span>{t('guidance.title')}</span>
      </h3>

      <div className="relative border-s-2 border-emerald-500/30 ms-3.5 space-y-6 ps-5">
        {steps.map((step) => {
          const title = translateLocalizedText(language, step.title);
          const desc = translateLocalizedText(language, step.description);
          const userAction = translateLocalizedText(language, step.userAction);
          const helpText = step.helpText ? translateLocalizedText(language, step.helpText) : '';

          return (
            <div key={step.stepNumber} className="relative">
              {/* Bullet circle */}
              <div className="absolute -start-[31px] top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
                {step.stepNumber}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm sm:text-base font-bold text-slate-100">{title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">{desc}</p>

                <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300">{t('service.action')}</strong>{' '}
                    {userAction}
                  </div>
                </div>

                {helpText && (
                  <p className="text-[11px] text-slate-400 mt-2 italic">💡 {helpText}</p>
                )}

                {step.officialPageUrl && (
                  <a
                    href={step.officialPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-3 focus-visible:outline-none"
                  >
                    <span>{t('service.openStep')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
