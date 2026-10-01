import { describe, it, expect } from 'vitest';
import { serviceRepository } from '../lib/services/service-repository';

describe('ServiceRepository', () => {
  it('should list all sample services', async () => {
    const services = await serviceRepository.getAllServices();
    expect(services.length).toBeGreaterThan(0);
  });

  it('should find service by ID', async () => {
    const service = await serviceRepository.getServiceById('tn-women-startup-grant');
    expect(service).not.toBeNull();
    expect(service?.id).toBe('tn-women-startup-grant');
    expect(service?.source.verificationStatus).toBe('sample_mock');
    expect(service?.officialUrl).toBe('');
    expect(service?.source.officialUrl).toBe('');
    expect(service?.requiredDocuments).toHaveLength(0);
    expect(service?.applicationSteps).toHaveLength(0);
    expect(service?.eligibilityRules).toHaveLength(0);
  });

  it('does not evaluate eligibility for unverified sample records', async () => {
    const result = await serviceRepository.checkEligibility('tn-women-startup-grant', {
      sessionId: 'unverified-sample-test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: { age: 30, gender: 'female', state: 'Tamil Nadu' },
      answers: {},
      currentStepIndex: 0,
    });
    expect(result).toBeNull();
  });

  it('exposes the sourced PMEGP entry without claiming complete eligibility coverage', async () => {
    const service = await serviceRepository.getServiceById('pmegp-new-enterprise');
    expect(service?.source.verificationStatus).toBe('verified');
    expect(service?.officialUrl).toBe('https://www.jansamarth.in/prime-minister-employment-generation-program-scheme');
    expect(service?.eligibilityRulesComplete).toBe(false);
    expect(service?.requiredDocuments).toHaveLength(0);

    const result = await serviceRepository.checkEligibility('pmegp-new-enterprise', {
      sessionId: 'pmegp-partial-criteria',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: 'en',
      locale: 'en-IN',
      demographics: { age: 30 },
      answers: { businessStatus: 'new' },
      currentStepIndex: 0,
    });
    expect(result?.status).toBe('UNKNOWN');
    expect(result?.isEligible).toBe(false);
  });

  it('should search services by keyword', async () => {
    const results = await serviceRepository.searchServices('sewing');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('tn-free-sewing-machine-scheme');
  });

  it('should match meaningful catalog terms inside natural-language questions', async () => {
    const results = await serviceRepository.searchServices('What is PMEGP?');
    expect(results.some((service) => service.id === 'pmegp-new-enterprise')).toBe(true);
  });

  it('should filter services by category', async () => {
    const results = await serviceRepository.searchServices('', 'education');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('education');
  });
});
