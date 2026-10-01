import { EligibilityRule, EligibilityRuleGroup, GovernmentService } from '@/types/service';
import { UserProfileSession, EligibilityResult, RuleEvaluationDetail } from '@/types/session';
import { translateLocalizedText } from '@/lib/i18n/localization';

type RuleState = 'PASS' | 'FAIL' | 'MISSING' | 'UNKNOWN';
interface Evaluation {
  state: RuleState;
  matchedRules: RuleEvaluationDetail[];
  failedRules: RuleEvaluationDetail[];
  missingFields: string[];
}

function isRuleGroup(value: EligibilityRule | EligibilityRuleGroup): value is EligibilityRuleGroup {
  return 'logic' in value && Array.isArray(value.rules);
}

export class EligibilityEngine {
  /** Evaluate verified catalog criteria deterministically; legacy flat rules retain AND semantics. */
  public static evaluateService(service: GovernmentService, session: UserProfileSession): EligibilityResult {
    const userAnswers = { ...session.demographics, ...session.answers } as Record<string, unknown>;
    const language = session.language || 'en';
    const flatResults = service.eligibilityRules.map((rule) => this.evaluateRule(rule, userAnswers, language));
    const groupResults = (service.eligibilityRuleGroups ?? []).map((group) => this.evaluateGroup(group, userAnswers, language));
    const topLevel = [...flatResults, ...groupResults];

    if (topLevel.length === 0) {
      return {
        serviceId: service.id,
        isEligible: false,
        status: 'UNKNOWN',
        score: 0,
        matchedRules: [],
        failedRules: [],
        missingInformationFields: [],
      };
    }

    const state: RuleState = topLevel.some((result) => result.state === 'FAIL')
      ? 'FAIL'
      : topLevel.some((result) => result.state === 'MISSING')
        ? 'MISSING'
        : topLevel.some((result) => result.state === 'UNKNOWN')
          ? 'UNKNOWN'
          : 'PASS';
    const matchedRules = topLevel.flatMap((result) => result.matchedRules);
    const failedRules = topLevel.flatMap((result) => result.failedRules);
    const missingInformationFields = [...new Set(topLevel.flatMap((result) => result.missingFields))];
    const status = state === 'PASS'
      ? service.eligibilityRulesComplete === false ? 'UNKNOWN' : 'POTENTIALLY_ELIGIBLE'
      : state === 'FAIL'
        ? 'NOT_ELIGIBLE'
        : state === 'MISSING'
          ? 'MORE_INFORMATION_REQUIRED'
          : 'UNKNOWN';
    const score = Math.round((topLevel.filter((result) => result.state === 'PASS').length / topLevel.length) * 100);

    return {
      serviceId: service.id,
      isEligible: status === 'POTENTIALLY_ELIGIBLE',
      status,
      score,
      matchedRules,
      failedRules,
      missingInformationFields,
    };
  }

  private static evaluateGroup(
    group: EligibilityRuleGroup,
    userAnswers: Record<string, unknown>,
    language: string
  ): Evaluation {
    if (!group.rules.length) return { state: 'UNKNOWN', matchedRules: [], failedRules: [], missingFields: [] };
    const children = group.rules.map((rule) => isRuleGroup(rule)
      ? this.evaluateGroup(rule, userAnswers, language)
      : this.evaluateRule(rule, userAnswers, language));

    if (group.logic === 'OR') {
      const passed = children.filter((child) => child.state === 'PASS');
      if (passed.length) {
        return {
          state: 'PASS',
          matchedRules: passed.flatMap((child) => child.matchedRules),
          failedRules: [],
          missingFields: [],
        };
      }
      const unknown = children.some((child) => child.state === 'UNKNOWN');
      const missing = children.some((child) => child.state === 'MISSING');
      if (missing || unknown) {
        return {
          state: missing ? 'MISSING' : 'UNKNOWN',
          matchedRules: [],
          failedRules: [],
          missingFields: missing ? [...new Set(children.flatMap((child) => child.state === 'MISSING' ? child.missingFields : []))] : [],
        };
      }
      return {
        state: 'FAIL',
        matchedRules: [],
        failedRules: children.flatMap((child) => child.failedRules),
        missingFields: [],
      };
    }

    const state: RuleState = children.some((child) => child.state === 'FAIL')
      ? 'FAIL'
      : children.some((child) => child.state === 'MISSING')
        ? 'MISSING'
        : children.some((child) => child.state === 'UNKNOWN')
          ? 'UNKNOWN'
          : 'PASS';
    return {
      state,
      matchedRules: children.flatMap((child) => child.matchedRules),
      failedRules: children.flatMap((child) => child.failedRules),
      missingFields: children.flatMap((child) => child.missingFields),
    };
  }

