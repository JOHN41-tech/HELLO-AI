import { z } from 'zod';
import { isValidLanguageCode } from '@/lib/i18n/languages';
import { SAFE_PROFILE_FIELDS } from '@/lib/privacy/profile-fields';

const safeProfileFieldSet = new Set<string>(SAFE_PROFILE_FIELDS);

export const SupportedLanguageSchema = z
  .string()
  .refine((val) => isValidLanguageCode(val), { message: 'Invalid or unsupported language code' });

export const SessionIdSchema = z.string().regex(
  /^session_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  { message: 'Invalid session identifier' }
);

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
  name: z.string().max(120).optional(),
  age: z.number().min(0).max(120).optional(),
  gender: z.enum(['female', 'male', 'other']).optional(),
  state: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  occupation: z.string().max(160).optional(),
  annualIncome: z.number().finite().min(0).max(1_000_000_000_000).optional(),
  category: z.enum(['general', 'obc', 'sc', 'st']).optional(),
  isStudent: z.boolean().optional(),
  isEntrepreneur: z.boolean().optional(),
});

const ProfileAnswerValueSchema = z.union([
  z.string().max(160),
  z.number().finite().min(0).max(1_000_000_000_000),
  z.boolean(),
]);
const ProfileAnswersSchema = z.record(z.string().max(64), ProfileAnswerValueSchema).superRefine((answers, ctx) => {
  if (Object.keys(answers).length > SAFE_PROFILE_FIELDS.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Too many profile fields' });
  }
  for (const field of Object.keys(answers)) {
    if (!safeProfileFieldSet.has(field)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: 'Unsupported profile field' });
    }
  }
});

export const GuidedAnswerSchema = z.object({
  fieldKey: z.string().trim().min(1).max(64).refine(
    (key) => !/(password|passwd|otp|pin|aadhaar|accountnumber|bankaccount)/i.test(key),
    { message: 'Sensitive authentication or account fields are not accepted' }
  ),
  value: z.union([
    z.string().max(160),
    z.number().finite().min(0).max(1_000_000_000_000),
    z.boolean(),
  ]),
});
const ProfileContextSchema = z.object({
  demographics: UserDemographicsSchema.omit({ name: true }).partial().optional(),
  answers: ProfileAnswersSchema.optional(),
});

export const SessionPersistInputSchema = z.object({
  sessionId: SessionIdSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  language: SupportedLanguageSchema,
  locale: z.string().max(16).optional(),
  demographics: UserDemographicsSchema.omit({ name: true }).partial().optional(),
  answers: ProfileAnswersSchema.optional(),
  currentStepIndex: z.number().int().min(0).max(1000).optional(),
}).strict();

export const EligibilityCheckInputSchema = z.object({
  serviceId: z.string().trim().min(1).max(128),
  session: z.object({
    sessionId: SessionIdSchema,
    language: SupportedLanguageSchema,
    locale: z.string().max(16).optional(),
    demographics: UserDemographicsSchema.omit({ name: true }).partial().optional(),
    answers: ProfileAnswersSchema.optional(),
    currentStepIndex: z.number().int().min(0).max(1000).optional(),
  }),
}).strict();

/**
 * A turn is either free text or a structured answer to a guided question. Guided answers
 * travel as data so the server can persist them without inventing a translated
 * instruction string to pass through the message field.
 */
export const ChatInputSchema = z
  .object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(4000).optional(),
    answer: GuidedAnswerSchema.optional(),
    sessionId: SessionIdSchema,
    language: SupportedLanguageSchema,
    locale: z.string().max(16).optional(),
    direction: z.enum(['ltr', 'rtl']).optional(),
    profileContext: ProfileContextSchema.optional(),
  })
  .refine((data) => Boolean(data.message) || Boolean(data.answer), {
    message: 'A message or a guided answer is required',
    path: ['message'],
  });
