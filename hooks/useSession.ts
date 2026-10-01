'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfileSession, UserDemographics } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { getOrCreateBrowserSessionId } from '@/lib/session/session-id';

export function useSession(currentLanguage: LanguageCode) {
  const langConfig = getLanguageConfig(currentLanguage);

  const [session, setSession] = useState<UserProfileSession>({
    sessionId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: currentLanguage,
    locale: langConfig.locale,
    demographics: {},
    answers: {},
    currentStepIndex: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      setIsLoading(true);
      const sessionId = getOrCreateBrowserSessionId();
      const existing = await dbAdapter.getSession(sessionId);
      if (cancelled) return;

      if (existing) {
        // Language updates only presentation; history, collected facts, and progress remain.
        setSession({
          ...existing,
          sessionId,
          language: currentLanguage,
          locale: langConfig.locale,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newSession: UserProfileSession = {
          sessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language: currentLanguage,
          locale: langConfig.locale,
          demographics: {},
          answers: {},
          currentStepIndex: 0,
        };
        await dbAdapter.saveSession(newSession);
        if (cancelled) return;
        setSession(newSession);
      }
      setIsLoading(false);
    }
    void loadSession();
    return () => { cancelled = true; };
  }, [currentLanguage, langConfig.locale]);

  const updateDemographics = useCallback(
    async (demographics: Partial<UserDemographics>) => {
      setSession((prev) => {
        const updated: UserProfileSession = {
          ...prev,
          demographics: { ...prev.demographics, ...demographics },
          updatedAt: new Date().toISOString(),
        };
        void dbAdapter.saveSession(updated);
        return updated;
      });
    },
    []
  );

  const updateAnswer = useCallback(
    async (fieldKey: string, value: string | number | boolean) => {
      setSession((prev) => {
        const updatedAnswers = { ...prev.answers, [fieldKey]: value };
        const updatedDemographics = { ...prev.demographics };

        if (fieldKey === 'age') updatedDemographics.age = Number(value);
        if (fieldKey === 'state') updatedDemographics.state = String(value);
        if (fieldKey === 'gender') updatedDemographics.gender = value as 'female' | 'male' | 'other';
        if (fieldKey === 'income' || fieldKey === 'annualIncome')
          updatedDemographics.annualIncome = Number(value);

        const updated: UserProfileSession = {
          ...prev,
          demographics: updatedDemographics,
          answers: updatedAnswers,
          updatedAt: new Date().toISOString(),
        };
        void dbAdapter.saveSession(updated);
        return updated;
      });
    },
    []
  );

  const clearSession = useCallback(async () => {
    const sessionId = session.sessionId;
    if (!sessionId) return;
    await dbAdapter.deleteSession(sessionId);
    try {
      await fetch(`/api/session?sessionId=${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
    } catch {
      // Local deletion remains available when offline; server-side deletion is best effort.
    }
    const fresh: UserProfileSession = {
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: currentLanguage,
      locale: langConfig.locale,
      demographics: {},
      answers: {},
      currentStepIndex: 0,
    };
    await dbAdapter.saveSession(fresh);
    setSession(fresh);
  }, [session.sessionId, currentLanguage, langConfig.locale]);

  return { session, isLoading, updateDemographics, updateAnswer, clearSession };
}
