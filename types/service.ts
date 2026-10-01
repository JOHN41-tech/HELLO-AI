import { LanguageCode, LocalizedText } from './language';

export type ServiceCategory =
  | 'business'
  | 'education'
  | 'assistance'
  | 'skill'
  | 'health'
  | 'employment';

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'in_range'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'boolean_true';

export interface EligibilityRule {
  id: string;
  field: string; // e.g., 'age', 'state', 'income', 'occupation', 'isWoman'
  operator: RuleOperator;
  value: string | number | boolean | string[] | number[];
  explanation: LocalizedText; // User-friendly explanation, translated per language
}

export interface EligibilityRuleGroup {
  id?: string;
  logic: 'AND' | 'OR';
  rules: Array<EligibilityRule | EligibilityRuleGroup>;
}

export interface DocumentItem {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  required: boolean;
  alternatives?: LocalizedText[];
}

export interface ApplicationStep {
  stepNumber: number;
  title: LocalizedText;
  description: LocalizedText;
  userAction: LocalizedText;
  helpText?: LocalizedText;
  officialPageUrl?: string;
}

export interface VerifiedSource {
  authorityName: string;
  officialUrl: string;
  lastVerifiedAt: string; // ISO date string
  verificationStatus: 'verified' | 'sample_mock';
}

export interface GovernmentService {
  id: string;
  name: LocalizedText;
  category: ServiceCategory;
  description: LocalizedText;
  targetUsers: LocalizedText;
  /** Languages this service has content for. English is the fallback for anything omitted. */
  languages: LanguageCode[];
  eligibilityRules: EligibilityRule[];
  /** False when verified scheme criteria remain unmodeled; matching known rules must then yield UNKNOWN. */
  eligibilityRulesComplete?: boolean;
  /** Optional composite conditions; each group is evaluated alongside legacy flat rules using AND. */
  eligibilityRuleGroups?: EligibilityRuleGroup[];
  requiredDocuments: DocumentItem[];
  applicationSteps: ApplicationStep[];
  officialUrl: string;
  source: VerifiedSource;
  tags: string[];
}
