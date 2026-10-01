'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LanguageCode } from '@/types/language';
import { getLanguageConfig, isValidLanguageCode, DEFAULT_LANGUAGE_CODE } from '@/lib/i18n/languages';
import { translateKey } from '@/lib/i18n/localization';

const STORAGE_KEY = 'hello_ai_language';

export interface LanguageContextValue {
  language: LanguageCode;
  locale: string;
  direction: 'ltr' | 'rtl';
  isRtl: boolean;
  currentConfig: ReturnType<typeof getLanguageConfig>;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE_CODE;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isValidLanguageCode(saved)) {
      return saved;
    }
  } catch {
    // localStorage can be unavailable in private/blocked contexts; English is a safe default.
  }

  return DEFAULT_LANGUAGE_CODE;
}

function applyDocumentLanguage(code: LanguageCode) {
  if (typeof document === 'undefined') {
    return;
  }
  const config = getLanguageConfig(code);
  document.documentElement.lang = config.code;
  document.documentElement.dir = config.direction;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server render and the first client render must agree, so start from the default
  // and adopt the persisted language in an effect.
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE_CODE);

  useEffect(() => {
    const stored = readStoredLanguage();
    // This effect intentionally hydrates browser-only persisted state after matching server/client markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguageState(stored);
    applyDocumentLanguage(stored);
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!isValidLanguageCode(lang)) {
      return;
    }

    setLanguageState(lang);
    applyDocumentLanguage(lang);

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Persistence is best-effort; the in-session switch still applies.
    }
  }, []);

  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>) =>
      translateKey(language, keyPath, params),
    [language]
  );

  const value = useMemo<LanguageContextValue>(() => {
    const config = getLanguageConfig(language);
    return {
      language,
      locale: config.locale,
      direction: config.direction,
      isRtl: config.direction === 'rtl',
      currentConfig: config,
      setLanguage,
      t,
    };
  }, [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
