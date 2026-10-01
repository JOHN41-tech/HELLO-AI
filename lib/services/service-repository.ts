import { GovernmentService, ServiceCategory } from '@/types/service';
import { UserProfileSession, EligibilityResult } from '@/types/session';
import { SAMPLE_GOVERNMENT_SERVICES } from '@/data/services/sample-services';
import { VERIFIED_GOVERNMENT_SERVICES } from '@/data/services/verified-services';
import { EligibilityEngine } from '@/lib/eligibility/eligibility-engine';

export interface IServiceRepository {
  getAllServices(): Promise<GovernmentService[]>;
  getServiceById(id: string): Promise<GovernmentService | null>;
  getServicesByCategory(category: ServiceCategory): Promise<GovernmentService[]>;
  searchServices(query: string, category?: ServiceCategory): Promise<GovernmentService[]>;
  checkEligibility(serviceId: string, session: UserProfileSession): Promise<EligibilityResult | null>;
  findBestMatchingService(session: UserProfileSession, query?: string, category?: ServiceCategory): Promise<{
    service: GovernmentService;
    result: EligibilityResult;
  } | null>;
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function toSafeDisplayRecord(service: GovernmentService): GovernmentService {
  if (service.source.verificationStatus === 'verified') return service;
  return {
    ...service,
    officialUrl: '',
    eligibilityRules: [],
    eligibilityRuleGroups: [],
    requiredDocuments: [],
    applicationSteps: [],
    source: { ...service.source, officialUrl: '' },
  };
}

export class MockServiceRepository implements IServiceRepository {
  private services: GovernmentService[] = [...VERIFIED_GOVERNMENT_SERVICES, ...SAMPLE_GOVERNMENT_SERVICES];

  private isAvailable(service: GovernmentService): boolean {
    // Demo records are useful in development and tests, but must never be mistaken for
    // verified government information in a production deployment.
    if (process.env.NODE_ENV === 'production' && service.source.verificationStatus !== 'verified') {
      return false;
    }
    return isSafeHttpsUrl(service.officialUrl) && isSafeHttpsUrl(service.source.officialUrl);
  }

  public async getAllServices(): Promise<GovernmentService[]> {
    return this.services.filter((service) => this.isAvailable(service)).map(toSafeDisplayRecord);
  }

  public async getServiceById(id: string): Promise<GovernmentService | null> {
    const service = this.services.find((candidate) => candidate.id === id && this.isAvailable(candidate));
    return service ? toSafeDisplayRecord(service) : null;
  }

  public async getServicesByCategory(category: ServiceCategory): Promise<GovernmentService[]> {
    return (await this.getAllServices()).filter((service) => service.category === category);
  }

  public async searchServices(query: string, category?: ServiceCategory): Promise<GovernmentService[]> {
    const q = query.toLowerCase().trim();
    const stopWords = new Set(['what', 'which', 'where', 'when', 'how', 'tell', 'about', 'the', 'for', 'and', 'need', 'help']);
    const queryTokens = q
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 2 && !stopWords.has(token));
    return (await this.getAllServices()).filter((service) => {
      if (category && service.category !== category) return false;
      if (!q) return true;

      const searchable = [
        ...Object.values(service.name),
        ...Object.values(service.description),
        ...Object.values(service.targetUsers),
        ...service.tags,
      ].join(' ').toLowerCase();
      // Match meaningful terms inside natural-language questions (for example,
      // "What is PMEGP?") instead of requiring the entire question to be a tag.
      return searchable.includes(q) || queryTokens.some((token) => searchable.includes(token));
    });
  }

  public async checkEligibility(
    serviceId: string,
    session: UserProfileSession
  ): Promise<EligibilityResult | null> {
    const service = await this.getServiceById(serviceId);
    if (!service || service.source.verificationStatus !== 'verified') return null;

    return EligibilityEngine.evaluateService(service, session);
  }

  public async findBestMatchingService(
    session: UserProfileSession,
    query?: string,
    category?: ServiceCategory
  ): Promise<{ service: GovernmentService; result: EligibilityResult } | null> {
    let candidateServices = await this.getAllServices();
    if (category) candidateServices = candidateServices.filter((service) => service.category === category);
    if (query?.trim()) {
      const queryMatches = await this.searchServices(query, category);
      // Category results are still relevant when an English keyword search misses a
      // multilingual or transliterated request; unrelated categories are never included.
      if (queryMatches.length > 0) candidateServices = queryMatches;
      else if (!category) return null;
    }

    let bestMatch: { service: GovernmentService; result: EligibilityResult } | null = null;
    let highestScore = -1;

    for (const service of candidateServices) {
      const result: EligibilityResult = service.source.verificationStatus === 'verified'
        ? EligibilityEngine.evaluateService(service, session)
        : {
            serviceId: service.id,
            isEligible: false,
            status: 'UNKNOWN',
            score: 0,
            matchedRules: [],
            failedRules: [],
            missingInformationFields: [],
          };
      if (result.score > highestScore) {
        highestScore = result.score;
        bestMatch = { service, result };
      }
    }

    return bestMatch;
  }
}

export const serviceRepository = new MockServiceRepository();
