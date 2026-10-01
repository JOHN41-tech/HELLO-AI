import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  isValidLanguageCode,
} from '@/lib/i18n/languages';
import {
  translateKey,
  translateLocalizedText,
  interpolate,
} from '@/lib/i18n/localization';
import { detectLanguageFromQuery } from '@/lib/i18n/languageDetection';
import { ChatInputSchema, GuidedAnswerSchema } from '@/lib/validation/schemas';
import { dbAdapter } from '@/lib/database/memory-storage-adapter';
import { POST as sessionPost, GET as sessionGet } from '@/app/api/session/route';
import { POST as chatPost } from '@/app/api/chat/route';
import { LanguageCode, LocalizedText } from '@/types/language';
import { UserProfileSession } from '@/types/session';

describe('Regression Tests: Multilingual Architecture & Phase 1.5 Parity', () => {
  beforeEach(async () => {
    // Reset test sessions in database
    await dbAdapter.deleteSession('reg_session_test');
    await dbAdapter.deleteSession('reg_session_state');
  });

  // 1. Interpolation
  describe('1. Interpolation & Placeholder Handling', () => {
    it('correctly replaces single placeholder', () => {
      const res = interpolate('Hello, {name}!', { name: 'Antigravity' });
      expect(res).toBe('Hello, Antigravity!');
    });

    it('correctly replaces multiple placeholders in different positions', () => {
      const template = '{role} matched with {score}% on {date}';
      const res = interpolate(template, {
        role: 'Citizen',
        score: 95,
        date: '2026-10-01',
      });
      expect(res).toBe('Citizen matched with 95% on 2026-10-01');
    });

    it('leaves unsupplied placeholders intact without throwing or producing undefined', () => {
      const template = 'Verification for {field} at {score}%';
      const res = interpolate(template, { field: 'income' });
      expect(res).toBe('Verification for income at {score}%');
      expect(res).not.toContain('undefined');
    });

    it('handles empty template or empty parameters gracefully', () => {
      expect(interpolate('', { foo: 'bar' })).toBe('');
      expect(interpolate('No placeholders here', {})).toBe('No placeholders here');
    });

    it('works across canonical keys in all 13 locales with numeric and string values', () => {
      const locales: LanguageCode[] = [
        'en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur',
      ];
      for (const lang of locales) {
        const scoreStr = translateKey(lang, 'service.matchScore', { score: 88 });
        expect(scoreStr).toContain('88');
        expect(scoreStr).not.toContain('{score}');

        const dateStr = translateKey(lang, 'service.verifiedOn', { date: '2026-05-12' });
        expect(dateStr).toContain('2026-05-12');
        expect(dateStr).not.toContain('{date}');

        const docStr = translateKey(lang, 'documents.needToConfirm', { field: 'income' });
        expect(docStr).toContain('income');
        expect(docStr).not.toContain('{field}');
      }
    });
  });

  // 2. Localized Fallback
  describe('2. Localized Fallback Resolution', () => {
    it('returns exact requested language translation when present', () => {
      const text: LocalizedText = {
        en: 'Business Loan',
        ta: 'வணிகக் கடன்',
        hi: 'व्यापार ऋण',
      };
      expect(translateLocalizedText('ta', text)).toBe('வணிகக் கடன்');
      expect(translateLocalizedText('hi', text)).toBe('व्यापार ऋण');
    });

    it('falls back to English when target language is missing', () => {
      const text: LocalizedText = {
        en: 'Scholarship Scheme',
        ta: 'கல்வி உதவித்தொகை திட்டம்',
      };
      expect(translateLocalizedText('kn', text)).toBe('Scholarship Scheme');
      expect(translateLocalizedText('ur', text)).toBe('Scholarship Scheme');
    });

    it('falls back to English when target language has whitespace-only string', () => {
      const text: LocalizedText = {
        en: 'Empowerment Grant',
        hi: '   ',
      };
      expect(translateLocalizedText('hi', text)).toBe('Empowerment Grant');
    });

    it('falls back to first non-empty translation if English is missing or blank', () => {
      const text: LocalizedText = {
        en: '',
        ml: 'തൊഴിൽ സഹായം',
        te: '',
      };
      expect(translateLocalizedText('gu', text)).toBe('തൊഴിൽ സഹായം');
    });

    it('returns empty string if all translations are absent or empty', () => {
      expect(translateLocalizedText('en', null)).toBe('');
      expect(translateLocalizedText('ta', undefined)).toBe('');
      expect(translateLocalizedText('hi', { en: '', ta: '   ' })).toBe('');
    });
  });

  // 3. Shared Language Switching
  describe('3. Shared Language Switching & Configuration', () => {
    it('provides correct writing direction for Urdu (RTL) and others (LTR)', () => {
      expect(getLanguageConfig('ur').direction).toBe('rtl');

      const ltrCodes: LanguageCode[] = [
        'en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or',
      ];
      for (const code of ltrCodes) {
        expect(getLanguageConfig(code).direction).toBe('ltr');
      }
    });

    it('maps every supported language to a valid canonical BCP-47 locale', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const config = getLanguageConfig(lang.code);
        expect(config.locale).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
        expect(config.code).toBe(lang.code);
        expect(config.nativeName.length).toBeGreaterThan(0);
      }
    });
  });

  // 4. Locale Persistence
  describe('4. Locale Persistence via Session Storage & API', () => {
    it('sets canonical BCP-47 locale matching language on session POST', async () => {
      const req = new NextRequest('http://localhost:3000/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'reg_session_test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language: 'ta',
          demographics: { age: 30 },
          answers: {},
          currentStepIndex: 0,
        }),
      });

      const res = await sessionPost(req);
      expect(res.status).toBe(200);

      const saved = await dbAdapter.getSession('reg_session_test');
      expect(saved).not.toBeNull();
      expect(saved?.language).toBe('ta');
      expect(saved?.locale).toBe('ta-IN');
    });

    it('updates locale synchronously when session language changes', async () => {
      // First save as Hindi
      await dbAdapter.saveSession({
        sessionId: 'reg_session_test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: 'hi',
        locale: 'hi-IN',
        demographics: {},
        answers: {},
        currentStepIndex: 0,
      });

      // Update to Urdu
      const req = new NextRequest('http://localhost:3000/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'reg_session_test',
          language: 'ur',
          demographics: {},
          answers: {},
        }),
      });

      const res = await sessionPost(req);
      expect(res.status).toBe(200);

      const updated = await dbAdapter.getSession('reg_session_test');
      expect(updated?.language).toBe('ur');
      expect(updated?.locale).toBe('ur-IN');
    });
  });

  // 5. Structured Answer Persistence
  describe('5. Structured Guided Answer Persistence', () => {
    it('validates structured answer schema for numeric, string, and boolean values', () => {
      expect(GuidedAnswerSchema.safeParse({ fieldKey: 'age', value: 25 }).success).toBe(true);
      expect(GuidedAnswerSchema.safeParse({ fieldKey: 'state', value: 'Tamil Nadu' }).success).toBe(true);
      expect(GuidedAnswerSchema.safeParse({ fieldKey: 'hasBusinessPlan', value: true }).success).toBe(true);
    });

    it('persists structured answer through Chat API into session.answers without losing prior answers', async () => {
      // Initialize session with existing answers
      await dbAdapter.saveSession({
        sessionId: 'reg_session_test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: 'en',
        locale: 'en-IN',
        demographics: { age: 28 },
        answers: { priorKey: 'existing_val' },
        currentStepIndex: 0,
      });

      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'reg_session_test',
          language: 'en',
          answer: { fieldKey: 'state', value: 'Tamil Nadu' },
        }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(200);

      const session = await dbAdapter.getSession('reg_session_test');
      expect(session?.answers['priorKey']).toBe('existing_val');
      expect(session?.answers['state']).toBe('Tamil Nadu');
    });
  });

  // 6. No State Loss on Language Switches
  describe('6. No State Loss on Language Switches', () => {
    it('preserves all answers and demographics when chat endpoint processes request in new language', async () => {
      const initialSession: UserProfileSession = {
        sessionId: 'reg_session_state',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        language: 'en',
        locale: 'en-IN',
        demographics: { age: 34, state: 'Tamil Nadu', occupation: 'business' },
        answers: { field_1: 'val_1', field_2: true },
        currentStepIndex: 2,
      };
      await dbAdapter.saveSession(initialSession);

      // User switches to Tamil and sends a message
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'reg_session_state',
          language: 'ta',
          message: 'வணக்கம்',
        }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(200);

      const session = await dbAdapter.getSession('reg_session_state');
      expect(session).not.toBeNull();
      // Language and locale updated
      expect(session?.language).toBe('ta');
      expect(session?.locale).toBe('ta-IN');
      // Demographics and answers completely intact
      expect(session?.demographics.age).toBe(34);
      expect(session?.demographics.state).toBe('Tamil Nadu');
      expect(session?.demographics.occupation).toBe('business');
      expect(session?.answers['field_1']).toBe('val_1');
      expect(session?.answers['field_2']).toBe(true);
      expect(session?.currentStepIndex).toBe(2);
    });
  });

  // 7. Session Language Rejection
  describe('7. Session Language Rejection', () => {
    it('rejects unsupported language codes in POST /api/session with 400 status', async () => {
      const unsupported = ['xyz', 'fr', 'de', 'es', 'zh', 'invalid', '123'];

      for (const badCode of unsupported) {
        const req = new NextRequest('http://localhost:3000/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'reg_session_test',
            language: badCode,
          }),
        });

        const res = await sessionPost(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Invalid or unsupported language code');
      }
    });

    it('rejects unsupported language codes in ChatInputSchema', () => {
      const result = ChatInputSchema.safeParse({
        sessionId: 'reg_session_test',
        language: 'french',
        message: 'Bonjour',
      });
      expect(result.success).toBe(false);
    });

    it('accepts all 13 canonical language codes in ChatInputSchema', () => {
      const codes: LanguageCode[] = [
        'en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur',
      ];
      for (const code of codes) {
        const result = ChatInputSchema.safeParse({
          sessionId: 'reg_session_test',
          language: code,
          message: 'Hello',
        });
        expect(result.success).toBe(true);
      }
    });
  });

  // 8. Explicit-Language Detection Precedence
  describe('8. Explicit-Language Detection Precedence', () => {
    it('honors explicit non-English preference over script detection', () => {
      // If user chose Tamil, Devanagari text still respects explicit preference
      expect(detectLanguageFromQuery('नमस्ते', 'ta')).toBe('ta');
      // If user chose Hindi, Tamil script text still respects explicit preference
      expect(detectLanguageFromQuery('வணக்கம்', 'hi')).toBe('hi');
      // If user chose Urdu, Kannada script text still respects explicit preference
      expect(detectLanguageFromQuery('ನಮಸ್ಕಾರ', 'ur')).toBe('ur');
      // Latin transliteration respects explicit preference
      expect(detectLanguageFromQuery('vanakkam enakku help venum', 'ta')).toBe('ta');
    });

    it('triggers script detection when current preference is default English', () => {
      expect(detectLanguageFromQuery('வணக்கம்', 'en')).toBe('ta');
      expect(detectLanguageFromQuery('नमस्ते मुझे मदद चाहिए', 'en')).toBe('hi');
      expect(detectLanguageFromQuery('ನನಗೆ ಸಹಾಯ ಬೇಕು', 'en')).toBe('kn');
      expect(detectLanguageFromQuery('నాకు సహాయం కావాలి', 'en')).toBe('te');
      expect(detectLanguageFromQuery('എനിക്ക് സഹായം വേണം', 'en')).toBe('ml');
      expect(detectLanguageFromQuery('મને મદદ જોઈએ છે', 'en')).toBe('gu');
      expect(detectLanguageFromQuery('আমাকে সাহায্য করুন', 'en')).toBe('bn');
      expect(detectLanguageFromQuery('ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ', 'en')).toBe('pa');
      expect(detectLanguageFromQuery('মোক সহায় কৰক', 'en')).toBe('as');
      expect(detectLanguageFromQuery('ମୋତେ ସାହାଯ୍ୟ ଦରକାର', 'en')).toBe('or');
      expect(detectLanguageFromQuery('مجھے مدد چاہیے', 'en')).toBe('ur');
    });
  });
});
