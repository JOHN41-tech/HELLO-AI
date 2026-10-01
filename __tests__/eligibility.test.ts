import { describe, it, expect } from 'vitest';
import { EligibilityEngine } from '../lib/eligibility/eligibility-engine';
import { GovernmentService } from '../types/service';
import { UserProfileSession } from '../types/session';

describe('EligibilityEngine', () => {
  const mockService: GovernmentService = {
    id: 'test-scheme',
    name: { en: 'Test Women Scheme', ta: 'சோதனைத் திட்டம்' },
    category: 'business',
    description: { en: 'Test description', ta: 'விளக்கம்' },
    targetUsers: { en: 'Women', ta: 'பெண்கள்' },
    languages: ['en', 'ta'],
    eligibilityRules: [
      {
        id: 'rule-gender',
        field: 'gender',
        operator: 'equals',
        value: 'female',
        explanation: { en: 'Must be a woman', ta: 'பெண்ணாக இருக்க வேண்டும்' },
      },
      {
        id: 'rule-min-age',
        field: 'age',
        operator: 'greater_than_or_equal',
        value: 18,
        explanation: { en: 'Age >= 18', ta: 'வயது >= 18' },
      },
      {
        id: 'rule-state',
        field: 'state',
        operator: 'equals',
        value: 'Tamil Nadu',
        explanation: { en: 'Must live in TN', ta: 'TN-இல் வசிக்க வேண்டும்' },
      },
    ],
    requiredDocuments: [],
    applicationSteps: [],
    officialUrl: 'https://example.com',
    source: {
      authorityName: 'Test Authority',
      officialUrl: 'https://example.com',
      lastVerifiedAt: '2026-09-01',
      verificationStatus: 'sample_mock',
    },
    tags: ['test'],
  };

  it('should return isEligible = true when all rules pass', () => {
    const session: UserProfileSession = {
      sessionId: 'test-session-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: {
        gender: 'female',
        age: 25,
        state: 'Tamil Nadu',
      },
      answers: {},
      currentStepIndex: 0,
    };

    const result = EligibilityEngine.evaluateService(mockService, session);

    expect(result.isEligible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.matchedRules.length).toBe(3);
    expect(result.failedRules.length).toBe(0);
    expect(result.missingInformationFields.length).toBe(0);
  });

  it('should identify missing fields correctly', () => {
    const session: UserProfileSession = {
      sessionId: 'test-session-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: {
        gender: 'female',
        // age and state are missing
      },
      answers: {},
      currentStepIndex: 0,
    };

    const result = EligibilityEngine.evaluateService(mockService, session);

    expect(result.isEligible).toBe(false);
    expect(result.missingInformationFields).toContain('age');
    expect(result.missingInformationFields).toContain('state');
    expect(result.matchedRules.length).toBe(1);
  });

  it('should return failed rules when conditions fail', () => {
    const session: UserProfileSession = {
      sessionId: 'test-session-3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: {
        gender: 'male', // Fails rule-gender
        age: 25,
        state: 'Tamil Nadu',
      },
      answers: {},
      currentStepIndex: 0,
    };

    const result = EligibilityEngine.evaluateService(mockService, session);

    expect(result.isEligible).toBe(false);
    expect(result.failedRules.length).toBe(1);
    expect(result.failedRules[0].field).toBe('gender');
  });
});
