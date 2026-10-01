import { AIService, AIServiceResponse } from '@/types/ai';
import { LanguageCode } from '@/types/language';
import { GuidedQuestion } from '@/types/conversation';
import { GovernmentService, ServiceCategory } from '@/types/service';
import { UserProfileSession, UserDemographics } from '@/types/session';
import { serviceRepository } from '@/lib/services/service-repository';
import { EXTRACTABLE_FIELDS } from '@/lib/ai/schemas/chat-turn';
import { redactSensitiveText } from '@/lib/privacy/redaction';
import { translateKey } from '@/lib/i18n/localization';

const demographicFields = new Set<keyof UserDemographics>([
  'age', 'gender', 'state', 'district', 'occupation', 'annualIncome', 'category', 'isStudent', 'isEntrepreneur',
]);
const allowedFields = new Set<string>(EXTRACTABLE_FIELDS);
const sensitiveFieldPattern = /(password|passwd|otp|pin|aadhaar|accountnumber|bankaccount)/i;

const intentToServiceCategory: Record<string, ServiceCategory | undefined> = {
  BUSINESS_SUPPORT: 'business',
  business: 'business',
  EDUCATION_SUPPORT: 'education',
  education: 'education',
  EMPLOYMENT: 'employment',
  employment: 'employment',
  SKILL_TRAINING: 'skill',
  skill: 'skill',
  HEALTH_SERVICES: 'health',
  health: 'health',
  IDENTITY_DOCUMENTS: 'assistance',
  FINANCIAL_ASSISTANCE: 'assistance',
  WOMEN_SUPPORT: 'assistance',
  HOUSING_SUPPORT: 'assistance',
  SOCIAL_SECURITY: 'assistance',
};

function normalizeNumber(value: string | number | boolean): number | undefined {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
  return Number.isFinite(number) ? number : undefined;
}

function applyExtractedInformation(session: UserProfileSession, values: Record<string, string | number | boolean>) {
  for (const [field, value] of Object.entries(values)) {
    if (!allowedFields.has(field) || sensitiveFieldPattern.test(field)) continue;

    if (field === 'age' || field === 'annualIncome') {
      const numeric = normalizeNumber(value);
      if (numeric === undefined || numeric < 0 || (field === 'age' && numeric > 120)) continue;
      if (field === 'age') session.demographics.age = numeric;
      else session.demographics.annualIncome = numeric;
      session.answers[field] = numeric;
      continue;
    }

    if (field === 'gender') {
      if (value === 'female' || value === 'male' || value === 'other') {
        session.demographics.gender = value;
        session.answers[field] = value;
      }
      continue;
    }

    if (field === 'businessStatus') {
      if (typeof value !== 'string') continue;
      const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
      if (['new', 'new_project', 'new_business', 'starting', 'not_started'].includes(normalized)) {
        session.answers.businessStatus = 'new';
      } else if (['existing', 'existing_business', 'already_operating', 'operating'].includes(normalized)) {
        session.answers.businessStatus = 'existing';
      } else if (['prefer_not_to_say', 'rather_not_say'].includes(normalized)) {
        session.answers.businessStatus = 'prefer_not_to_say';
      }
      continue;
    }

    if (field === 'isStudent' || field === 'isEntrepreneur') {
      if (typeof value !== 'boolean') continue;
      session.demographics[field] = value;
      session.answers[field] = value;
      continue;
    }

    if (typeof value !== 'string' || !value.trim() || value.length > 160) continue;
    const normalized = value.trim();
    if (redactSensitiveText(normalized) !== normalized) continue;
    if (demographicFields.has(field as keyof UserDemographics)) {
      (session.demographics as Record<string, string | number | boolean | undefined>)[field] = normalized;
    }
    session.answers[field] = normalized;
  }
}

function isServiceAction(response: AIServiceResponse): boolean {
  return Boolean(response.serviceId || response.suggestedService) || [
    'SEARCH_SERVICES', 'CHECK_ELIGIBILITY', 'SHOW_SERVICE', 'show_service', 'explain_eligibility',
  ].includes(response.nextAction ?? '');
}

function isQuestionForMissingField(
  question: GuidedQuestion | undefined,
  missingFields: string[]
): question is GuidedQuestion {
  return Boolean(question && missingFields.includes(question.fieldKey));
}

