const credentialPatterns: Array<[RegExp, string]> = [
  [/\b(one[- ]time password|otp|password|passcode|pin)\b\s*(?:is|:|=)?\s*\S+/gi, '$1 [redacted]'],
  [/\b(?:aadhaar|aadhar)(?:\s*(?:number|no\.?))?\s*(?:is|:|=)?\s*\d[\d\s-]{9,15}\b/gi, '[redacted identity number]'],
  [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[redacted identity number]'],
  [/\b(?:bank\s+account|account\s+number)\b[^\d]{0,20}\d{9,18}\b/gi, '[redacted account number]'],
  [/\b(?:otp|one[- ]time password|pin)\b\s*(?:is|:|=)?\s*\d{4,8}\b/gi, '[redacted credential]'],
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted email address]'],
  [/(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, '[redacted phone number]'],
];

/** Redact credentials and common contact/identity data before model submission and history retention. */
export function redactSensitiveText(value: string): string {
  return credentialPatterns.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}
