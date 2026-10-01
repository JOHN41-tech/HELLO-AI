'use client';

import React from 'react';
import { GovernmentService } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, ExternalLink, Award } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface ServiceCardProps {
  service: GovernmentService;
  language: LanguageCode;
  matchScore?: number;
}

export function ServiceCard({ service, language, matchScore = 100 }: ServiceCardProps) {
  const { t } = useLanguage();
  const name = translateLocalizedText(language, service.name);
  const desc = translateLocalizedText(language, service.description);
  const targetUsers = translateLocalizedText(language, service.targetUsers);

  return (
    <Card className="border-emerald-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 my-4 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <Badge variant="verified" className="flex items-center gap-1 text-teal-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{service.source.authorityName}</span>
        </Badge>
        {matchScore > 0 && (
          <Badge variant={matchScore >= 80 ? 'success' : 'warning'} className="font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{t('service.matchScore', { score: matchScore })}</span>
          </Badge>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
        {name}
      </h2>

      <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">{desc}</p>

      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
        <strong className="text-slate-200">{t('service.targetAudience')}</strong> {targetUsers}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <span>{t('service.verifiedOn', { date: service.source.lastVerifiedAt })}</span>
        <a
          href={service.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold focus-visible:outline-none"
        >
          <span>{t('service.officialWebsite')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </Card>
  );
}
