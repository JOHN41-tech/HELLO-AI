export const SAFE_PROFILE_FIELDS = [
  'age',
  'gender',
  'state',
  'district',
  'occupation',
  'annualIncome',
  'incomeRange',
  'educationLevel',
  'employmentStatus',
  'businessStatus',
  'businessType',
  'businessLocation',
  'ruralUrban',
  'category',
  'isStudent',
  'isEntrepreneur',
] as const;

export type SafeProfileField = (typeof SAFE_PROFILE_FIELDS)[number];
