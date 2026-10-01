import { GovernmentService, EligibilityRule } from '@/types/service';
import { UserProfileSession, EligibilityResult, RuleEvaluationDetail } from '@/types/session';
import { translateLocalizedText } from '@/lib/i18n/localization';

export class EligibilityEngine {
  /**
   * Evaluate eligibility of a session against a specific Government Service.
   */
  public static evaluateService(
    service: GovernmentService,
    session: UserProfileSession
  ): EligibilityResult {
    const userAnswers = {
      ...session.demographics,
      ...session.answers,
    };

    const matchedRules: RuleEvaluationDetail[] = [];
    const failedRules: RuleEvaluationDetail[] = [];
    const missingFields: Set<string> = new Set();

    const lang = session.language || 'en';

    for (const rule of service.eligibilityRules) {
      const userValue = (userAnswers as Record<string, unknown>)[rule.field];

      if (userValue === undefined || userValue === null || userValue === '') {
        missingFields.add(rule.field);
        continue;
      }

      const explanation =
        translateLocalizedText(lang, rule.explanation) || `Condition for ${rule.field}`;

      const passed = this.evaluateRule(rule, userValue);

      const detail: RuleEvaluationDetail = {
        ruleId: rule.id,
        field: rule.field,
        passed,
        userValue: userValue as string | number | boolean | string[],
        expectedValue: rule.value,
        explanation,
      };

      if (passed) {
        matchedRules.push(detail);
      } else {
        failedRules.push(detail);
      }
    }

    const totalRules = service.eligibilityRules.length;
    const evaluatedRules = matchedRules.length + failedRules.length;

    let score = 0;
    if (totalRules > 0) {
      score = Math.round((matchedRules.length / totalRules) * 100);
    } else {
      score = 100;
    }

    const isEligible = failedRules.length === 0 && missingFields.size === 0;

    return {
      serviceId: service.id,
      isEligible,
      score,
      matchedRules,
      failedRules,
      missingInformationFields: Array.from(missingFields),
    };
  }

  private static evaluateRule(rule: EligibilityRule, userValue: unknown): boolean {
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

      case 'greater_than_or_equal':
        return Number(userValue) >= Number(rule.value);

      case 'less_than_or_equal':
        return Number(userValue) <= Number(rule.value);

      case 'in':
        if (Array.isArray(rule.value)) {
          const formattedUserVal = String(userValue).trim().toLowerCase();
          return rule.value.some((val) => String(val).trim().toLowerCase() === formattedUserVal);
        }
        return false;

      case 'contains':
        if (Array.isArray(userValue)) {
          const formattedRuleVal = String(rule.value).trim().toLowerCase();
          return userValue.some((val) => String(val).trim().toLowerCase() === formattedRuleVal);
        }
        return false;

      case 'boolean_true':
        return Boolean(userValue) === true;

      default:
        return false;
    }
  }
}
