import { NextRequest, NextResponse } from 'next/server';
import { serviceRepository } from '@/lib/services/service-repository';
import { ServiceCategory } from '@/types/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = (searchParams.get('category') as ServiceCategory) || undefined;

    const services = await serviceRepository.searchServices(q, category);

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    console.error('Services GET error:', err);
    return NextResponse.json({ error: 'Failed to retrieve services' }, { status: 500 });
  }
}
