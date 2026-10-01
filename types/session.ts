import { LanguageCode } from './language';

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
  userValue?: string | number | boolean | string[];
  expectedValue?: string | number | boolean | string[];
  explanation: string;
}

export interface EligibilityResult {
  serviceId: string;
  isEligible: boolean;
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
  selectedServiceId?: string;
  eligibilityResults?: Record<string, EligibilityResult>;
  currentStepIndex: number;
}
