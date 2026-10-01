import { GovernmentService } from '@/types/service';

const janSamarthPmegpUrl = 'https://www.jansamarth.in/prime-minister-employment-generation-program-scheme';

/** Seed verified record: only facts cross-checked on the official JanSamarth scheme page are included. */
export const VERIFIED_GOVERNMENT_SERVICES: GovernmentService[] = [
  {
    id: 'pmegp-new-enterprise',
    name: { en: "Prime Minister's Employment Generation Programme (PMEGP)" },
    category: 'business',
    description: {
      en: 'A bank-financed scheme administered by the Ministry of Micro, Small & Medium Enterprises and implemented nationally by KVIC to support new non-farm micro-enterprises. Project, education, applicant-category, and other conditions apply; review the official scheme page.',
    },
    targetUsers: {
      en: 'Individuals above 18 who are planning a new micro-enterprise; other eligible applicant groups and additional conditions are listed on the official scheme page.',
    },
    languages: ['en'],
    // Only the individual-age and new-project conditions have been modeled. Education thresholds,
    // applicant types, and project-specific rules are intentionally not claimed as a full assessment.
    eligibilityRulesComplete: false,
    eligibilityRules: [
      {
        id: 'pmegp-individual-age',
        field: 'age',
        operator: 'greater_than',
        value: 18,
        explanation: { en: 'The official scheme page says individual applicants must be above 18 years of age.' },
      },
      {
        id: 'pmegp-new-project',
        field: 'businessStatus',
        operator: 'equals',
        value: 'new',
        explanation: { en: 'Only new projects are considered under the scheme information currently verified.' },
      },
    ],
    requiredDocuments: [],
    applicationSteps: [
      {
        stepNumber: 1,
        title: { en: 'Review the official scheme conditions' },
        description: { en: 'Check the current PMEGP eligibility, education, project, and applicant-category conditions on JanSamarth.' },
        userAction: { en: 'Read the official scheme page before relying on any eligibility estimate.' },
        officialPageUrl: janSamarthPmegpUrl,
      },
      {
        stepNumber: 2,
        title: { en: 'Use the official eligibility and application route' },
        description: { en: 'The official scheme page provides a route to check eligibility and begin the application process.' },
        userAction: { en: 'Follow the current instructions linked from the official scheme page.' },
        officialPageUrl: janSamarthPmegpUrl,
      },
    ],
    officialUrl: janSamarthPmegpUrl,
    source: {
      authorityName: 'Ministry of Micro, Small & Medium Enterprises (MoMSME) via JanSamarth',
      officialUrl: janSamarthPmegpUrl,
      lastVerifiedAt: '2026-10-01T00:00:00.000Z',
      verificationStatus: 'verified',
    },
    tags: ['PMEGP', 'business', 'new enterprise', 'micro-enterprise', 'self-employment', 'tailoring', 'loan'],
  },
];
