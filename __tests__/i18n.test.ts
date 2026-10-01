import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, getLanguageConfig, isValidLanguageCode } from '../lib/i18n/languages';
import { translateKey, translateLocalizedText } from '../lib/i18n/localization';
import { detectLanguageFromQuery } from '../lib/i18n/languageDetection';
import { LanguageCode, LocalizedText } from '../types/language';

const REQUIRED_UI_KEYS = [
  'appName',
  'tagline',
  'welcome.title',
  'welcome.start',
  'welcome.chooseLanguage',
  'assistant.placeholder',
  'assistant.listen',
  'conversation.thinking',
  'eligibility.potentiallyEligible',
  'errors.generic',
  'errors.voiceUnavailable',
  'errors.network',
];

describe('Phase 1.5 — Language Configuration', () => {
  it('should have exactly 13 languages (12 Indian + English)', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(13);
  });

  it('should contain all 12 Indian target language codes', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    const required: LanguageCode[] = ['ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur'];
    required.forEach((code) => {
      expect(codes).toContain(code);
    });
  });

  it('should have English as fallback language', () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toContain('en');
  });
});

describe('Phase 1.5 — Language Validation', () => {
  const validCodes: LanguageCode[] = ['ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur', 'en'];
  const invalidCodes = ['xyz', 'zh', 'fr', 'de', '', 'XX'];

  validCodes.forEach((code) => {
    it(`should accept valid code: ${code}`, () => {
      expect(isValidLanguageCode(code)).toBe(true);
    });
  });

  invalidCodes.forEach((code) => {
    it(`should reject invalid code: "${code}"`, () => {
      expect(isValidLanguageCode(code)).toBe(false);
    });
  });
});

describe('Phase 1.5 — Locale Mapping', () => {
  const expectedLocales: [LanguageCode, string][] = [
    ['ta', 'ta-IN'],
    ['hi', 'hi-IN'],
    ['te', 'te-IN'],
    ['kn', 'kn-IN'],
    ['ml', 'ml-IN'],
    ['mr', 'mr-IN'],
    ['gu', 'gu-IN'],
    ['bn', 'bn-IN'],
    ['pa', 'pa-IN'],
    ['as', 'as-IN'],
    ['or', 'or-IN'],
    ['ur', 'ur-IN'],
    ['en', 'en-IN'],
  ];

  expectedLocales.forEach(([code, expectedLocale]) => {
    it(`${code} should map to locale ${expectedLocale}`, () => {
      const config = getLanguageConfig(code);
      expect(config.locale).toBe(expectedLocale);
    });
  });
});

describe('Phase 1.5 — Text Direction', () => {
  it('ur should be RTL', () => {
    expect(getLanguageConfig('ur').direction).toBe('rtl');
  });

  const ltrCodes: LanguageCode[] = ['ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'en'];
  ltrCodes.forEach((code) => {
    it(`${code} should be LTR`, () => {
      expect(getLanguageConfig(code).direction).toBe('ltr');
    });
  });
});

describe('Phase 1.5 — Localization Keys', () => {
  const languages: LanguageCode[] = ['ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur'];

  languages.forEach((lang) => {
    REQUIRED_UI_KEYS.forEach((key) => {
      it(`${lang}: key "${key}" should resolve to a non-empty string`, () => {
        const result = translateKey(lang, key);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        // Should not return the raw key itself
        expect(result).not.toBe(key);
      });
    });
  });
});

describe('Phase 1.5 — Interpolation', () => {
  it('should substitute {score} in service.matchScore', () => {
    expect(translateKey('en', 'service.matchScore', { score: 85 })).toBe('85% Match');
  });

  it('should substitute {date} in service.verifiedOn', () => {
    const result = translateKey('ta', 'service.verifiedOn', { date: '2026-01-15' });
    expect(result).toContain('2026-01-15');
    expect(result).not.toContain('{date}');
  });

  it('should substitute {field} in documents.needToConfirm', () => {
    expect(translateKey('en', 'documents.needToConfirm', { field: 'income' })).toBe(
      'Need to confirm your income'
    );
  });

  it('should leave unrelated placeholders untouched rather than printing undefined', () => {
    const result = translateKey('en', 'service.matchScore');
    expect(result).toBe('{score}% Match');
    expect(result).not.toContain('undefined');
  });
});

describe('Phase 1.5 — Localized Text Fallback', () => {
  const partial: LocalizedText = { en: 'Startup India', ta: 'ஸ்டார்ட்அப் இந்தியா' };

  it('should return the requested language when present', () => {
    expect(translateLocalizedText('ta', partial)).toBe('ஸ்டார்ட்அப் இந்தியா');
  });

  it('should fall back to English when the requested language is absent', () => {
    expect(translateLocalizedText('kn', partial)).toBe('Startup India');
  });

  it('should fall back to the first non-empty translation when English is blank', () => {
    const gapped: LocalizedText = { en: '', ta: 'முதல்', hi: '' };
    expect(translateLocalizedText('kn', gapped)).toBe('முதல்');
  });

  it('should return an empty string when no translation has content', () => {
    expect(translateLocalizedText('en', { en: '' })).toBe('');
  });
});

describe('Phase 1.5 — Language Detection', () => {
  it('should detect Tamil from Tamil script text', () => {
    expect(detectLanguageFromQuery('எனக்கு உதவி வேண்டும்', 'en')).toBe('ta');
  });

  it('should detect Hindi from Devanagari script', () => {
    expect(detectLanguageFromQuery('मुझे मदद चाहिए', 'en')).toBe('hi');
  });

  it('should detect Telugu from Telugu script', () => {
    expect(detectLanguageFromQuery('నాకు సహాయం కావాలి', 'en')).toBe('te');
  });

  it('should detect Kannada from Kannada script', () => {
    expect(detectLanguageFromQuery('ನನಗೆ ಸಹಾಯ ಬೇಕು', 'en')).toBe('kn');
  });

  it('should detect Malayalam from Malayalam script', () => {
    expect(detectLanguageFromQuery('എനിക്ക് സഹായം വേണം', 'en')).toBe('ml');
  });

  it('should detect Urdu from Arabic script', () => {
    expect(detectLanguageFromQuery('مجھے مدد چاہیے', 'en')).toBe('ur');
  });

  it('should retain user preferred language for Latin-script input (transliteration)', () => {
    expect(detectLanguageFromQuery('enakku help venum', 'ta')).toBe('ta');
    expect(detectLanguageFromQuery('mujhe madad chahiye', 'hi')).toBe('hi');
  });

  it('should return fallback language for empty input', () => {
    expect(detectLanguageFromQuery('', 'ta')).toBe('ta');
  });

  it('should honour an explicit non-default selection over script detection', () => {
    expect(detectLanguageFromQuery('எனக்கு உதவி வேண்டும்', 'hi')).toBe('hi');
    expect(detectLanguageFromQuery('मुझे मदद चाहिए', 'ta')).toBe('ta');
    expect(detectLanguageFromQuery('ನನಗೆ ಸಹಾಯ ಬೇಕು', 'ur')).toBe('ur');
  });

  it('should still detect by script when English is the current preference', () => {
    expect(detectLanguageFromQuery('ನನಗೆ ಸಹಾಯ ಬೇಕು', 'en')).toBe('kn');
  });
});
