import { AIService } from '@/types/ai';
import { aiService as mockAIService } from '@/lib/ai/mock-ai-service';
import { GeminiAIService } from '@/lib/ai/gemini-ai-service';

/** Resolve the provider only in server modules; this file must never be imported by client code. */
export function getAIService(): AIService {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (key && key !== 'mock_key_phase1') return new GeminiAIService(key);

  // Keep Phase 1's deterministic demo usable during local development and tests. In
  // production, the Gemini service returns a localized safe fallback instead of mock facts.
  if (process.env.NODE_ENV === 'production') return new GeminiAIService();
  return mockAIService;
}
