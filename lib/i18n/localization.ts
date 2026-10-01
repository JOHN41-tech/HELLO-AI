import { LanguageCode, LocalizedText } from '@/types/language';

import en from '@/locales/en.json';
import ta from '@/locales/ta.json';
import hi from '@/locales/hi.json';
import te from '@/locales/te.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';
import mr from '@/locales/mr.json';
import gu from '@/locales/gu.json';
import bn from '@/locales/bn.json';
import pa from '@/locales/pa.json';
import as from '@/locales/as.json';
import or from '@/locales/or.json';
import ur from '@/locales/ur.json';

const LOCALES: Record<LanguageCode, Record<string, any>> = {
  en,
  ta,
  hi,
  te,
  kn,
  ml,
  mr,
  gu,
  bn,
  pa,
  as,
  or,
  ur,
};

function getNested(dictionary: Record<string, any> | undefined, keys: string[]): string | undefined {
  let value: any = dictionary;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

/**
 * Replaces `{placeholder}` tokens in a template string with provided parameters.
 * Leaves unsupplied placeholders intact without throwing or producing undefined.
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!template || !params) {
    return template;
  }

  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key] ?? ''));
  }, template);
}

/**
 * Resolves a nested translation key like "welcome.title" or "nav.home" for a target language.
 * Fallback priority: Selected Language -> English -> Raw Key.
 *
 * Placeholders such as {count} are replaced from `params` after resolution so that
 * interpolated text stays in the same locale as the surrounding sentence.
 */
export function translateKey(
  lang: LanguageCode,
  keyPath: string,
  params?: Record<string, string | number>
): string {
  const keys = keyPath.split('.');
  const resolved = getNested(LOCALES[lang], keys) ?? getNested(LOCALES['en'], keys);

  if (typeof resolved !== 'string') {
    return keyPath;
  }

  if (!params) {
    return resolved;
  }

  return interpolate(resolved, params);
}

/**
 * Resolves authored service/content text for a language.
 *
 * Content is authored incrementally, so any translation that has not been written yet
 * resolves to English instead of rendering blank. Business logic never depends on this.
 */
export function translateLocalizedText(
  lang: LanguageCode,
  text?: LocalizedText | null
): string {
  if (!text) {
    return '';
  }

  const candidate = text[lang];
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }

  const english = text.en;
  if (typeof english === 'string' && english.trim().length > 0) {
    return english;
  }

  const firstAvailable = Object.values(text).find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );

  return firstAvailable ?? '';
}
