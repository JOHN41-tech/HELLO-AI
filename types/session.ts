import { LanguageCode } from './language';
import { ConversationHistoryEntry } from './conversation';

export interface UserDemographics {
  name?: string;
  age?: number;
  gender?: 'female' | 'male' | 'other';
  state?: string;
  district?: string;
  occupation?: string;
  annualIncome?: number; // In INR
  category?: 'general' | 'obc' | 'sc' | 'st';
  isStudent?: boolean;
  isEntrepreneur?: boolean;
}

export interface RuleEvaluationDetail {
  ruleId: string;
  field: string;
  passed: boolean;
  userValue?: string | number | boolean | string[] | number[];
  expectedValue?: string | number | boolean | string[] | number[];
  explanation: string;
}

export interface EligibilityResult {
  serviceId: string;
  isEligible: boolean;
  status?: 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'MORE_INFORMATION_REQUIRED' | 'UNKNOWN';
  score: number; // 0 to 100 percentage match
  matchedRules: RuleEvaluationDetail[];
  failedRules: RuleEvaluationDetail[];
  missingInformationFields: string[];
}

export interface UserProfileSession {
  sessionId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  language: LanguageCode;
  locale: string; // e.g. 'ta-IN', 'hi-IN', 'ur-IN'
  demographics: UserDemographics;
  answers: Record<string, string | number | boolean>;
  primaryIntent?: string;
  userGoal?: string;
  missingInformation?: string[];
  currentStage?: string;
  conversationHistory?: ConversationHistoryEntry[];
  selectedServiceId?: string;
  eligibilityResults?: Record<string, EligibilityResult>;
  currentStepIndex: number;
}
