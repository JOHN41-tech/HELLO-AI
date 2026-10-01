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
      verificationStatus: 'verified',
    },
    tags: ['test'],
  };

  function makeSession(overrides: Partial<UserProfileSession> = {}): UserProfileSession {
    return {
      sessionId: 'test-session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: {},
      answers: {},
      currentStepIndex: 0,
      ...overrides,
    };
  }

  it('returns potentially eligible only when all deterministic rules pass', () => {
    const result = EligibilityEngine.evaluateService(mockService, makeSession({
      demographics: { gender: 'female', age: 25, state: 'Tamil Nadu' },
    }));

    expect(result.isEligible).toBe(true);
    expect(result.status).toBe('POTENTIALLY_ELIGIBLE');
    expect(result.score).toBe(100);
    expect(result.matchedRules).toHaveLength(3);
    expect(result.failedRules).toHaveLength(0);
    expect(result.missingInformationFields).toHaveLength(0);
  });

  it('identifies missing fields as more information required', () => {
    const result = EligibilityEngine.evaluateService(mockService, makeSession({
      demographics: { gender: 'female' },
    }));

    expect(result.isEligible).toBe(false);
    expect(result.status).toBe('MORE_INFORMATION_REQUIRED');
    expect(result.missingInformationFields).toContain('age');
    expect(result.missingInformationFields).toContain('state');
    expect(result.matchedRules).toHaveLength(1);
  });

  it('returns not eligible when a known value fails a deterministic rule', () => {
    const result = EligibilityEngine.evaluateService(mockService, makeSession({
      demographics: { gender: 'male', age: 25, state: 'Tamil Nadu' },
    }));

    expect(result.isEligible).toBe(false);
    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.failedRules).toHaveLength(1);
    expect(result.failedRules[0].field).toBe('gender');
  });

  it('treats prefer-not-to-say as missing rather than a failed criterion', () => {
    const result = EligibilityEngine.evaluateService(mockService, makeSession({
      demographics: { age: 25, state: 'Tamil Nadu' },
      answers: { gender: 'prefer_not_to_say' },
    }));

    expect(result.status).toBe('MORE_INFORMATION_REQUIRED');
    expect(result.missingInformationFields).toContain('gender');
    expect(result.failedRules).toHaveLength(0);
  });

  it('supports an OR group while preserving AND semantics across top-level conditions', () => {
    const service: GovernmentService = {
      ...mockService,
      eligibilityRules: [{
        id: 'minimum-age', field: 'age', operator: 'greater_than_or_equal', value: 18,
        explanation: { en: 'At least 18' },
      }],
      eligibilityRuleGroups: [{
        logic: 'OR',
        rules: [
          { id: 'student', field: 'isStudent', operator: 'boolean_true', value: true, explanation: { en: 'Student' } },
          { id: 'state', field: 'state', operator: 'equals', value: 'Tamil Nadu', explanation: { en: 'Lives in Tamil Nadu' } },
        ],
      }],
    };
    const result = EligibilityEngine.evaluateService(service, makeSession({
      demographics: { age: 25, isStudent: true },
    }));
    expect(result.status).toBe('POTENTIALLY_ELIGIBLE');
    expect(result.matchedRules.map((rule) => rule.ruleId)).toEqual(['minimum-age', 'student']);
    expect(result.failedRules).toHaveLength(0);
  });

  it('returns UNKNOWN for an unsupported operator rather than treating it as a failing rule', () => {
    const service: GovernmentService = {
      ...mockService,
      eligibilityRules: [{
        id: 'unsupported', field: 'age', operator: 'future_operator' as never, value: 18,
        explanation: { en: 'Unsupported condition' },
      }],
    };
    const result = EligibilityEngine.evaluateService(service, makeSession({ demographics: { age: 25 } }));
    expect(result.status).toBe('UNKNOWN');
    expect(result.failedRules).toHaveLength(0);
  });

  it('supports inclusive ranges, strict comparisons, and NOT_IN rules', () => {
    const service: GovernmentService = {
      ...mockService,
      eligibilityRules: [
        { id: 'age-range', field: 'age', operator: 'between', value: [18, 40], explanation: { en: 'Age range' } },
        { id: 'income-cap', field: 'annualIncome', operator: 'less_than', value: 900000, explanation: { en: 'Income limit' } },
        { id: 'excluded-state', field: 'state', operator: 'not_in', value: ['Kerala'], explanation: { en: 'Outside exclusions' } },
      ],
    };
    const result = EligibilityEngine.evaluateService(service, makeSession({
      demographics: { age: 28, annualIncome: 500000, state: 'Tamil Nadu' },
    }));
    expect(result.status).toBe('POTENTIALLY_ELIGIBLE');
    expect(result.matchedRules).toHaveLength(3);
  });

  it('does not claim potential eligibility when official criteria are only partially modeled', () => {
    const service: GovernmentService = {
      ...mockService,
      eligibilityRulesComplete: false,
      eligibilityRules: [{
        id: 'known-condition', field: 'age', operator: 'greater_than', value: 18,
        explanation: { en: 'Above 18' },
      }],
    };
    const result = EligibilityEngine.evaluateService(service, makeSession({ demographics: { age: 30 } }));
    expect(result.status).toBe('UNKNOWN');
    expect(result.isEligible).toBe(false);
  });
});
