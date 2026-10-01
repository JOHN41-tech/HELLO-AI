import { UserProfileSession } from '@/types/session';
import { ConversationHistoryEntry } from '@/types/conversation';
import { GovernmentService } from '@/types/service';
import { LanguageCode } from '@/types/language';
import { getLanguageConfig } from '@/lib/i18n/languages';
import { EXTRACTABLE_FIELDS } from '@/lib/ai/schemas/chat-turn';
import { redactSensitiveText } from '@/lib/privacy/redaction';

const safeFields = new Set<string>(EXTRACTABLE_FIELDS);

function getKnownInformation(session: UserProfileSession): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};
  for (const [field, value] of Object.entries({ ...session.demographics, ...session.answers })) {
    if (!safeFields.has(field) || typeof value === 'object' || value === undefined || value === null) continue;
    if (typeof value === 'string' && /(password|passwd|otp|pin|aadhaar|accountnumber|bankaccount)/i.test(field)) continue;
    if (typeof value === 'string' && redactSensitiveText(value) !== value) continue;
    values[field] = value as string | number | boolean;
  }
  return values;
}

function toCatalogContext(services: GovernmentService[]) {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    targetUsers: service.targetUsers,
    tags: service.tags,
    verificationStatus: service.source.verificationStatus,
    eligibilityRulesComplete: service.eligibilityRulesComplete ?? true,
    ...(service.source.verificationStatus === 'verified'
      ? { officialUrl: service.officialUrl }
      : {}),
    eligibilityRules: service.eligibilityRules.map(({ field, operator, value, explanation }) => ({
      field,
      operator,
      value,
      explanation,
    })),
    eligibilityRuleGroups: service.eligibilityRuleGroups ?? [],
    requiredDocuments: service.requiredDocuments.map(({ name, description, required }) => ({
      name,
      description,
      required,
    })),
    applicationSteps: service.applicationSteps.map(({ title, description, userAction }) => ({
      title,
      description,
      userAction,
    })),
  }));
}

export function buildTurnContext(input: {
  message: string;
  session: UserProfileSession;
  language: LanguageCode;
  history: ConversationHistoryEntry[];
  services: GovernmentService[];
}): string {
  const config = getLanguageConfig(input.language);
  const history = input.history.slice(-12).map(({ role, content, language }) => ({
    role,
    content: redactSensitiveText(content),
    language,
  }));

  return JSON.stringify({
    language: { code: config.code, locale: config.locale, direction: config.direction, name: config.name },
    priorIntent: input.session.primaryIntent ?? null,
    userGoal: input.session.userGoal ?? null,
    currentStage: input.session.currentStage ?? null,
    selectedServiceId: input.session.selectedServiceId ?? null,
    knownInformation: getKnownInformation(input.session),
    priorConversation: history,
    verifiedAndDemoCatalog: toCatalogContext(input.services),
    currentUserMessage: redactSensitiveText(input.message),
  });
}
