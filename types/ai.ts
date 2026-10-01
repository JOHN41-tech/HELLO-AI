import { LanguageCode } from './language';
import { GuidedQuestion, ConversationHistoryEntry } from './conversation';
import { GovernmentService } from './service';
import { UserProfileSession, EligibilityResult } from './session';

export interface AIIntent {
  category: string;
  userNeedSummary: string;
  confidence: number;
  extractedFields: Record<string, string | number | boolean>;
}

export interface AIServiceResponse {
  message: string;
  /** One canonical response string shared by the chat UI and text-to-speech. */
  responseText?: string;
  shouldSpeak?: boolean;
  provider?: 'gemini' | 'mock' | 'fallback';
  serviceId?: string;
  question?: GuidedQuestion;
  suggestedService?: GovernmentService;
  eligibilityResult?: EligibilityResult;
  intent?: AIIntent;
  nextAction?:
    | 'ask_question'
    | 'ask_clarification'
    | 'show_service'
    | 'explain_eligibility'
    | 'guide_step'
    | 'general_response'
    | 'ASK_CLARIFICATION'
    | 'ASK_REQUIRED_INFORMATION'
    | 'SEARCH_SERVICES'
    | 'CHECK_ELIGIBILITY'
    | 'SHOW_SERVICE'
    | 'PROVIDE_GUIDANCE'
    | 'GENERAL_RESPONSE'
    | 'END_CONVERSATION';
}

export interface AIService {
  understandIntent(userQuery: string, language: LanguageCode): Promise<AIIntent>;
  generateQuestion(session: UserProfileSession, language: LanguageCode, requiredFields?: string[]): Promise<GuidedQuestion | null>;
  generateResponse(
    userQuery: string,
    session: UserProfileSession,
    language: LanguageCode,
    history: ConversationHistoryEntry[]
  ): Promise<AIServiceResponse>;
  summarizeUserNeed(session: UserProfileSession, language: LanguageCode): Promise<string>;
  explainEligibility(service: GovernmentService, result: EligibilityResult, language: LanguageCode): Promise<string>;
  explainDocument(documentId: string, service: GovernmentService, language: LanguageCode): Promise<string>;
  generateGuidance(service: GovernmentService, stepIndex: number, language: LanguageCode): Promise<string>;
}
