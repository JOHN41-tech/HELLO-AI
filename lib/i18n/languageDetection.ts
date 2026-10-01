import { LanguageCode } from '@/types/language';
import { isValidLanguageCode, DEFAULT_LANGUAGE_CODE } from './languages';

/**
 * Lightweight script detection utility.
 *
 * An explicit language choice always wins: if the user picked a language in the UI we
 * honour it even when the query is typed in another script. Script detection is only a
 * fallback for users still on the default language, so the first free-text message can
 * switch the interface without anyone touching the selector.
 */
export function detectLanguageFromQuery(query: string, preferredLang: LanguageCode): LanguageCode {
  if (!isValidLanguageCode(preferredLang)) {
    preferredLang = DEFAULT_LANGUAGE_CODE;
  }

  if (!query || !query.trim()) return preferredLang;

  // An explicit non-default selection is a deliberate choice, not a guess.
  if (preferredLang !== DEFAULT_LANGUAGE_CODE) return preferredLang;

  // Unicode Script Ranges
  const tamilRegex = /[\u0B80-\u0BFF]/;
  const devanagariRegex = /[\u0900-\u097F]/; // Hindi / Marathi
  const teluguRegex = /[\u0C00-\u0C7F]/;
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  const gujaratiRegex = /[\u0A80-\u0AFF]/;
  const assameseUniqueRegex = /[\u09F0\u09F1]/; // Assamese specific letters (ৰ, ৱ)
  const bengaliAssameseRegex = /[\u0980-\u09FF]/; // Bengali / Eastern Nagari
  const gurmukhiRegex = /[\u0A00-\u0A7F]/; // Punjabi
  const odiaRegex = /[\u0B00-\u0B7F]/;
  const arabicUrduRegex = /[\u0600-\u06FF]/;

  if (tamilRegex.test(query)) return 'ta';
  if (teluguRegex.test(query)) return 'te';
  if (kannadaRegex.test(query)) return 'kn';
  if (malayalamRegex.test(query)) return 'ml';
  if (gujaratiRegex.test(query)) return 'gu';
  if (assameseUniqueRegex.test(query)) return 'as';
  if (bengaliAssameseRegex.test(query)) return 'bn';
  if (gurmukhiRegex.test(query)) return 'pa';
  if (odiaRegex.test(query)) return 'or';
  if (arabicUrduRegex.test(query)) return 'ur';
  if (devanagariRegex.test(query)) return 'hi';

  // Latin script (e.g. transliterated "enakku help venum") carries no script signal,
  // so the current preference stands.
  return preferredLang;
}
