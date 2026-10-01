import { GovernmentService, ServiceCategory } from '@/types/service';
import { UserProfileSession, EligibilityResult } from '@/types/session';
import { SAMPLE_GOVERNMENT_SERVICES } from '@/data/services/sample-services';
import { EligibilityEngine } from '@/lib/eligibility/eligibility-engine';

export interface IServiceRepository {
  getAllServices(): Promise<GovernmentService[]>;
  getServiceById(id: string): Promise<GovernmentService | null>;
  searchServices(query: string, category?: ServiceCategory): Promise<GovernmentService[]>;
  checkEligibility(serviceId: string, session: UserProfileSession): Promise<EligibilityResult | null>;
  findBestMatchingService(session: UserProfileSession, query?: string): Promise<{
    service: GovernmentService;
    result: EligibilityResult;
  } | null>;
}

export class MockServiceRepository implements IServiceRepository {
  private services: GovernmentService[] = SAMPLE_GOVERNMENT_SERVICES;

  public async getAllServices(): Promise<GovernmentService[]> {
    return this.services;
  }

  public async getServiceById(id: string): Promise<GovernmentService | null> {
    const service = this.services.find((s) => s.id === id);
    return service || null;
  }

  public async searchServices(
    query: string,
    category?: ServiceCategory
  ): Promise<GovernmentService[]> {
    const q = query.toLowerCase().trim();
    return this.services.filter((s) => {
      const matchCategory = !category || s.category === category;
      if (!matchCategory) return false;

      if (!q) return true;

      const nameMatch = Object.values(s.name).some((n) => n.toLowerCase().includes(q));
      const descMatch = Object.values(s.description).some((d) => d.toLowerCase().includes(q));
      const tagMatch = s.tags.some((t) => t.toLowerCase().includes(q));

      return nameMatch || descMatch || tagMatch;
    });
  }

  public async checkEligibility(
    serviceId: string,
    session: UserProfileSession
  ): Promise<EligibilityResult | null> {
    const service = await this.getServiceById(serviceId);
    if (!service) return null;

    return EligibilityEngine.evaluateService(service, session);
  }

  public async findBestMatchingService(
    session: UserProfileSession,
    query?: string
  ): Promise<{ service: GovernmentService; result: EligibilityResult } | null> {
    let candidateServices = this.services;

    if (query) {
      candidateServices = await this.searchServices(query);
      if (candidateServices.length === 0) {
        candidateServices = this.services;
      }
    }

    let bestMatch: { service: GovernmentService; result: EligibilityResult } | null = null;
    let highestScore = -1;

    for (const service of candidateServices) {
      const result = EligibilityEngine.evaluateService(service, session);
      if (result.score > highestScore) {
        highestScore = result.score;
        bestMatch = { service, result };
      }
    }

    return bestMatch;
  }
}

export const serviceRepository = new MockServiceRepository();
