import { describe, expect, it } from 'vitest';
import { redactSensitiveText } from '@/lib/privacy/redaction';
import { ChatInputSchema } from '@/lib/validation/schemas';

describe('chat privacy boundaries', () => {
  it('redacts credential phrases and Aadhaar-like numbers', () => {
    const input = 'My OTP is 123456, password: secret123, and Aadhaar 1234 5678 9012.';
    const sanitized = redactSensitiveText(input);
    expect(sanitized).not.toContain('123456');
    expect(sanitized).not.toContain('secret123');
    expect(sanitized).not.toContain('1234 5678 9012');
    expect(sanitized).toContain('[redacted');
  });

  it('redacts email addresses and Indian mobile numbers', () => {
    const sanitized = redactSensitiveText('Contact me at citizen@example.in or +91 98765 43210.');
    expect(sanitized).not.toContain('citizen@example.in');
    expect(sanitized).not.toContain('98765 43210');
    expect(sanitized).toContain('[redacted email address]');
    expect(sanitized).toContain('[redacted phone number]');
  });

  it('accepts a safe bounded profile context and strips a name field', () => {
    const parsed = ChatInputSchema.safeParse({
      sessionId: 'session_00000000-0000-4000-8000-000000000004',
      language: 'en',
      message: 'I want to start a business',
      profileContext: {
        demographics: { name: 'Should not be forwarded', age: 29, state: 'Tamil Nadu' },
        answers: { occupation: 'tailor', age: 29 },
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.profileContext?.demographics).not.toHaveProperty('name');
      expect(parsed.data.profileContext?.answers).toEqual({ occupation: 'tailor', age: 29 });
    }
  });

  it('rejects sensitive or unsupported fields from client profile context', () => {
    const parsed = ChatInputSchema.safeParse({
      sessionId: 'unsession_00000000-0000-4000-8000-000000000004',
      language: 'en',
      message: 'help',
      profileContext: { answers: { password: 'secret', aadhaar: '000000000000' } },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects oversized input before it reaches the model', () => {
    const parsed = ChatInputSchema.safeParse({
      sessionId: 'session_00000000-0000-4000-8000-000000000006',
      language: 'en',
      message: 'x'.repeat(4001),
    });
    expect(parsed.success).toBe(false);
  });
});