function isCatalogInformationRequest(message: string): boolean {
  const q = message.toLowerCase();
  if (/\b(eligible|eligibility|qualify|qualification)\b|தகுதி|पात्रता|అర్హత|ಅರ್ಹತೆ|യോഗ്യത|पात्रता|પાત્રતા|যোগ্যতা|ਯੋਗਤਾ|যোগ্যতা|ଯୋଗ୍ୟତା|اہلیت/.test(q)) return false;
  return /\b(document|documents|papers|paperwork|proof|meaning|define|apply|application|steps?|process|procedure|how much|amount|cost|subsidy|maximum|limit|what is|tell me about|details|information|overview|benefits)\b|ஆவண|சான்று|விண்ணப்ப|எவ்வளவு|திட்டம் என்ன|என்பதன் பொருள்|दस्तावेज|आवेदन|कितना|क्या है|पता का प्रमाण|పత్ర|దరఖాస్తు|ఎంత|ఏమిటి|ದಾಖಲೆ|ಅರ್ಜಿ|ಎಷ್ಟು|ಏನು|രേഖ|അപേക്ഷ|എത്ര|എന്താണ്|കേൾക്കുക|कागदपत्र|अर्ज|किती|માહિતી|દસ્તાવેજ|કેટલું|માહિતી|নথি|আবেদন|কত|তথ্য|ਦਸਤਾਵੇਜ਼|ਅਰਜ਼ੀ|ਕਿੰਨਾ|তথ্য|আবেদন|କାଗାଜ|ଆବେଦନ|କେତେ|معلومات|دستاویز|درخواست|کتنا/.test(q);
}

function mapServiceResult(
  response: AIServiceResponse,
  service: GovernmentService,
  result: NonNullable<AIServiceResponse['eligibilityResult']>
): AIServiceResponse {
  return { ...response, suggestedService: service, eligibilityResult: result };
}

