'use client';

import React from 'react';
import { DocumentItem } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { Card } from '@/components/ui/Card';
import { FileText, CheckSquare } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateLocalizedText } from '@/lib/i18n/localization';

export interface DocumentCardProps {
  documents: DocumentItem[];
  language: LanguageCode;
}

export function DocumentCard({ documents, language }: DocumentCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="border-slate-800 bg-slate-900/90 my-3">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-teal-400" />
        <h3 className="text-base sm:text-lg font-bold text-slate-100">{t('documents.title')}</h3>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => {
          const name = translateLocalizedText(language, doc.name);
          const desc = translateLocalizedText(language, doc.description);

          return (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
            >
              <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-200">{name}</span>
                  {doc.required ? (
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                      {t('documents.required')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      {t('documents.optional')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
