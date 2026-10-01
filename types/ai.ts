import { LanguageCode } from './language';
import { GuidedQuestion, ChatMessage } from './conversation';
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
  question?: GuidedQuestion;
  suggestedService?: GovernmentService;
  eligibilityResult?: EligibilityResult;
  intent?: AIIntent;
  nextAction?: 'ask_question' | 'show_service' | 'explain_eligibility' | 'guide_step';
}

export interface AIService {
  understandIntent(userQuery: string, language: LanguageCode): Promise<AIIntent>;
  generateQuestion(session: UserProfileSession, language: LanguageCode): Promise<GuidedQuestion | null>;
  generateResponse(
    userQuery: string,
    session: UserProfileSession,
    language: LanguageCode,
    history: ChatMessage[]
  ): Promise<AIServiceResponse>;
  summarizeUserNeed(session: UserProfileSession, language: LanguageCode): Promise<string>;
  explainEligibility(service: GovernmentService, result: EligibilityResult, language: LanguageCode): Promise<string>;
  explainDocument(documentId: string, service: GovernmentService, language: LanguageCode): Promise<string>;
  generateGuidance(service: GovernmentService, stepIndex: number, language: LanguageCode): Promise<string>;
}
