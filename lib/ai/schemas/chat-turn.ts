import { z } from 'zod';
import { SAFE_PROFILE_FIELDS } from '@/lib/privacy/profile-fields';

export const AI_INTENT_CATEGORIES = [
  'BUSINESS_SUPPORT',
  'EDUCATION_SUPPORT',
  'EMPLOYMENT',
  'SKILL_TRAINING',
  'HEALTH_SERVICES',
  'IDENTITY_DOCUMENTS',
  'FINANCIAL_ASSISTANCE',
  'WOMEN_SUPPORT',
  'AGRICULTURE_SUPPORT',
  'HOUSING_SUPPORT',
  'SOCIAL_SECURITY',
  'OTHER',
] as const;

export const EXTRACTABLE_FIELDS = SAFE_PROFILE_FIELDS;

export const NEXT_ACTIONS = [
  'ASK_CLARIFICATION',
  'ASK_REQUIRED_INFORMATION',
  'SEARCH_SERVICES',
  'CHECK_ELIGIBILITY',
  'SHOW_SERVICE',
  'PROVIDE_GUIDANCE',
  'GENERAL_RESPONSE',
  'END_CONVERSATION',
] as const;

const ExtractedInformationSchema = z.object({
  fieldKey: z.enum(EXTRACTABLE_FIELDS),
  value: z.union([
    z.string().max(160),
    z.number().finite(),
    z.boolean(),
  ]),
}).strict();

const QuestionSchema = z.object({
  fieldKey: z.enum(EXTRACTABLE_FIELDS),
  text: z.string().trim().min(1).max(240),
  inputType: z.enum(['text', 'number', 'single_select', 'yes_no']),
  options: z.array(z.object({ label: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(100) }).strict()).max(6).optional(),
}).strict();

export const ChatTurnSchema = z.object({
  intentCategory: z.enum(AI_INTENT_CATEGORIES),
  userNeedSummary: z.string().trim().max(240),
  confidence: z.number().min(0).max(1),
  extractedInformation: z.array(ExtractedInformationSchema).max(16),
  nextAction: z.enum(NEXT_ACTIONS),
  responseText: z.string().trim().min(1).max(1200),
  question: QuestionSchema.nullable(),
  serviceId: z.string().max(120).nullable(),
}).strict();

export type ChatTurn = z.infer<typeof ChatTurnSchema>;

/** The constrained subset of JSON Schema accepted by Gemini structured output. */
export const CHAT_TURN_JSON_SCHEMA = {
  type: 'object',
  properties: {
    intentCategory: { type: 'string', enum: AI_INTENT_CATEGORIES },
    userNeedSummary: { type: 'string' },
    confidence: { type: 'number' },
    extractedInformation: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fieldKey: { type: 'string', enum: EXTRACTABLE_FIELDS },
          value: {
            anyOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' },
            ],
          },
        },
        required: ['fieldKey', 'value'],
        additionalProperties: false,
      },
    },
    nextAction: { type: 'string', enum: NEXT_ACTIONS },
    responseText: { type: 'string' },
    question: {
      anyOf: [
        {
          type: 'object',
          properties: {
            fieldKey: { type: 'string', enum: EXTRACTABLE_FIELDS },
            text: { type: 'string' },
            inputType: { type: 'string', enum: ['text', 'number', 'single_select', 'yes_no'] },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: { label: { type: 'string' }, value: { type: 'string' } },
                required: ['label', 'value'],
                additionalProperties: false,
              },
            },
          },
          required: ['fieldKey', 'text', 'inputType'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
    },
    serviceId: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
  required: [
    'intentCategory',
    'userNeedSummary',
    'confidence',
    'extractedInformation',
    'nextAction',
    'responseText',
    'question',
    'serviceId',
  ],
  additionalProperties: false,
} as const;
