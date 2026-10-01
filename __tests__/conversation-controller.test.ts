import { afterEach, describe, expect, it, vi } from 'vitest';
import { processConversationTurn } from '@/lib/ai/conversation/conversation-controller';
import { AIService } from '@/types/ai';
import { UserProfileSession } from '@/types/session';
import { GuidedQuestion } from '@/types/conversation';
import { GovernmentService } from '@/types/service';
import { SAMPLE_GOVERNMENT_SERVICES } from '@/data/services/sample-services';
import { serviceRepository } from '@/lib/services/service-repository';
import { EligibilityEngine } from '@/lib/eligibility/eligibility-engine';
import { MockAIService } from '@/lib/ai/mock-ai-service';
import { GeminiAIService } from '@/lib/ai/gemini-ai-service';

afterEach(() => vi.restoreAllMocks());

function session(overrides: Partial<UserProfileSession> = {}): UserProfileSession {
  const now = new Date().toISOString();
  return {
    sessionId: 'controller-test',
    createdAt: now,
    updatedAt: now,
    language: 'en',
    locale: 'en-IN',
    demographics: {},
    answers: {},
    currentStepIndex: 0,
    ...overrides,
  };
}

function question(fieldKey: string): GuidedQuestion {
  return {
    id: `question-${fieldKey}`,
    fieldKey,
    prompt: { en: `What is your ${fieldKey}?` },
    inputType: fieldKey === 'age' ? 'number' : 'text',
    required: true,
  };
}

function provider(response: Awaited<ReturnType<AIService['generateResponse']>>): AIService {
  return {
    understandIntent: vi.fn(),
    generateQuestion: vi.fn(),
    generateResponse: vi.fn(async () => response),
    summarizeUserNeed: vi.fn(),
    explainEligibility: vi.fn(),
    explainDocument: vi.fn(),
    generateGuidance: vi.fn(),
  };
}

function useVerifiedBusinessRecord() {
  const sample = SAMPLE_GOVERNMENT_SERVICES.find((service) => service.id === 'tn-women-startup-grant')!;
  const verified: GovernmentService = {
    ...sample,
    officialUrl: 'https://www.example.gov.in/service',
    source: {
      ...sample.source,
      verificationStatus: 'verified',
      officialUrl: 'https://www.example.gov.in/service',
    },
  };
  vi.spyOn(serviceRepository, 'getServiceById').mockImplementation(async (id) => id === verified.id ? verified : null);
  vi.spyOn(serviceRepository, 'checkEligibility').mockImplementation(async (id, profile) =>
    id === verified.id ? EligibilityEngine.evaluateService(verified, profile) : null
  );
  return verified;
}

const intent = {
  category: 'BUSINESS_SUPPORT',
  userNeedSummary: 'Start a small tailoring business',
  confidence: 0.9,
  extractedFields: { age: '28', state: 'Tamil Nadu', password: 'must-not-save', aadhaar: 'must-not-save' },
};

