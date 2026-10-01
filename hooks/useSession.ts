'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfileSession, UserDemographics } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';

const DEFAULT_SESSION_ID = 'session_default_user';

export function useSession(currentLanguage: LanguageCode) {
  const langConfig = getLanguageConfig(currentLanguage);

  const [session, setSession] = useState<UserProfileSession>({
    sessionId: DEFAULT_SESSION_ID,
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
    async function loadSession() {
      setIsLoading(true);
      const existing = await dbAdapter.getSession(DEFAULT_SESSION_ID);
      if (existing) {
        // Language update without resetting conversation/demographics
        setSession({
          ...existing,
          language: currentLanguage,
          locale: langConfig.locale,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newSession: UserProfileSession = {
          sessionId: DEFAULT_SESSION_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language: currentLanguage,
          locale: langConfig.locale,
          demographics: {},
          answers: {},
          currentStepIndex: 0,
        };
        await dbAdapter.saveSession(newSession);
        setSession(newSession);
      }
      setIsLoading(false);
    }
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  const updateDemographics = useCallback(
    async (demographics: Partial<UserDemographics>) => {
      setSession((prev) => {
        const updated: UserProfileSession = {
          ...prev,
          demographics: { ...prev.demographics, ...demographics },
          updatedAt: new Date().toISOString(),
        };
        dbAdapter.saveSession(updated);
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
        dbAdapter.saveSession(updated);
        return updated;
      });
    },
    []
  );

  const clearSession = useCallback(async () => {
    await dbAdapter.deleteSession(DEFAULT_SESSION_ID);
    const fresh: UserProfileSession = {
      sessionId: DEFAULT_SESSION_ID,
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
  }, [currentLanguage, langConfig.locale]);

  return { session, isLoading, updateDemographics, updateAnswer, clearSession };
}
