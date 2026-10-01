export type LanguageCode =
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'gu'
  | 'bn'
  | 'pa'
  | 'as'
  | 'or'
  | 'ur'
  | 'en';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageConfig {
  code: LanguageCode;
  locale: string;
  name: string;
  nativeName: string;
  direction: TextDirection;
  enabled: boolean;
  flag: string;
}

/**
 * Language-indexed text.
 *
 * Deliberately partial: government service content is authored incrementally,
 * so a missing translation must fall back to English at runtime instead of
 * being a type error that blocks authoring.
 */
export type LocalizedText = Partial<Record<LanguageCode, string>>;
