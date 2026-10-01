import { z } from 'zod';
import { isValidLanguageCode } from '@/lib/i18n/languages';

export const SupportedLanguageSchema = z
  .string()
  .refine((val) => isValidLanguageCode(val), { message: 'Invalid or unsupported language code' });

export const ServiceCategorySchema = z.enum([
  'business',
  'education',
  'assistance',
  'skill',
  'health',
  'employment',
]);

export const RuleOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than_or_equal',
  'less_than_or_equal',
  'in',
  'contains',
  'boolean_true',
]);

// Language-indexed content is authored incrementally, so English is required and other
// languages are optional. Missing translations resolve to English at render time.
const LocalizedTextSchema = z
  .object({ en: z.string().min(1) })
  .catchall(z.string());

export const EligibilityRuleSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: RuleOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  explanation: LocalizedTextSchema,
});

export const DocumentItemSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema,
  required: z.boolean(),
  alternatives: z.array(LocalizedTextSchema).optional(),
});

export const ApplicationStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  userAction: LocalizedTextSchema,
  helpText: LocalizedTextSchema.optional(),
  officialPageUrl: z.string().url().optional(),
});

export const VerifiedSourceSchema = z.object({
  authorityName: z.string(),
  officialUrl: z.string().url(),
  lastVerifiedAt: z.string(),
  verificationStatus: z.enum(['verified', 'sample_mock']),
});

export const GovernmentServiceSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  category: ServiceCategorySchema,
  description: LocalizedTextSchema,
  targetUsers: LocalizedTextSchema,
  languages: z.array(SupportedLanguageSchema),
  eligibilityRules: z.array(EligibilityRuleSchema),
  requiredDocuments: z.array(DocumentItemSchema),
  applicationSteps: z.array(ApplicationStepSchema),
  officialUrl: z.string().url(),
  source: VerifiedSourceSchema,
  tags: z.array(z.string()),
});

export const UserDemographicsSchema = z.object({
  name: z.string().optional(),
  age: z.number().min(0).max(120).optional(),
  gender: z.enum(['female', 'male', 'other']).optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.number().min(0).optional(),
  category: z.enum(['general', 'obc', 'sc', 'st']).optional(),
  isStudent: z.boolean().optional(),
  isEntrepreneur: z.boolean().optional(),
});

export const GuidedAnswerSchema = z.object({
  fieldKey: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

/**
 * A turn is either free text or a structured answer to a guided question. Guided answers
 * travel as data so the server can persist them without inventing a translated
 * instruction string to pass through the message field.
 */
export const ChatInputSchema = z
  .object({
    message: z.string().min(1, 'Message cannot be empty').optional(),
    answer: GuidedAnswerSchema.optional(),
    sessionId: z.string(),
    language: SupportedLanguageSchema,
  })
  .refine((data) => Boolean(data.message) || Boolean(data.answer), {
    message: 'A message or a guided answer is required',
    path: ['message'],
  });
