import { describe, it, expect } from 'vitest';
import {
  ChatInputSchema,
  GuidedAnswerSchema,
  UserDemographicsSchema,
} from '../lib/validation/schemas';

describe('Validation Schemas', () => {
  it('should validate valid chat input', () => {
    const validPayload = {
      message: 'I want help starting a business.',
      sessionId: 'session_00000000-0000-4000-8000-000000000003',
      language: 'en',
    };

    const result = ChatInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject empty chat message', () => {
    const invalidPayload = {
      message: '',
      sessionId: 'session_00000000-0000-4000-8000-000000000003',
      language: 'en',
    };

    const result = ChatInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should validate demographic entries', () => {
    const validDemo = {
      age: 29,
      gender: 'female',
      state: 'Tamil Nadu',
      annualIncome: 50000,
    };

    const result = UserDemographicsSchema.safeParse(validDemo);
    expect(result.success).toBe(true);
  });
});

describe('Guided Answers (Phase 1.5)', () => {
  it('should accept a structured answer carrying fieldKey and value', () => {
    const result = GuidedAnswerSchema.safeParse({ fieldKey: 'age', value: 29 });
    expect(result.success).toBe(true);
  });

  it('should accept string and boolean answer values', () => {
    expect(GuidedAnswerSchema.safeParse({ fieldKey: 'state', value: 'Tamil Nadu' }).success).toBe(true);
    expect(GuidedAnswerSchema.safeParse({ fieldKey: 'isStudent', value: true }).success).toBe(true);
  });

  it('should reject an answer without a fieldKey', () => {
    expect(GuidedAnswerSchema.safeParse({ value: 29 }).success).toBe(false);
  });

  it('should reject an answer with an empty fieldKey', () => {
    expect(GuidedAnswerSchema.safeParse({ fieldKey: '', value: 29 }).success).toBe(false);
  });

  it('should reject an answer with no value', () => {
    expect(GuidedAnswerSchema.safeParse({ fieldKey: 'age' }).success).toBe(false);
  });
});

describe('Chat Input — message or structured answer (Phase 1.5)', () => {
  it('should accept a chat payload whose only payload is a structured answer', () => {
    const result = ChatInputSchema.safeParse({
      sessionId: 'session_00000000-0000-4000-8000-000000000003',
      language: 'ta',
      answer: { fieldKey: 'occupation', value: 'tailoring' },
    });
    expect(result.success).toBe(true);
  });

  it('should reject a payload with neither a message nor an answer', () => {
    const result = ChatInputSchema.safeParse({
      sessionId: 'session_00000000-0000-4000-8000-000000000003',
      language: 'en',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a structured answer sent as a bare string', () => {
    const result = ChatInputSchema.safeParse({
      sessionId: 'session_00000000-0000-4000-8000-000000000003',
      language: 'en',
      answer: 'continue',
    });
    expect(result.success).toBe(false);
  });
});
