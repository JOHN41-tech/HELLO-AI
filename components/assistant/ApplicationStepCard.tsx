'use client';

import React, { useId, useState } from 'react';
import { ApplicationStep } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, CheckCircle2, MapPin, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface ApplicationStepCardProps {
  steps: ApplicationStep[];
  language: LanguageCode;
  interactive?: boolean;
  onExit?: () => void;
}

export function ApplicationStepCard({ steps, language, interactive = false, onExit }: ApplicationStepCardProps) {
  const { t } = useLanguage();
  const headingId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleSteps = interactive ? steps.slice(activeIndex, activeIndex + 1) : steps;
  const isLastStep = activeIndex >= steps.length - 1;

  return (
    <Card className="my-3 border-emerald-500/30 bg-slate-900" role="region" aria-labelledby={headingId}>
      <div className="flex items-start justify-between gap-3">
        <h3 id={headingId} className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg">
          <MapPin className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>{t('guidance.title')}</span>
        </h3>
        {interactive && onExit && (
          <button
            type="button"
            onClick={onExit}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-100"
            aria-label={t('actions.close')}
            title={t('actions.close')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {interactive && (
        <div className="mt-3" aria-label={t('guidance.stepOf', { current: activeIndex + 1, total: steps.length })}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>{t('guidance.stepOf', { current: activeIndex + 1, total: steps.length })}</span>
            <span aria-hidden="true">{activeIndex + 1}/{steps.length}</span>
          </div>
          <progress className="h-2 w-full accent-emerald-600" value={activeIndex + 1} max={steps.length} aria-label={t('guidance.stepOf', { current: activeIndex + 1, total: steps.length })} />
        </div>
      )}

      <div className="relative mt-4 space-y-4 border-s-2 border-emerald-500/30 ps-5">
        {visibleSteps.map((step) => {
          const title = translateLocalizedText(language, step.title);
          const description = translateLocalizedText(language, step.description);
          const userAction = translateLocalizedText(language, step.userAction);
          const helpText = step.helpText ? translateLocalizedText(language, step.helpText) : '';
          let safeOfficialUrl: string | undefined;
          if (step.officialPageUrl) {
            try {
              const url = new URL(step.officialPageUrl);
              if (url.protocol === 'https:' && !url.username && !url.password) safeOfficialUrl = url.toString();
            } catch {
              safeOfficialUrl = undefined;
            }
          }

          return (
            <div key={step.stepNumber} className="relative" aria-current={interactive ? 'step' : undefined}>
              <div className="absolute -start-[31px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {step.stepNumber}
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <h4 className="text-sm font-bold text-slate-100 sm:text-base">{title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{description}</p>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <div><strong className="text-slate-100">{t('service.action')}</strong> {userAction}</div>
                </div>
                {helpText && <p className="mt-2 text-xs leading-relaxed text-slate-500">{helpText}</p>}
                {safeOfficialUrl && (
                  <a
                    href={safeOfficialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-950 focus-visible:outline-none"
                  >
                    <span>{t('service.openStep')}</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {interactive && (
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          >
            {t('actions.back')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => (isLastStep ? onExit?.() : setActiveIndex((index) => Math.min(steps.length - 1, index + 1)))}
          >
            {isLastStep ? t('actions.close') : t('guidance.nextStep')}
          </Button>
        </div>
      )}
    </Card>
  );
}
