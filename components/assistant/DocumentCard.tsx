'use client';

import React, { useId } from 'react';
import { DocumentItem } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { FileText, Circle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface DocumentCardProps {
  documents: DocumentItem[];
  language: LanguageCode;
}

export function DocumentCard({ documents, language }: DocumentCardProps) {
  const { t } = useLanguage();
  const headingId = useId();

  return (
    <Card className="my-3 bg-slate-900" role="region" aria-labelledby={headingId}>
      <div className="mb-3 flex items-center gap-2.5">
        <FileText className="h-5 w-5 text-emerald-400" aria-hidden="true" />
        <h3 id={headingId} className="text-base font-bold text-slate-100 sm:text-lg">{t('documents.title')}</h3>
      </div>
      <ul className="space-y-2.5">
        {documents.map((document) => {
          const name = translateLocalizedText(language, document.name);
          const description = translateLocalizedText(language, document.description);
          return (
            <li key={document.id} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3">
              <Circle className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold leading-snug text-slate-100">{name}</span>
                  <span className={`text-xs font-semibold ${document.required ? 'text-amber-300' : 'text-slate-500'}`}>
                    {document.required ? t('documents.required') : t('documents.optional')}
                  </span>
                </div>
                {description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
