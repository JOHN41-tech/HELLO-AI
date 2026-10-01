import { LanguageConfig, LanguageCode } from '@/types/language';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'ta',
    locale: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'hi',
    locale: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'te',
    locale: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'kn',
    locale: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'ml',
    locale: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    locale: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'gu',
    locale: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'bn',
    locale: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'pa',
    locale: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'as',
    locale: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'or',
    locale: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'ur',
    locale: 'ur-IN',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    enabled: true,
    flag: '🇮🇳',
  },
  {
    code: 'en',
    locale: 'en-IN',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    enabled: true,
    flag: '🇮🇳',
  },
];

export const DEFAULT_LANGUAGE_CODE: LanguageCode = 'en';

export function getLanguageConfig(code: string | null | undefined): LanguageConfig {
  if (typeof code !== 'string') {
    return getLanguageConfig(DEFAULT_LANGUAGE_CODE);
  }
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return (
    found || {
      code: 'en',
      locale: 'en-IN',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      enabled: true,
      flag: '🇮🇳',
    }
  );
}

export function isValidLanguageCode(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code && l.enabled);
}
