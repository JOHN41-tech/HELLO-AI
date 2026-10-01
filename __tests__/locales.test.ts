import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'locales');
const LANGUAGE_CODES = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur'];

function flatten(obj: Record<string, unknown>, prefix = '', out: Record<string, unknown> = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value as Record<string, unknown>, fullKey, out);
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

function placeholders(value: unknown): string {
  return (String(value).match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');
}

const dictionaries = new Map<string, Record<string, unknown>>(
  LANGUAGE_CODES.map((code) => [
    code,
    flatten(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), 'utf8'))),
  ])
);

const english = dictionaries.get('en')!;
const englishKeys = Object.keys(english).sort();

describe('locale dictionaries', () => {
  it('parses every locale as valid JSON with no replacement characters', () => {
    for (const code of LANGUAGE_CODES) {
      const raw = fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), 'utf8');
      expect(() => JSON.parse(raw), `${code} must be valid JSON`).not.toThrow();
      expect(raw.includes('\uFFFD'), `${code} must not contain U+FFFD`).toBe(false);
    }
  });

  it('gives every locale exactly the same keys as English', () => {
    for (const code of LANGUAGE_CODES) {
      const keys = Object.keys(dictionaries.get(code)!).sort();
      expect(keys, `${code} key set must match en.json`).toEqual(englishKeys);
    }
  });

  it('preserves interpolation placeholders in every locale', () => {
    for (const code of LANGUAGE_CODES) {
      const dict = dictionaries.get(code)!;
      for (const key of englishKeys) {
        expect(placeholders(dict[key]), `${code}:${key}`).toBe(placeholders(english[key]));
      }
    }
  });

  it('has a non-empty string value for every key in every locale', () => {
    for (const code of LANGUAGE_CODES) {
      const dict = dictionaries.get(code)!;
      for (const key of englishKeys) {
        expect(typeof dict[key], `${code}:${key} must be a string`).toBe('string');
        expect(String(dict[key]).trim().length, `${code}:${key} must not be blank`).toBeGreaterThan(0);
      }
    }
  });
});