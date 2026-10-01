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
  });

  it('should search services by keyword', async () => {
    const results = await serviceRepository.searchServices('sewing');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('tn-free-sewing-machine-scheme');
  });

  it('should filter services by category', async () => {
    const results = await serviceRepository.searchServices('', 'education');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('education');
  });
});