export async function processConversationTurn(input: {
  message: string;
  session: UserProfileSession;
  language: LanguageCode;
  history: Parameters<AIService['generateResponse']>[3];
  aiService: AIService;
}): Promise<AIServiceResponse> {
  const previousIntent = input.session.primaryIntent;
  const previousStage = input.session.currentStage;
  const previousServiceId = input.session.selectedServiceId;
  const isContinuation = previousStage === 'COLLECTING_REQUIRED_INFORMATION'
    || previousStage === 'SERVICE_RESULT'
    || previousStage === 'USER_DECLINED_REQUIRED_INFORMATION'
    || /^guided answer\s*[—:-]/i.test(input.message.trim());
  const safeMessage = redactSensitiveText(input.message);
  const response = await input.aiService.generateResponse(
    safeMessage,
    input.session,
    input.language,
    input.history
  );

  if (response.intent) {
    if (!['OTHER', 'other', 'general'].includes(response.intent.category)) {
      input.session.primaryIntent = response.intent.category;
      input.session.userGoal = redactSensitiveText(response.intent.userNeedSummary).slice(0, 240);
    }
    applyExtractedInformation(input.session, response.intent.extractedFields);
  }
  input.session.currentStage = response.nextAction ?? 'GENERAL_RESPONSE';

  const category = intentToServiceCategory[response.intent?.category ?? '']
    ?? (isContinuation ? intentToServiceCategory[previousIntent ?? ''] : undefined);
  const isUnclassifiedFollowUp = !intentToServiceCategory[response.intent?.category ?? ''];
  let service: GovernmentService | null = null;
  let eligibilityResult: AIServiceResponse['eligibilityResult'];

  if (response.serviceId) {
    const selected = await serviceRepository.getServiceById(response.serviceId);
    if (selected && (!category || selected.category === category)) service = selected;
  }
  if (!service && isContinuation && previousServiceId) {
    const selected = await serviceRepository.getServiceById(previousServiceId);
    if (selected && (!category || selected.category === category)) service = selected;
  }
  if (!service && response.suggestedService?.id) {
    const selected = await serviceRepository.getServiceById(response.suggestedService.id);
    if (selected && (!category || selected.category === category)) service = selected;
  }

  if (!service && category && (isServiceAction(response) || Boolean(response.intent))) {
    const match = await serviceRepository.findBestMatchingService(
      input.session,
      response.intent?.userNeedSummary || safeMessage,
      category
    );
    service = match?.service ?? null;
  }

  // A direct keyword match is allowed for catalog lookup, but never broadens to unrelated services.
  if (!service && !category && response.intent?.category === 'OTHER') {
    const matches = await serviceRepository.searchServices(safeMessage);
    service = matches[0] ?? null;
  }

  const continuingActiveService = Boolean(isContinuation && previousServiceId
    && service?.id === previousServiceId && isUnclassifiedFollowUp);

  if (!service) {
    input.session.missingInformation = [];
    const requestedCatalogSearch = isServiceAction(response) || Boolean(category && response.intent);
    if (requestedCatalogSearch) {
      input.session.selectedServiceId = undefined;
      input.session.currentStage = 'NO_VERIFIED_MATCH';
    }
    const responseText = requestedCatalogSearch
      ? translateKey(input.language, 'service.noMatch')
      : redactSensitiveText(response.responseText ?? response.message);
    return { ...response, message: responseText, responseText };
  }

  input.session.selectedServiceId = service.id;
  if (service.source.verificationStatus !== 'verified') {
    input.session.currentStage = 'DEMO_SAMPLE_ONLY';
    input.session.missingInformation = [];
    const responseText = translateKey(input.language, 'service.sampleNotice');
    return {
      ...response,
      message: responseText,
      responseText,
      question: undefined,
      suggestedService: service,
      eligibilityResult: undefined,
    };
  }

  if (response.nextAction === 'PROVIDE_GUIDANCE' && isCatalogInformationRequest(safeMessage)) {
    input.session.currentStage = 'GUIDANCE';
    input.session.missingInformation = [];
    const responseText = redactSensitiveText(response.responseText ?? response.message);
    return {
      ...response,
      message: responseText,
      responseText,
      question: undefined,
      suggestedService: service,
      eligibilityResult: undefined,
    };
  }

  eligibilityResult = await serviceRepository.checkEligibility(service.id, input.session) ?? undefined;
  if (!eligibilityResult) {
    const responseText = redactSensitiveText(response.responseText ?? response.message);
    return { ...response, message: responseText, responseText };
  }

  input.session.eligibilityResults = {
    ...input.session.eligibilityResults,
    [service.id]: eligibilityResult,
  };
  input.session.missingInformation = eligibilityResult.missingInformationFields;

  if (eligibilityResult.missingInformationFields.length > 0) {
    const declinedRequiredField = eligibilityResult.missingInformationFields.some(
      (field) => input.session.answers[field] === 'prefer_not_to_say'
    );
    if (declinedRequiredField) {
      input.session.currentStage = 'USER_DECLINED_REQUIRED_INFORMATION';
      const responseText = translateKey(input.language, 'eligibility.moreInformationRequired');
      return {
        ...response,
        message: responseText,
        responseText,
        question: undefined,
        suggestedService: service,
        eligibilityResult,
      };
    }

    if (continuingActiveService && response.nextAction === 'PROVIDE_GUIDANCE' && !response.question) {
      input.session.currentStage = 'GUIDANCE';
      const explanation = redactSensitiveText(response.responseText ?? response.message);
      const responseText = `${explanation}\n\n${translateKey(input.language, 'eligibility.moreInformationRequired')}`;
      return { ...response, message: responseText, responseText, suggestedService: service, eligibilityResult };
    }

    const generatedQuestion = isQuestionForMissingField(response.question, eligibilityResult.missingInformationFields)
      ? response.question
      : await input.aiService.generateQuestion(input.session, input.language, eligibilityResult.missingInformationFields) ?? undefined;
    const question = isQuestionForMissingField(generatedQuestion, eligibilityResult.missingInformationFields)
      ? generatedQuestion
      : undefined;
    input.session.currentStage = 'COLLECTING_REQUIRED_INFORMATION';
    const responseText = translateKey(input.language, response.provider === 'fallback'
      ? 'assistant.offlineQuestion'
      : 'eligibility.moreInformationRequired');
    return {
      ...response,
      message: responseText,
      responseText,
      question,
      // Do not show a result card until all catalog-required information is available.
      suggestedService: undefined,
      eligibilityResult: undefined,
    };
  }

  input.session.currentStage = 'SERVICE_RESULT';
  const statusText = translateKey(input.language, eligibilityResult.status === 'POTENTIALLY_ELIGIBLE'
    ? 'eligibility.potentiallyEligible'
    : eligibilityResult.status === 'NOT_ELIGIBLE'
      ? 'eligibility.notEligible'
      : eligibilityResult.status === 'UNKNOWN'
        ? 'eligibility.unknown'
        : 'eligibility.moreInformationRequired');
  const responseText = continuingActiveService && response.provider !== 'fallback'
    ? `${redactSensitiveText(response.responseText ?? response.message)}\n\n${statusText}`
    : statusText;
  return mapServiceResult({ ...response, message: responseText, responseText }, service, eligibilityResult);
}