describe('conversation controller', () => {
  it('uses allowlisted extracted values and asks only a service-required missing field', async () => {
    useVerifiedBusinessRecord();
    const profile = session();
    const response = await processConversationTurn({
      message: 'I am 28 and live in Tamil Nadu; I want a tailoring business.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'Could you tell me your gender?',
        responseText: 'Could you tell me your gender?',
        provider: 'gemini',
        intent,
        serviceId: 'tn-women-startup-grant',
        question: question('gender'),
        nextAction: 'ASK_REQUIRED_INFORMATION',
      }),
    });

    expect(profile.demographics.age).toBe(28);
    expect(profile.demographics.state).toBe('Tamil Nadu');
    expect(profile.answers.password).toBeUndefined();
    expect(profile.answers.aadhaar).toBeUndefined();
    expect(response.question?.fieldKey).toBe('gender');
    expect(response.suggestedService).toBeUndefined();
    expect(profile.missingInformation).toContain('gender');
    expect(response.responseText).toBeTruthy();
  });

  it('labels demo catalog data and never returns an eligibility result from sample rules', async () => {
    const profile = session({ demographics: { age: 28, state: 'Tamil Nadu', gender: 'female' } });
    const response = await processConversationTurn({
      message: 'I am 28, a woman in Tamil Nadu, and want to start tailoring.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'I found a possible match in the available catalog.',
        responseText: 'I found a possible match in the available catalog.',
        provider: 'gemini',
        intent: { ...intent, extractedFields: {} },
        serviceId: 'tn-women-startup-grant',
        nextAction: 'SHOW_SERVICE',
      }),
    });

    expect(response.suggestedService?.id).toBe('tn-women-startup-grant');
    expect(response.eligibilityResult).toBeUndefined();
    expect(response.suggestedService?.source.verificationStatus).toBe('sample_mock');
    expect(response.suggestedService?.officialUrl).toBe('');
    expect(response.suggestedService?.requiredDocuments).toHaveLength(0);
    expect(response.suggestedService?.applicationSteps).toHaveLength(0);
    expect(response.question).toBeUndefined();
    expect(response.responseText).toContain('not verified');
    expect(profile.currentStage).toBe('DEMO_SAMPLE_ONLY');
    expect(profile.selectedServiceId).toBe('tn-women-startup-grant');
  });

  it('uses deterministic eligibility status for a verified record instead of generated claims', async () => {
    useVerifiedBusinessRecord();
    const profile = session({ demographics: { age: 28, state: 'Tamil Nadu', gender: 'female' } });
    const response = await processConversationTurn({
      message: 'I want to start a tailoring business.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'You are definitely approved for a large grant.',
        responseText: 'You are definitely approved for a large grant.',
        provider: 'gemini',
        intent: { ...intent, extractedFields: {} },
        serviceId: 'tn-women-startup-grant',
        nextAction: 'SHOW_SERVICE',
      }),
    });

    expect(response.suggestedService?.source.verificationStatus).toBe('verified');
    expect(response.eligibilityResult?.status).toBe('POTENTIALLY_ELIGIBLE');
    expect(response.message).toBe('You may meet the basic criteria (not an official decision).');
    expect(response.message).not.toContain('definitely approved');
  });

  it('respects prefer-not-to-say without asking again or treating the user as ineligible', async () => {
    useVerifiedBusinessRecord();
    const profile = session({
      demographics: { age: 28, state: 'Tamil Nadu' },
      answers: { gender: 'prefer_not_to_say' },
      primaryIntent: 'BUSINESS_SUPPORT',
      selectedServiceId: 'tn-women-startup-grant',
      currentStage: 'COLLECTING_REQUIRED_INFORMATION',
    });
    const response = await processConversationTurn({
      message: 'Guided answer — gender: prefer_not_to_say',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'Tell me your gender.',
        responseText: 'Tell me your gender.',
        provider: 'gemini',
        intent: { ...intent, extractedFields: {} },
        serviceId: 'tn-women-startup-grant',
        question: question('gender'),
        nextAction: 'ASK_REQUIRED_INFORMATION',
      }),
    });

    expect(response.eligibilityResult?.status).toBe('MORE_INFORMATION_REQUIRED');
    expect(response.eligibilityResult?.failedRules).toHaveLength(0);
    expect(response.question).toBeUndefined();
    expect(response.suggestedService?.source.verificationStatus).toBe('verified');
    expect(profile.currentStage).toBe('USER_DECLINED_REQUIRED_INFORMATION');
  });

  it('answers service follow-up questions without losing verified service context', async () => {
    useVerifiedBusinessRecord();
    const profile = session({
      demographics: { age: 28, state: 'Tamil Nadu', gender: 'female' },
      primaryIntent: 'BUSINESS_SUPPORT',
      selectedServiceId: 'tn-women-startup-grant',
      currentStage: 'SERVICE_RESULT',
    });
    const response = await processConversationTurn({
      message: 'What does address proof mean?',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'Address proof is a document that shows where you live.',
        responseText: 'Address proof is a document that shows where you live.',
        provider: 'gemini',
        intent: { category: 'OTHER', userNeedSummary: '', confidence: 0.9, extractedFields: {} },
        nextAction: 'PROVIDE_GUIDANCE',
      }),
    });

    expect(response.message).toContain('Address proof is a document');
    expect(response.eligibilityResult).toBeUndefined();
    expect(response.suggestedService?.id).toBe('tn-women-startup-grant');
  });

  it('does not invent a service when the catalog search returns no match', async () => {
    vi.spyOn(serviceRepository, 'getServiceById').mockResolvedValue(null);
    vi.spyOn(serviceRepository, 'findBestMatchingService').mockResolvedValue(null);
    const profile = session({ selectedServiceId: 'stale-service-id' });
    const response = await processConversationTurn({
      message: 'I need business support in an unlisted region.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'I found a government program for you.',
        responseText: 'I found a government program for you.',
        provider: 'gemini',
        intent,
        nextAction: 'SEARCH_SERVICES',
      }),
    });

    expect(response.suggestedService).toBeUndefined();
    expect(response.responseText).toContain("couldn't find a verified government service");
    expect(profile.selectedServiceId).toBeUndefined();
    expect(profile.currentStage).toBe('NO_VERIFIED_MATCH');
  });

  it('asks the missing PMEGP project-status condition rather than an unrelated fixed question', async () => {
    const profile = session({ demographics: { age: 30 } });
    const response = await processConversationTurn({
      message: 'I am 30 and need a loan for a tailoring shop.',
      session: profile,
      language: 'en',
      history: [],
      aiService: new MockAIService(),
    });

    expect(response.suggestedService).toBeUndefined();
    expect(response.question?.fieldKey).toBe('businessStatus');
    expect(response.question?.options?.map((option) => option.value)).toContain('new');
    expect(response.question?.fieldKey).not.toBe('state');
  });

  it('normalizes explicit PMEGP project-status text and keeps incomplete criteria UNKNOWN', async () => {
    const profile = session({ demographics: { age: 30 } });
    const response = await processConversationTurn({
      message: 'I am 30 and it is a new project.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'I found the PMEGP scheme.',
        responseText: 'I found the PMEGP scheme.',
        provider: 'gemini',
        serviceId: 'pmegp-new-enterprise',
        intent: {
          category: 'BUSINESS_SUPPORT',
          userNeedSummary: 'New enterprise',
          confidence: 0.99,
          extractedFields: { businessStatus: 'new project' },
        },
        nextAction: 'SHOW_SERVICE',
      }),
    });

    expect(profile.answers.businessStatus).toBe('new');
    expect(response.eligibilityResult?.status).toBe('UNKNOWN');
    expect(response.responseText).toContain('cannot fully assess this scheme');
  });

  it('uses a relevant local fallback and asks the service-required question when Gemini is unavailable', async () => {
    const profile = session({ demographics: { age: 30 } });
    const response = await processConversationTurn({
      message: 'I am 30 and need a loan for a tailoring shop.',
      session: profile,
      language: 'en',
      history: [],
      aiService: new GeminiAIService(undefined),
    });

    expect(response.provider).toBe('fallback');
    expect(response.question?.fieldKey).toBe('businessStatus');
    expect(response.responseText).toContain('verified listing');
    expect(response.responseText).not.toContain('internet connection');
  });

  it('answers a PMEGP document question from the verified catalog without asking unrelated eligibility questions', async () => {
    const response = await processConversationTurn({
      message: 'What documents do I need for PMEGP?',
      session: session(),
      language: 'en',
      history: [],
      aiService: new GeminiAIService(undefined),
    });

    expect(response.provider).toBe('fallback');
    expect(response.suggestedService?.id).toBe('pmegp-new-enterprise');
    expect(response.question).toBeUndefined();
    expect(response.eligibilityResult).toBeUndefined();
    expect(response.responseText).toContain('does not include a confirmed document list');
  });

  it('keeps a grounded catalog answer when Gemini labels a direct question as general response', async () => {
    const response = await processConversationTurn({
      message: 'What is PMEGP?',
      session: session(),
      language: 'en',
      history: [],
      aiService: provider({
        message: 'PMEGP supports new non-farm micro-enterprises through bank finance.',
        responseText: 'PMEGP supports new non-farm micro-enterprises through bank finance.',
        provider: 'gemini',
        intent: { category: 'BUSINESS_SUPPORT', userNeedSummary: 'PMEGP overview', confidence: 0.98, extractedFields: {} },
        serviceId: 'pmegp-new-enterprise',
        nextAction: 'GENERAL_RESPONSE',
      }),
    });
    expect(response.responseText).toContain('PMEGP supports new non-farm micro-enterprises');
    expect(response.question).toBeUndefined();
    expect(response.eligibilityResult).toBeUndefined();
    expect(response.suggestedService?.id).toBe('pmegp-new-enterprise');
  });

  it('does not attach a question that is not among deterministic missing fields', async () => {
    useVerifiedBusinessRecord();
    const profile = session({ demographics: { age: 28, state: 'Tamil Nadu' } });
    const response = await processConversationTurn({
      message: 'I need support for a tailoring business.',
      session: profile,
      language: 'en',
      history: [],
      aiService: provider({
        message: 'How can I help?',
        responseText: 'How can I help?',
        provider: 'gemini',
        intent: { ...intent, extractedFields: {} },
        serviceId: 'tn-women-startup-grant',
        question: question('state'),
        nextAction: 'ASK_REQUIRED_INFORMATION',
      }),
    });

    expect(profile.missingInformation).toEqual(['gender']);
    expect(response.question).toBeUndefined();
  });
});
