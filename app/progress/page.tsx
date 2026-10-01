'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Trash2, CheckCircle2, UserRound, FileText } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';

export default function ProgressPage() {
  const { language, currentConfig, setLanguage, t } = useLanguage();
  const { session, isLoading, clearSession } = useSession(language);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const handleClear = async () => {
    await clearSession();
    setNotification(t('actions.sessionCleared'));
  };

  const detailRows = [
    { label: t('profile.language'), value: currentConfig.nativeName },
    { label: t('profile.age'), value: session.demographics.age === undefined ? t('common.notProvided') : String(session.demographics.age) },
    { label: t('profile.state'), value: session.demographics.state || t('common.notProvided') },
    { label: t('profile.occupation'), value: session.demographics.occupation || t('common.notProvided') },
  ];
  const answerLabel = (field: string) => {
    const knownLabels: Record<string, string> = {
      age: t('profile.age'),
      state: t('profile.state'),
      occupation: t('profile.occupation'),
      annualIncome: t('profile.annualIncome'),
      income: t('profile.annualIncome'),
      gender: t('profile.gender'),
      projectStatus: t('profile.projectStatus'),
      businessStatus: t('profile.projectStatus'),
    };
    return knownLabels[field] ?? field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950 text-emerald-400">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">{t('app.navigatorLabel')}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-100">{t('nav.progress')}</h1>
          </div>
        </header>

        {notification && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950 px-4 py-3 text-sm leading-relaxed text-emerald-400" role="status" aria-live="polite">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{notification}</span>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-8 text-center text-sm text-slate-500" role="status" aria-live="polite">
            {t('service.loading')}
          </div>
        ) : (
          <>
            <Card className="space-y-4 bg-slate-900" role="region" aria-labelledby="shared-info-title">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <h2 id="shared-info-title" className="text-base font-bold text-slate-100 sm:text-lg">{t('progress.profileTitle')}</h2>
              </div>

              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {detailRows.map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3">
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-100">{value}</dd>
                  </div>
                ))}
              </dl>

              {Object.keys(session.answers).length > 0 ? (
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-300">{t('profile.userResponses')}</h3>
                  <dl className="space-y-2">
                    {Object.entries(session.answers).map(([key, value]) => (
                      <div key={key} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-sm">
                        <dt className="font-medium text-slate-500">{answerLabel(key)}</dt>
                        <dd className="max-w-full break-words font-semibold text-slate-200">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <p className="rounded-xl bg-slate-950 px-3.5 py-3 text-sm text-slate-500">{t('common.notProvided')}</p>
              )}
            </Card>

            <Card className="space-y-4 border-teal-500/30 bg-slate-900" role="region" aria-labelledby="privacy-heading">
              <div className="flex items-center gap-2 text-slate-100">
                <ShieldCheck className="h-5 w-5 text-teal-400" aria-hidden="true" />
                <h2 id="privacy-heading" className="text-base font-bold sm:text-lg">{t('privacy.title')}</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{t('privacy.intro')}</p>
              <ul className="list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-slate-500">
                <li>{t('privacy.passwords')}</li>
                <li>{t('privacy.bankPasswords')}</li>
                <li>{t('privacy.aadhaar')}</li>
              </ul>
              <div className="border-t border-slate-800 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClear}
                  className="border-red-500/40 text-red-400 hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>{t('actions.clearSession')}</span>
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
      <Navigation />
    </div>
  );
}
