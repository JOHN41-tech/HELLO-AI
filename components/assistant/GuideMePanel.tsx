'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { GovernmentService, ApplicationStep } from '@/types/service';
import { EligibilityResult } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApplicationStepCard } from './ApplicationStepCard';
import { EligibilityCard } from './EligibilityCard';
import { DocumentCard } from './DocumentCard';
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, X, CircleHelp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface GuideMePanelProps {
  service: GovernmentService;
  language: LanguageCode;
  eligibilityResult?: EligibilityResult;
  onExit: () => void;
}

type GuideStage =
  | { kind: 'service' }
  | { kind: 'eligibility' }
  | { kind: 'documents' }
  | { kind: 'application'; step: ApplicationStep }
  | { kind: 'official' };

function safeOfficialUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function GuideMePanel({ service, language, eligibilityResult, onExit }: GuideMePanelProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const regionId = useId();
  const stages: GuideStage[] = [
    { kind: 'service' },
    { kind: 'eligibility' },
    { kind: 'documents' },
    ...service.applicationSteps.map((step) => ({ kind: 'application' as const, step })),
    { kind: 'official' },
  ];
  const stage = stages[activeIndex];
  const isLast = activeIndex === stages.length - 1;
  const stepText = t('guidance.stepOf', { current: activeIndex + 1, total: stages.length });
  const serviceName = translateLocalizedText(language, service.name);
  const serviceDescription = translateLocalizedText(language, service.description);
  const targetUsers = translateLocalizedText(language, service.targetUsers);
  const officialUrl = safeOfficialUrl(service.officialUrl);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
  }, [activeIndex]);

  return (
    <div ref={panelRef} className="scroll-mb-[20rem]">
      <Card className="my-4 border-emerald-500/30 bg-slate-900" role="region" aria-labelledby={`${regionId}-title`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>{t('guidance.title')}</span>
          </div>
          <h2 id={`${regionId}-title`} className="text-lg font-bold leading-snug text-slate-100 sm:text-xl">{serviceName}</h2>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-100"
          aria-label={t('actions.close')}
          title={t('actions.close')}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div className="mt-4" aria-label={stepText}>
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <span>{stepText}</span>
          <span aria-hidden="true">{activeIndex + 1}/{stages.length}</span>
        </div>
        <progress className="h-2 w-full accent-emerald-600" value={activeIndex + 1} max={stages.length} aria-label={stepText} />
      </div>

      <div className="mt-4 min-h-36" role="region" aria-live="polite" aria-atomic="true">
        {stage.kind === 'service' && (
          <section>
            <Badge variant="verified"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{t('service.verifiedSource')}</Badge>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{serviceDescription}</p>
            {targetUsers && (
              <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm leading-relaxed text-slate-300">
                <strong className="text-slate-100">{t('service.targetAudience')}</strong> {targetUsers}
              </p>
            )}
          </section>
        )}

        {stage.kind === 'eligibility' && (
          eligibilityResult ? (
            <EligibilityCard result={eligibilityResult} language={language} />
          ) : (
            <section className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-4" aria-label={t('eligibility.title')}>
              <Badge variant="neutral"><CircleHelp className="h-4 w-4" aria-hidden="true" />{t('eligibility.unknown')}</Badge>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('eligibility.disclaimer')}</p>
            </section>
          )
        )}

        {stage.kind === 'documents' && (
          service.requiredDocuments.length > 0 ? (
            <DocumentCard documents={service.requiredDocuments} language={language} />
          ) : (
            <p className="rounded-xl border border-amber-500/30 bg-amber-950 px-4 py-4 text-sm leading-relaxed text-slate-300" role="note">
              {t('documents.notVerified')}
            </p>
          )
        )}

        {stage.kind === 'application' && <ApplicationStepCard steps={[stage.step]} language={language} />}

        {stage.kind === 'official' && (
          <section className="rounded-xl border border-emerald-500/30 bg-emerald-950 px-4 py-5" aria-label={t('service.officialWebsite')}>
            <Badge variant="verified"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{service.source.authorityName}</Badge>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('service.verifiedSource')}</p>
            {officialUrl && (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>{t('service.officialWebsite')}</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </section>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-800 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          <span>{t('actions.back')}</span>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => (isLast ? onExit() : setActiveIndex((index) => Math.min(stages.length - 1, index + 1)))}
        >
          <span>{isLast ? t('actions.close') : t('guidance.nextStep')}</span>
          {!isLast && <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
        </Button>
      </footer>
      </Card>
    </div>
  );
}