  private static evaluateRule(
    rule: EligibilityRule,
    userAnswers: Record<string, unknown>,
    language: string
  ): Evaluation {
    const userValue = userAnswers[rule.field];
    if (userValue === undefined || userValue === null || userValue === '' || userValue === 'prefer_not_to_say') {
      return { state: 'MISSING', matchedRules: [], failedRules: [], missingFields: [rule.field] };
    }

    const passed = this.evaluateCondition(rule, userValue);
    if (passed === undefined) return { state: 'UNKNOWN', matchedRules: [], failedRules: [], missingFields: [] };
    const detail: RuleEvaluationDetail = {
      ruleId: rule.id,
      field: rule.field,
      passed,
      userValue: userValue as string | number | boolean | string[],
      expectedValue: rule.value,
      explanation: translateLocalizedText(language as UserProfileSession['language'], rule.explanation)
        || `Condition for ${rule.field}`,
    };
    return passed
      ? { state: 'PASS', matchedRules: [detail], failedRules: [], missingFields: [] }
      : { state: 'FAIL', matchedRules: [], failedRules: [detail], missingFields: [] };
  }

  private static evaluateCondition(rule: EligibilityRule, userValue: unknown): boolean | undefined {
    switch (rule.operator) {
      case 'equals':
        if (typeof userValue === 'string' && typeof rule.value === 'string') {
          return userValue.trim().toLowerCase() === rule.value.trim().toLowerCase();
        }
        return userValue === rule.value;
      case 'not_equals':
        if (typeof userValue === 'string' && typeof rule.value === 'string') {
          return userValue.trim().toLowerCase() !== rule.value.trim().toLowerCase();
        }
        return userValue !== rule.value;
      case 'greater_than':
        return Number.isFinite(Number(userValue)) && Number.isFinite(Number(rule.value))
          ? Number(userValue) > Number(rule.value) : undefined;
      case 'greater_than_or_equal':
        return Number.isFinite(Number(userValue)) && Number.isFinite(Number(rule.value))
          ? Number(userValue) >= Number(rule.value) : undefined;
      case 'less_than':
        return Number.isFinite(Number(userValue)) && Number.isFinite(Number(rule.value))
          ? Number(userValue) < Number(rule.value) : undefined;
      case 'less_than_or_equal':
        return Number.isFinite(Number(userValue)) && Number.isFinite(Number(rule.value))
          ? Number(userValue) <= Number(rule.value) : undefined;
      case 'between':
      case 'in_range':
        if (!Array.isArray(rule.value) || rule.value.length !== 2) return undefined;
        return Number.isFinite(Number(userValue)) && rule.value.every((value) => Number.isFinite(Number(value)))
          ? Number(userValue) >= Number(rule.value[0]) && Number(userValue) <= Number(rule.value[1])
          : undefined;
      case 'in':
        if (!Array.isArray(rule.value)) return undefined;
        return rule.value.some((value) => String(value).trim().toLowerCase() === String(userValue).trim().toLowerCase());
      case 'not_in':
        if (!Array.isArray(rule.value)) return undefined;
        return !rule.value.some((value) => String(value).trim().toLowerCase() === String(userValue).trim().toLowerCase());
      case 'contains':
        if (!Array.isArray(userValue)) return undefined;
        return userValue.some((value) => String(value).trim().toLowerCase() === String(rule.value).trim().toLowerCase());
      case 'boolean_true':
        return typeof userValue === 'boolean' ? userValue : undefined;
      default:
        return undefined;
    }
  }
}
