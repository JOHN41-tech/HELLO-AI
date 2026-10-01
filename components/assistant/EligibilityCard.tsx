'use client';

import React, { useId } from 'react';
import { EligibilityResult } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, AlertTriangle, CircleHelp, XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface EligibilityCardProps {
  result: EligibilityResult;
  language: LanguageCode;
}

export function EligibilityCard({ result }: EligibilityCardProps) {
  const { t } = useLanguage();
  const headingId = useId();
  const status = result.status ?? (result.isEligible
    ? 'POTENTIALLY_ELIGIBLE'
    : result.failedRules.length > 0
      ? 'NOT_ELIGIBLE'
      : 'MORE_INFORMATION_REQUIRED');
  const statusKey = status === 'POTENTIALLY_ELIGIBLE'
    ? 'eligibility.potentiallyEligible'
    : status === 'NOT_ELIGIBLE'
      ? 'eligibility.notEligible'
      : status === 'UNKNOWN'
        ? 'eligibility.unknown'
        : 'eligibility.moreInformationRequired';
  const statusVariant = status === 'POTENTIALLY_ELIGIBLE'
    ? 'success'
    : status === 'NOT_ELIGIBLE'
      ? 'danger'
      : status === 'UNKNOWN'
        ? 'neutral'
        : 'warning';
  const StatusIcon = status === 'POTENTIALLY_ELIGIBLE'
    ? CheckCircle2
    : status === 'NOT_ELIGIBLE'
      ? XCircle
      : status === 'UNKNOWN'
        ? CircleHelp
        : AlertTriangle;

  return (
    <Card className="my-3 bg-slate-900" role="region" aria-labelledby={headingId}>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 id={headingId} className="text-base font-bold text-slate-100 sm:text-lg">
          {t('eligibility.title')}
        </h3>
        <Badge variant={statusVariant} className="max-w-full whitespace-normal leading-snug">
          <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t(statusKey)}</span>
        </Badge>
      </div>
      <p className="mt-3 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm leading-relaxed text-slate-500">
        {t('eligibility.disclaimer')}
      </p>

      {result.matchedRules.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400">{t('eligibility.matchedTitle')}</h4>
          {result.matchedRules.map((rule) => (
            <div key={rule.ruleId} className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{rule.explanation}</span>
            </div>
          ))}
        </div>
      )}

      {result.missingInformationFields.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-bold text-amber-300">{t('eligibility.missingInfoTitle')}</h4>
          <div className="space-y-2">
            {result.missingInformationFields.map((field) => (
              <div key={field} className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-950 px-3 py-2 text-sm leading-relaxed text-slate-300">
                <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span>{t('documents.needToConfirm', { field })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.failedRules.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-bold text-slate-500">{t('eligibility.failedTitle')}</h4>
          <div className="space-y-2">
            {result.failedRules.map((rule) => (
              <div key={rule.ruleId} className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                <span>{rule.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
