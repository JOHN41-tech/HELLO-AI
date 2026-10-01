import { AIService, AIIntent, AIServiceResponse } from '@/types/ai';
import { LanguageCode } from '@/types/language';
import { GuidedQuestion, ChatMessage } from '@/types/conversation';
import { GovernmentService } from '@/types/service';
import { UserProfileSession, EligibilityResult } from '@/types/session';
import { MockAIService } from './mock-ai-service';

/**
 * GeminiAIService
 *
 * Phase 2 Implementation Architecture:
 * - Uses server-side `process.env.GEMINI_API_KEY` via `@google/genai` or fetch API.
 * - Implements the exact same `AIService` interface.
 * - Zero breaking changes to the UI or frontend components.
 */
export class GeminiAIService implements AIService {
  private fallbackMock = new MockAIService();

  public async understandIntent(query: string, language: LanguageCode): Promise<AIIntent> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'mock_key_phase1') {
      // Graceful fallback to Mock AIService in Phase 1
      return this.fallbackMock.understandIntent(query, language);
    }

    // Phase 2: Call Gemini API using structured JSON schema output
    // Example:
    // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, { ... });
    return this.fallbackMock.understandIntent(query, language);
  }

  public async generateQuestion(session: UserProfileSession, language: LanguageCode): Promise<GuidedQuestion | null> {
    return this.fallbackMock.generateQuestion(session, language);
  }

  public async generateResponse(
    userQuery: string,
    session: UserProfileSession,
    language: LanguageCode,
    history: ChatMessage[]
  ): Promise<AIServiceResponse> {
    return this.fallbackMock.generateResponse(userQuery, session, language, history);
  }

  public async summarizeUserNeed(session: UserProfileSession, language: LanguageCode): Promise<string> {
    return this.fallbackMock.summarizeUserNeed(session, language);
  }

  public async explainEligibility(
    service: GovernmentService,
    result: EligibilityResult,
    language: LanguageCode
  ): Promise<string> {
    return this.fallbackMock.explainEligibility(service, result, language);
  }

  public async explainDocument(
    documentId: string,
    service: GovernmentService,
    language: LanguageCode
  ): Promise<string> {
    return this.fallbackMock.explainDocument(documentId, service, language);
  }

  public async generateGuidance(
    service: GovernmentService,
    stepIndex: number,
    language: LanguageCode
  ): Promise<string> {
    return this.fallbackMock.generateGuidance(service, stepIndex, language);
  }
}
