import { describe, expect, it, vi } from 'vitest';
import { GeminiAIService } from '@/lib/ai/gemini-ai-service';
import { UserProfileSession } from '@/types/session';
import { LanguageCode } from '@/types/language';
import { AI_INTENT_CATEGORIES } from '@/lib/ai/schemas/chat-turn';

const supportedLanguages: LanguageCode[] = [
  'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'as', 'or', 'ur', 'en',
];

function makeSession(language: LanguageCode = 'ta'): UserProfileSession {
  const now = new Date().toISOString();
  return {
    sessionId: 'private-session-id-not-for-gemini',
    createdAt: now,
    updatedAt: now,
    language,
    locale: `${language}-IN`,
    demographics: { age: 28 },
    answers: {},
    currentStepIndex: 0,
  };
}

function validTurn(overrides: Record<string, unknown> = {}) {
  return {
    intentCategory: 'BUSINESS_SUPPORT',
    userNeedSummary: 'Start a home tailoring business',
    confidence: 0.91,
    extractedInformation: [{ fieldKey: 'businessType', value: 'tailoring' }],
    nextAction: 'ASK_REQUIRED_INFORMATION',
    responseText: 'What state do you live in?',
    question: { fieldKey: 'state', text: 'Which state do you live in?', inputType: 'text' },
    serviceId: 'tn-women-startup-grant',
    ...overrides,
  };
}

function mockClient(responses: Array<{ text?: string | null } | Error>) {
  const generateContent = vi.fn(async (_request: unknown) => {
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next ?? {};
  });
  return { client: { models: { generateContent } }, generateContent };
}

describe('GeminiAIService', () => {
  it('sends schema-constrained server requests with language context and no session identifier', async () => {
    const fake = mockClient([{ text: JSON.stringify(validTurn()) }]);
    const service = new GeminiAIService('test-only-key', fake.client as never);
    const result = await service.generateResponse(
      'Enakku small business start panna help venum',
      makeSession('ta'),
      'ta',
      [{ role: 'user', content: 'I am 28', language: 'en', timestamp: new Date().toISOString() }]
    );

    expect(result.provider).toBe('gemini');
    expect(result.message).toBe(result.responseText);
    expect(result.message).toBe('What state do you live in?');
    expect(result.question?.fieldKey).toBe('state');

    const request = fake.generateContent.mock.calls[0][0] as unknown as {
      contents: string;
      config: Record<string, unknown>;
    };
    expect(request.contents).toContain('ta-IN');
    expect(request.contents).toContain('Enakku small business start panna help venum');
    expect(request.contents).not.toContain('private-session-id-not-for-gemini');
    expect(request.config.responseMimeType).toBe('application/json');
    expect(request.config.responseJsonSchema).toBeTruthy();
    expect(JSON.stringify(request)).not.toContain('test-only-key');
  });

  it('keeps the same conversation architecture for all supported languages', async () => {
    for (const language of supportedLanguages) {
      const fake = mockClient([{ text: JSON.stringify(validTurn({ responseText: `response-${language}`, question: null })) }]);
      const service = new GeminiAIService('test-only-key', fake.client as never);
      const result = await service.generateResponse('I need help', makeSession(language), language, []);
      expect(result.provider, language).toBe('gemini');
      expect(result.responseText, language).toBe(`response-${language}`);
    }
    expect(AI_INTENT_CATEGORIES).toHaveLength(12);
  });

  it('retries invalid structured output once and validates the successful response', async () => {
    const fake = mockClient([
      { text: '{invalid-json' },
      { text: JSON.stringify(validTurn({ question: null })) },
    ]);
    const service = new GeminiAIService('test-only-key', fake.client as never);
    const result = await service.generateResponse('I need a small business loan', makeSession(), 'ta', []);
    expect(fake.generateContent).toHaveBeenCalledTimes(2);
    expect(result.provider).toBe('gemini');
  });

  it('rejects invalid schema values after the bounded retry and returns a safe localized fallback', async () => {
    const fake = mockClient([
      { text: JSON.stringify(validTurn({ intentCategory: 'MAKE_UP_A_SCHEME' })) },
      { text: JSON.stringify(validTurn({ intentCategory: 'MAKE_UP_A_SCHEME' })) },
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const service = new GeminiAIService('test-only-key', fake.client as never);
    const result = await service.generateResponse('Need help', makeSession('ur'), 'ur', []);

    expect(fake.generateContent).toHaveBeenCalledTimes(2);
    expect(result.provider).toBe('fallback');
    expect(result.responseText).toBeTruthy();
    expect(result.message).toBe(result.responseText);
    expect(result.message).not.toContain('MAKE_UP_A_SCHEME');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('test-only-key');
    warn.mockRestore();
  });

  it('returns a safe fallback when no API key is configured', async () => {
    const service = new GeminiAIService(undefined);
    const result = await service.generateResponse('Need help', makeSession('en'), 'en', []);
    expect(result.provider).toBe('fallback');
    expect(result.nextAction).toBe('general_response');
    expect(result.responseText).toContain('verified government services');
    expect(result.responseText).not.toContain('internet connection');
  });

  it('uses verified catalog facts after an upstream outage instead of a generic error', async () => {
    const fake = mockClient([new Error('service unavailable'), new Error('service unavailable')]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const service = new GeminiAIService('test-only-key', fake.client as never);
    const result = await service.generateResponse('What documents do I need for PMEGP?', makeSession('en'), 'en', []);

    expect(result.provider).toBe('fallback');
    expect(result.serviceId).toBe('pmegp-new-enterprise');
    expect(result.responseText).toContain('does not include a confirmed document list');
    expect(result.responseText).not.toContain('internet connection');
    expect(fake.generateContent).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('forwards service-required fields to deterministic question generation', async () => {
    const service = new GeminiAIService(undefined);
    const question = await service.generateQuestion(makeSession('en'), 'en', ['businessStatus']);
    expect(question?.fieldKey).toBe('businessStatus');
    expect(question?.options?.map((option) => option.value)).toContain('new');
  });
});
