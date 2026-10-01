import { NextRequest, NextResponse } from 'next/server';
import { serviceRepository } from '@/lib/services/service-repository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await serviceRepository.getServiceById(id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (err) {
    console.error('Service GET by ID error:', err);
    return NextResponse.json({ error: 'Failed to retrieve service' }, { status: 500 });
  }
}
