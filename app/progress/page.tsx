'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Trash2, CheckCircle2, User, FileText } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';

export default function ProgressPage() {
  const { language, currentConfig, setLanguage, t } = useLanguage();
  const { session, clearSession } = useSession(language);
  const [notification, setNotification] = useState<string | null>(null);

  const handleClear = async () => {
    await clearSession();
    setNotification(t('actions.sessionCleared'));
    setTimeout(() => setNotification(null), 4000);
  };

  const answersList = Object.entries(session.answers);
  const demoList = Object.entries(session.demographics);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" dir={currentConfig.direction} lang={currentConfig.code}>
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">{t('nav.progress')}</h1>
            <p className="text-xs text-slate-400">
              {t('progress.sessionId')}: <code className="text-emerald-300 font-mono">{session.sessionId}</code>
            </p>
          </div>
        </div>

        {notification && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Collected Information */}
        <Card className="border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-200">{t('progress.profileTitle')}</h2>
            <Badge variant="info">{t('progress.phaseBadge')}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('profile.language')}</span>
              <strong className="text-emerald-400 uppercase font-mono">{session.language}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('profile.age')}</span>
              <strong className="text-slate-100">
                {session.demographics.age !== undefined && session.demographics.age !== null
                  ? String(session.demographics.age)
                  : t('common.notProvided')}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('profile.state')}</span>
              <strong className="text-slate-100">{session.demographics.state || t('common.notProvided')}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t('profile.occupation')}</span>
              <strong className="text-slate-100">{session.demographics.occupation || t('common.notProvided')}</strong>
            </div>
          </div>

          {answersList.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('profile.userResponses')}
              </h3>
              <div className="space-y-1.5">
                {answersList.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-2 rounded-lg bg-slate-950 text-xs text-slate-300 border border-slate-800"
                  >
                    <span className="font-semibold text-slate-400">{key}:</span>
                    <span className="text-emerald-300 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Privacy & Security Foundation */}
        <Card className="border-teal-500/30 bg-slate-900/90 space-y-3">
          <div className="flex items-center gap-2 text-teal-300 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>{t('privacy.title')}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {t('privacy.intro')}
          </p>

          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ps-1">
            <li>{t('privacy.passwords')}</li>
            <li>{t('privacy.bankPasswords')}</li>
            <li>{t('privacy.aadhaar')}</li>
          </ul>

          <div className="pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={handleClear}
              className="border-red-500/40 text-red-300 hover:bg-red-950/40"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>{t('actions.clearSession')}</span>
            </Button>
          </div>
        </Card>
      </main>

      <Navigation />
    </div>
  );
}
