'use client';

import React from 'react';
import { EligibilityResult } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface EligibilityCardProps {
  result: EligibilityResult;
  language: LanguageCode;
}

export function EligibilityCard({ result }: EligibilityCardProps) {
  const { t } = useLanguage();

  const statusKey = result.isEligible
    ? 'eligibility.potentiallyEligible'
    : result.failedRules.length > 0
      ? 'eligibility.notEligible'
      : 'eligibility.moreInformationRequired';
  const statusVariant = result.isEligible
    ? 'success'
    : result.failedRules.length > 0
      ? 'warning'
      : 'warning';

  return (
    <Card className="border-slate-800 bg-slate-900/90 my-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-100">{t('eligibility.title')}</h3>
        <Badge variant={statusVariant}>{t(statusKey)}</Badge>
      </div>

      {/* Matched conditions */}
      {result.matchedRules.length > 0 && (
        <div className="space-y-2 mt-3">
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {t('eligibility.matchedTitle')}
          </h4>
          {result.matchedRules.map((rule) => (
            <div
              key={rule.ruleId}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rule.explanation}</span>
            </div>
          ))}
        </div>
      )}

      {/* Missing information */}
      {result.missingInformationFields.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-amber-400 mb-1.5 uppercase tracking-wider">
            {t('eligibility.missingInfoTitle')}
          </h4>
          <div className="space-y-1.5">
            {result.missingInformationFields.map((field) => (
              <div
                key={field}
                className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t('documents.needToConfirm', { field })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed conditions if any */}
      {result.failedRules.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            {t('eligibility.failedTitle')}
          </h4>
          <div className="space-y-2">
            {result.failedRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{rule.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
