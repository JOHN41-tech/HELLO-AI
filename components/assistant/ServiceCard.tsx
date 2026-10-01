'use client';

import React from 'react';
import { GovernmentService } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ExternalLink, AlertTriangle, Route } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface ServiceCardProps {
  service: GovernmentService;
  language: LanguageCode;
  onGuide?: () => void;
}

export function ServiceCard({ service, language, onGuide }: ServiceCardProps) {
  const { t } = useLanguage();
  const name = translateLocalizedText(language, service.name);
  const description = translateLocalizedText(language, service.description);
  const targetUsers = translateLocalizedText(language, service.targetUsers);
  const isVerified = service.source.verificationStatus === 'verified';
  const officialUrl = (() => {
    try {
      const url = new URL(service.officialUrl);
      return isVerified && url.protocol === 'https:' && !url.username && !url.password ? url.toString() : undefined;
    } catch {
      return undefined;
    }
  })();

  return (
    <Card className="my-3 border-emerald-500/30 bg-slate-900 shadow-sm" role="region" aria-label={name}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isVerified ? 'verified' : 'warning'}>
          {isVerified ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{isVerified ? service.source.authorityName : t('service.sampleNotice')}</span>
        </Badge>
        {isVerified && <span className="text-xs font-medium text-slate-500">{t('service.verifiedSource')}</span>}
      </div>

      <h2 className="mt-3 text-xl font-bold leading-snug text-slate-100 sm:text-2xl">{name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{description}</p>

      {targetUsers && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm leading-relaxed text-slate-300">
          <strong className="text-slate-100">{t('service.targetAudience')}</strong> {targetUsers}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row">
        {onGuide && isVerified && officialUrl && (
          <Button type="button" variant="secondary" size="md" onClick={onGuide}>
            <Route className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>{t('guidance.guideMe')}</span>
          </Button>
        )}
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>{t('service.officialWebsite')}</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {isVerified && (
        <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>{t('service.verifiedOn', { date: service.source.lastVerifiedAt })}</span>
        </p>
      )}
    </Card>
  );
}
