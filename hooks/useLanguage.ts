'use client';

/**
 * Language state lives in a single React context so a language change propagates to
 * every mounted component at once. The previous per-component implementation meant a
 * switch in one place left the rest of the UI in the previous language.
 */
export {
  LanguageProvider,
  useLanguage,
  type LanguageContextValue,
} from '@/contexts/LanguageContext';